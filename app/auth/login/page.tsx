import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { getTranslations } from "@/lib/i18n/server"
import { getLocale } from "@/lib/i18n/server"

export const metadata: Metadata = {
  title: "Login | Jazati",
  description: "Login to your Jazati account",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const locale = await getLocale()
  const { t } = await getTranslations(locale)

  // Get error from query params if it exists
  const error = searchParams?.error ? String(searchParams.error) : null
  const redirectTo = searchParams?.redirect ? String(searchParams.redirect) : "/"

  // Create a supabase client for server components
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Check if user is already logged in - don't use try/catch here to avoid catching redirects as errors
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in and there's no error, redirect to home page
  if (session && !error) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">{t("app.name", "Jazati")}</h1>
        <p className="text-muted-foreground">{t("app.tagline", "Manage your vacation days efficiently")}</p>
      </div>
      <LoginForm error={error} redirectTo={redirectTo} />
    </div>
  )
}
