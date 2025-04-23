import type { Metadata } from "next"
import { SignupForm } from "@/components/auth/signup-form"
import { getServerSession } from "@/lib/server-auth"
import { redirect } from "next/navigation"
import { getTranslations } from "@/lib/i18n/server"
import { getLocale } from "@/lib/i18n/server"

export const metadata: Metadata = {
  title: "Sign Up | AJazati",
  description: "Create a new AJazati account",
}

export default async function SignupPage() {
  // Check if user is already logged in
  const {
    data: { session },
  } = await getServerSession()

  if (session) {
    redirect("/")
  }

  const locale = await getLocale()
  const { t } = await getTranslations(locale)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">{t("app.name", "AJazati")}</h1>
        <p className="text-muted-foreground">{t("app.tagline", "Manage your vacation days efficiently")}</p>
      </div>
      <SignupForm />
    </div>
  )
}
