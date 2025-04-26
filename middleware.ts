import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

export async function middleware(request: NextRequest) {
  try {
    // Create a response object that we'll return at the end
    const response = NextResponse.next()

    // Get the pathname from the request
    const { pathname, searchParams } = request.nextUrl

    // Define public routes that don't require authentication
    const publicRoutes = [
      "/auth/login",
      "/auth/signup",
      "/auth/forgot-password",
      "/auth/callback",
      "/auth/reset-password",
    ]
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

    // Define static assets and API routes that should bypass auth checks
    const bypassRoutes = [
      "/_next",
      "/api",
      "/favicon.ico",
      "/images",
      "/fonts",
    ]
    const shouldBypass = bypassRoutes.some((route) => pathname.startsWith(route))

    // Skip middleware for static assets and API routes
    if (shouldBypass) {
      return response
    }

    // Create a Supabase client for the middleware
    // In Next.js 15, we need to be more careful with cookies
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    )

    // Check if the user is authenticated - use getSession() for middleware
    // This is more reliable in middleware context
    const {
      data: { session: authSession },
      error,
    } = await supabase.auth.getSession()

    // Get user from session if available
    const user = authSession?.user || null

    if (error) {
      console.error("Middleware auth error:", error)
      // If there's an auth error and this is not a public route, redirect to login
      if (!isPublicRoute) {
        const redirectUrl = new URL("/auth/login", request.url)
        redirectUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(redirectUrl)
      }
      // Otherwise continue to the requested page
      return response
    }

    // Create a session-like object for backward compatibility
    const session = user ? { user } : null

    // Handle error query parameter for login page
    const errorParam = searchParams.get("error")

    // Define admin routes
    const isAdminRoute = pathname.startsWith("/admin")

    // Define manager routes
    const isManagerRoute = pathname.startsWith("/manager")

    // Define super admin routes
    const isSuperAdminRoute = pathname.startsWith("/super-admin")

    // Check if onboarding has been completed
    const onboardingCompleted = request.cookies.get("onboardingCompleted")?.value === "true"

    // Check if onboarding has been shown (to prevent infinite redirects)
    const onboardingShown = request.cookies.get("onboardingShown")?.value === "true"

    // If user is not authenticated and trying to access a protected route
    if (!session && !isPublicRoute) {
      // Store the original URL to redirect back after login
      const redirectUrl = new URL("/auth/login", request.url)
      redirectUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is authenticated and trying to access auth routes
    if (session && isPublicRoute && !errorParam) {
      // Don't redirect if there's an error parameter
      console.log("Middleware: User is authenticated and trying to access auth route, redirecting to home")

      // Get the user's role to determine where to redirect them
      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single()

        // Special case for muhammadelshora@outlook.com
        if (session.user.email === "muhammadelshora@outlook.com") {
          console.log("Middleware: Special case for muhammadelshora@outlook.com, redirecting to super-admin")
          return NextResponse.redirect(new URL("/super-admin", request.url))
        }

        if (!userError && userData) {
          // Redirect based on role
          switch (userData.role) {
            case "super_admin":
              return NextResponse.redirect(new URL("/super-admin", request.url))
            case "admin":
              return NextResponse.redirect(new URL("/admin", request.url))
            case "manager":
              return NextResponse.redirect(new URL("/manager", request.url))
            default:
              return NextResponse.redirect(new URL("/", request.url))
          }
        }
      } catch (roleError) {
        console.error("Error determining role for redirect:", roleError)
      }

      // Default redirect if role determination fails
      return NextResponse.redirect(new URL("/", request.url))
    }

    // If this is the root path and onboarding hasn't been completed yet
    if (session && pathname === "/" && !onboardingCompleted && !onboardingShown) {
      // Redirect to onboarding
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }

    // Check user role for admin routes
    if (session && isAdminRoute) {
      // Get user role from database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (userError || !userData || (userData.role !== "admin" && userData.role !== "super_admin")) {
        console.log("Access denied to admin route for user:", session.user.id, "with role:", userData?.role)
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    // Check user role for manager routes
    if (session && isManagerRoute) {
      // Get user role from database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (userError || !userData || (userData.role !== "manager" && userData.role !== "admin" && userData.role !== "super_admin")) {
        console.log("Access denied to manager route for user:", session.user.id, "with role:", userData?.role)
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    // Check user role for super admin routes
    if (session && isSuperAdminRoute) {
      // Special case for muhammadelshora@outlook.com
      if (session.user.email === "muhammadelshora@outlook.com") {
        console.log("Middleware: Special case for muhammadelshora@outlook.com, allowing access to super-admin")
        return response
      }

      // Get user role from database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (userError || !userData || userData.role !== "super_admin") {
        console.log("Access denied to super admin route for user:", session.user.id, "with role:", userData?.role)
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    // In case of error, continue to the requested page
    // The page-level authentication checks will handle authentication if needed
    return NextResponse.next()
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
