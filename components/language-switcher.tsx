"use client"

import { useLanguage } from "@/lib/i18n/client"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { localeNames, type Locale } from "@/lib/i18n/config"
import { createClient } from "@/lib/auth"

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()

  const toggleLanguage = async () => {
    // Toggle between Arabic and English
    const newLocale = locale === "en" ? "ar" : "en"
    setLocale(newLocale)

    // Try to save preference to database if user is logged in
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // Check if user has preferences
        const { data: prefs } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle()

        if (prefs) {
          // Update existing preferences
          await supabase
            .from("user_preferences")
            .update({
              language: newLocale,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", session.user.id)
        }
      }
    } catch (error) {
      // Silent fail - still toggle language locally
      console.error("Error saving language preference:", error)
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage}>
      <Globe className="h-5 w-5" />
      <span className="sr-only">
        {locale === "en" ? "تبديل إلى العربية" : "Switch to English"}
      </span>
    </Button>
  )
}
