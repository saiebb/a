import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { Database } from "@/types/database"

// Create a Supabase client for server components
export const createServerClient = async () => {
  try {
    const cookieStore = await cookies()
    return createServerComponentClient<Database>({ cookies: () => cookieStore })
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

// Get the current user on the server
export async function getServerUser() {
  try {
    const {
      data: { session },
      error,
    } = await getServerSession()

    if (error) {
      console.error("Error getting server user:", error)
      return null
    }

    if (!session?.user) {
      return null
    }

    // Get user data from the database to include role information
    // First try to find by ID
    const supabase = await createServerClient()
    let { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single()

    // If not found by ID, try to find by email
    if (userError && session.user.email) {
      console.log("User not found by ID, trying to find by email")
      const { data: userByEmail, error: emailError } = await supabase
        .from("users")
        .select("*")
        .eq("email", session.user.email)
        .single()

      if (!emailError) {
        userData = userByEmail
        userError = null
      }
    }

    if (userError) {
      console.error("Error fetching user data:", userError)
      return session.user
    }

    // Merge the auth user with the database user data
    return { ...session.user, ...userData }
  } catch (error) {
    console.error("Unexpected error getting server user:", error)
    return null
  }
}

// Require authentication for a server component
export async function requireAuth() {
  try {
    const {
      data: { session },
    } = await getServerSession()

    if (!session) {
      // Instead of throwing an error, use the redirect function
      redirect("/auth/login")
    }

    return session
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

    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

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

    const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single()

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

    const { data, error } = await supabase.from("users").select("id").eq("id", userId).single()

    if (error || !data) {
      return false
    }

    return true
  } catch (error) {
    console.error("Error checking if user exists:", error)
    return false
  }
}
