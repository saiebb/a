import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/database"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const error = requestUrl.searchParams.get("error")
    const errorDescription = requestUrl.searchParams.get("error_description")
    const type = requestUrl.searchParams.get("type")

    // Handle email confirmation specifically
    if (type === "email_confirmation" || type === "signup") {
      // Crear un cliente de Supabase para el manejador de rutas
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storage: {
              getItem: (key: string) => {
                const cookieStore = cookies()
                const cookie = cookieStore.get(key)
                return cookie?.value ?? null
              },
              setItem: (key: string, value: string) => {
                const cookieStore = cookies()
                cookieStore.set(key, value)
              },
              removeItem: (key: string) => {
                const cookieStore = cookies()
                cookieStore.set(key, "", { maxAge: 0 })
              },
            },
          },
        }
      )

      if (code) {
        // Exchange the code for a session
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

        if (sessionError) {
          console.error("Email confirmation error:", sessionError)
          return NextResponse.redirect(
            new URL(
              `/auth/login?error=${encodeURIComponent("Failed to confirm email. Please try again.")}`,
              request.url,
            ),
          )
        }

        // Check if the user exists in the users table
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Check if user exists in our users table
          const { data: existingUser } = await supabase.from("users").select("id").eq("id", user.id).single()

          if (!existingUser) {
            // Create user record if it doesn't exist
            const userData = {
              id: user.id,
              email: user.email,
              name: user.user_metadata.full_name || user.user_metadata.name || user.email?.split("@")[0] || "User",
              total_vacation_days: 21, // Default value
              profile_image_url: null, // Required field but can be null
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }

            await supabase.from("users").insert(userData)

            // Also create default user preferences
            await supabase.from("user_preferences").insert({
              user_id: user.id,
              theme: "light",
              language: "en",
              notifications_enabled: true,
              calendar_sync_enabled: false,
              updated_at: new Date().toISOString(),
            })

            // Redirect to onboarding for new users
            return NextResponse.redirect(new URL("/onboarding", request.url))
          }

          // Redirect to home for existing users
          return NextResponse.redirect(new URL("/", request.url))
        }
      }

      // If there was an error or no user, redirect to login with error
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(errorDescription || "Failed to confirm email. Please try again.")}`,
          request.url,
        ),
      )
    }

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error, errorDescription)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(errorDescription || "Authentication failed")}`, request.url),
      )
    }

    if (!code) {
      console.error("No code provided in OAuth callback")
      return NextResponse.redirect(new URL("/auth/login?error=Authentication failed", request.url))
    }

    // Crear un cliente de Supabase para el manejador de rutas
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          storage: {
            getItem: (key: string) => {
              const cookieStore = cookies()
              const cookie = cookieStore.get(key)
              return cookie?.value ?? null
            },
            setItem: (key: string, value: string) => {
              const cookieStore = cookies()
              cookieStore.set(key, value)
            },
            removeItem: (key: string) => {
              const cookieStore = cookies()
              cookieStore.set(key, "", { maxAge: 0 })
            },
          },
        },
      }
    )

    // Exchange the code for a session
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error("Session exchange error:", sessionError)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(sessionError.message)}`, request.url),
      )
    }

    // Check if the user exists in the users table
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("No user found after OAuth authentication")
      return NextResponse.redirect(new URL("/auth/login?error=Authentication failed", request.url))
    }

    // Check if user exists in our users table
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single()

    if (userCheckError && userCheckError.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error checking user existence:", userCheckError)
    }

    // If user doesn't exist in our table, create a record
    if (!existingUser) {
      const userData = {
        id: user.id,
        email: user.email,
        name: user.user_metadata.full_name || user.user_metadata.name || user.email?.split("@")[0] || "User",
        total_vacation_days: 21, // Default value
        profile_image_url: null, // Required field but can be null
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: insertError } = await supabase.from("users").insert(userData)

      if (insertError) {
        console.error("Error creating user record:", insertError)
        return NextResponse.redirect(new URL("/auth/login?error=Failed to create user profile", request.url))
      }

      // Also create default user preferences
      const { error: preferencesError } = await supabase.from("user_preferences").insert({
        user_id: user.id,
        theme: "light",
        language: "en",
        notifications_enabled: true,
        calendar_sync_enabled: false,
        updated_at: new Date().toISOString(),
      })

      if (preferencesError) {
        console.error("Error creating user preferences:", preferencesError)
      }

      // Redirect to onboarding for new users
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }
  } catch (error) {
    console.error("Unexpected error in OAuth callback:", error)
    return NextResponse.redirect(new URL("/auth/login?error=Authentication service error", request.url))
  }

  // Redirect to the home page for existing users
  return NextResponse.redirect(new URL("/", request.url))
}
