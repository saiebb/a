import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res: response })

    // Check if the user is authenticated
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Middleware session error:", error)
      // Continue to the requested page, authentication will be handled there if needed
      return response
    }

    // Get the pathname from the request
    const { pathname, searchParams } = request.nextUrl

    // Handle error query parameter for login page
    const errorParam = searchParams.get("error")

    // Define public routes that don't require authentication
    const publicRoutes = [
      "/auth/login",
      "/auth/signup",
      "/auth/forgot-password",
      "/auth/callback",
      "/auth/reset-password",
    ]
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

    // Define admin routes
    const isAdminRoute = pathname.startsWith("/admin")

    // Define manager routes
    const isManagerRoute = pathname.startsWith("/manager")

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

      if (userError || !userData || userData.role !== "admin") {
        console.log("Access denied to admin route for user:", session.user.id)
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

      if (userError || !userData || (userData.role !== "manager" && userData.role !== "admin")) {
        console.log("Access denied to manager route for user:", session.user.id)
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
