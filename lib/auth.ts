import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Provider } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Create a singleton Supabase client for client-side components
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const createClient = () => {
  if (!supabaseClient) {
    try {
      supabaseClient = createClientComponentClient<Database>()
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
      throw new Error("Authentication service initialization failed")
    }
  }
  return supabaseClient
}

// Check if user is authenticated
export async function checkUserAuthenticated() {
  try {
    const supabase = createClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error checking authentication status:", error)
      return false
    }

    return !!session
  } catch (error) {
    console.error("Failed to check authentication status:", error)
    return false
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Error getting current user:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Failed to get current user:", error)
    return null
  }
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  try {
    const supabase = createClient()

    // Validate inputs
    if (!email || !password) {
      return {
        data: null,
        error: { message: "Email and password are required" },
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Log error for debugging but return a user-friendly message
      console.error("Sign in error:", error)

      // Provide more specific error messages based on error code
      if (error.message.includes("Email not confirmed")) {
        return {
          data: null,
          error: {
            message: "Email not confirmed. Please check your inbox for a confirmation email or request a new one.",
            code: "EMAIL_NOT_CONFIRMED",
            email: email,
          },
        }
      }

      if (error.message.includes("Invalid login credentials")) {
        return {
          data: null,
          error: { message: "Invalid email or password. Please try again." },
        }
      }

      if (error.message.includes("rate limited")) {
        return {
          data: null,
          error: { message: "Too many login attempts. Please try again later." },
        }
      }

      // Return the original error if no specific handling
      return { data: null, error }
    }

    return { data, error }
  } catch (error) {
    console.error("Unexpected error during sign in:", error)
    return {
      data: null,
      error: { message: "Authentication service is currently unavailable. Please try again later." },
    }
  }
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string, name: string) {
  try {
    const supabase = createClient()

    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (authError) {
      console.error("Sign up error:", authError)
      return { data: null, error: authError }
    }

    // If successful and we have a user, create a record in the users table
    if (authData.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: email,
        name: name,
        total_vacation_days: 21, // Default value
        profile_image_url: null, // Required field but can be null
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      // Also create default user preferences
      await supabase.from("user_preferences").insert({
        user_id: authData.user.id,
        theme: "light",
        language: "en",
        notifications_enabled: true,
        calendar_sync_enabled: false,
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Error creating user profile:", profileError)
        return { data: null, error: profileError }
      }
    }

    return { data: authData, error: null }
  } catch (error) {
    console.error("Unexpected error during sign up:", error)
    return {
      data: null,
      error: { message: "Registration service is currently unavailable. Please try again later." },
    }
  }
}

// Sign in with OAuth provider
export async function signInWithProvider(provider: Provider) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    return { data, error }
  } catch (error) {
    console.error("OAuth sign in error:", error)
    return {
      data: null,
      error: { message: "Authentication service is currently unavailable. Please try again later." },
    }
  }
}

// Sign out
export async function signOut() {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Sign out error:", error)
    }

    return { error }
  } catch (error) {
    console.error("Unexpected error during sign out:", error)
    return { error: { message: "Failed to sign out. Please try again." } }
  }
}

// Reset password
export async function resetPassword(email: string) {
  try {
    const supabase = createClient()

    if (!email) {
      return {
        data: null,
        error: { message: "Email is required" },
      }
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    return { data, error }
  } catch (error) {
    console.error("Password reset error:", error)
    return {
      data: null,
      error: { message: "Password reset service is currently unavailable. Please try again later." },
    }
  }
}

// Update user profile
export async function updateUserProfile(name: string, email: string) {
  try {
    const supabase = createClient()
    const { data: userData, error: userError } = await supabase.auth.updateUser({
      email,
      data: { name },
    })

    if (userError) {
      console.error("Update user error:", userError)
      return { error: userError }
    }

    // Also update the users table
    if (userData.user) {
      const { error: profileError } = await supabase
        .from("users")
        .update({
          name,
          email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userData.user.id)

      if (profileError) {
        console.error("Update profile error:", profileError)
        return { error: profileError }
      }
    }

    return { error: null }
  } catch (error) {
    console.error("Unexpected error during profile update:", error)
    return { error: { message: "Profile update service is currently unavailable. Please try again later." } }
  }
}

// Persist session
export async function persistSession(rememberMe = false) {
  try {
    const supabase = createClient()

    // If rememberMe is true, set session persistence to 'local' (persists indefinitely)
    // Otherwise, use 'session' (persists until browser is closed)
    const persistenceMode = rememberMe ? "local" : "session"

    await supabase.auth.setSession({
      persistSession: persistenceMode === "local",
    })

    return { error: null }
  } catch (error) {
    console.error("Session persistence error:", error)
    return { error: { message: "Failed to set session persistence" } }
  }
}

// Get session data
export async function getSessionData() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Get session error:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Unexpected error getting session:", error)
    return { data: null, error: { message: "Failed to retrieve session data" } }
  }
}

// Add a new function to resend confirmation email
export async function resendConfirmationEmail(email: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    })

    if (error) {
      console.error("Error resending confirmation email:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Confirmation email resent successfully. Please check your inbox.",
    }
  } catch (error) {
    console.error("Unexpected error resending confirmation email:", error)
    return {
      success: false,
      error: "Failed to resend confirmation email. Please try again later.",
    }
  }
}
