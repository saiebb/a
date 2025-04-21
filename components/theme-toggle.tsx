"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/auth"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)

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
              theme: newTheme,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", session.user.id)
        }
      }
    } catch (error) {
      // Silent fail - still toggle theme locally
      console.error("Error saving theme preference:", error)
    }
  }

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) return null

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
