import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "./supabase-server"
import type { Database } from "@/types/database"

// Create a Supabase client for server components
export const createServerClient = async () => {
  try {
    return await createServerSupabaseClient()
  } catch (error) {
    console.error("Failed to create server Supabase client:", error)
    throw new Error("Authentication service initialization failed")
  }
}

// Get the current session on the server
export async function getServerSession() {
  try {
    const supabase = await createServerClient()
    return await supabase.auth.getSession()
  } catch (error) {
    console.error("Failed to get server session:", error)
    return { data: { session: null }, error }
  }
}

// Get the current user on the server with full profile data
export async function getServerUser() {
  try {
    const supabase = await createServerClient()

    // Use getUser() instead of getSession() for better security
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error("Error getting server user:", error)
      return null
    }

    if (!user) {
      console.log("No authenticated user found")
      return null
    }

    console.log("Authenticated user found:", user.id)

    // Get user data from the database to include role information
    // First try to find by ID
    let { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    // If not found by ID, try to find by email
    if (userError && user.email) {
      console.log("User not found by ID, trying to find by email")
      const { data: userByEmail, error: emailError } = await supabase
        .from("users")
        .select("*")
        .eq("email", user.email)
        .single()

      if (!emailError) {
        userData = userByEmail
        userError = null
      }
    }

    if (userError) {
      console.error("Error fetching user data:", userError, "for user ID:", user.id, "and email:", user.email)
      // Don't return just the auth user, as it won't have the role information
      // Instead, try to create a user record if it doesn't exist
      if (user.email) {
        console.log("Attempting to create user record for:", user.email)
        try {
          // Create a user object with the required fields
          const newUserData = {
            // Don't include id in the insert as it's auto-generated
            email: user.email,
            name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
            total_vacation_days: 21,
            profile_image_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: "user" // Default role
          }

          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert(newUserData)
            .select()
            .single()

          if (createError) {
            console.error("Error creating user record:", createError)
            return user
          }

          // Create a merged user object with both auth and database properties
          const mergedUser = { ...user } as any
          if (newUser) {
            Object.assign(mergedUser, newUser)
          }

          return mergedUser
        } catch (insertError) {
          console.error("Exception creating user record:", insertError)
          return user
        }
      }
      return user
    }

    // حالة خاصة للمستخدم muhammadelshora@outlook.com
    if (user.email === "muhammadelshora@outlook.com") {
      console.log("Special case detected in getServerUser: muhammadelshora@outlook.com")
      const specialUser = { ...user } as any
      // إضافة دور super_admin للمستخدم الخاص
      specialUser.role = "super_admin"

      // إذا كان هناك بيانات مستخدم من قاعدة البيانات، قم بدمجها
      if (userData) {
        Object.assign(specialUser, userData)
        // تأكد من أن الدور لا يزال super_admin بعد الدمج
        specialUser.role = "super_admin"
      }

      console.log("Returning special user with role:", specialUser.role)
      return specialUser
    }

    // Merge the auth user with the database user data
    const mergedUser = { ...user } as any
    if (userData) {
      Object.assign(mergedUser, userData)
    }
    return mergedUser
  } catch (error) {
    console.error("Unexpected error getting server user:", error)
    return null
  }
}

// Require authentication for a server component
export async function requireAuth() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.error("Authentication required but user not found:", error)
      // Instead of throwing an error, use the redirect function
      redirect("/auth/login")
    }

    return user
  } catch (error) {
    console.error("Unexpected error in requireAuth:", error)
    // If the error is a redirect, let it propagate
    throw error
  }
}

// Get user profile data from the users table
export async function getUserProfile(userId: string) {
  try {
    if (!userId) {
      console.error("getUserProfile called with empty userId")
      return null
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase.from("users").select("*").eq("id", userId as any).single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Unexpected error fetching user profile:", error)
    return null
  }
}

// Get user preferences
export async function getUserPreferences(userId: string) {
  try {
    if (!userId) {
      console.error("getUserPreferences called with empty userId")
      return null
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId as any).single()

    if (error) {
      console.error("Error fetching user preferences:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Unexpected error fetching user preferences:", error)
    return null
  }
}

// Check if user exists in the database
export async function checkUserExists(userId: string) {
  try {
    if (!userId) return false

    const supabase = await createServerClient()

    const { data, error } = await supabase.from("users").select("id").eq("id", userId as any).single()

    if (error || !data) {
      return false
    }

    return true
  } catch (error) {
    console.error("Error checking if user exists:", error)
    return false
  }
}
