import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"
import { createServerClient } from "@/lib/server-auth"
import { redirect } from "next/navigation"
import { getTranslations } from "@/lib/i18n/server"
import { getLocale } from "@/lib/i18n/server"

export const metadata: Metadata = {
  title: "Login | AJazati",
  description: "Login to your AJazati account",
}

// استخدام نمط الوسيط لتجنب مشاكل searchParams في Next.js 15
export default async function LoginPage(props: any) {
  // Get translations
  const locale = await getLocale()
  const { t } = await getTranslations(locale)

  // تعريف قيم افتراضية
  let error: string | null = null
  let redirectTo: string = "/"

  try {

    // Create a server-side Supabase client
    const supabase = await createServerClient()

    // Check if user is already logged in - use getSession for more reliable results
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // If user is authenticated and there's no error parameter, redirect to home page
    if (session?.user && !error) {
      console.log("User already authenticated, redirecting to home")
      redirect(redirectTo)
    }

    // If there was a session error, log it but continue to show the login page
    if (sessionError) {
      console.error("Session error in login page:", sessionError)
      // We don't redirect here, just show the login page
    }
  } catch (err) {
    // Log any unexpected errors but don't crash
    console.error("Unexpected error in login page:", err)
    // Continue to show the login page
  }

  // إنشاء مكون وسيط للتعامل مع البيانات بشكل آمن
  function LoginPageContent({ error, redirectTo }: { error: string | null, redirectTo: string }) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">{t("app.name")}</h1>
          <p className="text-muted-foreground">{t("app.tagline")}</p>
        </div>
        <LoginForm error={error} redirectTo={redirectTo} />
      </div>
    )
  }

  // إرجاع المكون الوسيط
  return <LoginPageContent error={error} redirectTo={redirectTo} />
}
