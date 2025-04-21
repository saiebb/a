"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check, Moon, Sun, Monitor } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "@/hooks/use-translations"

interface ThemeSelectorProps {
  onComplete?: () => void
  showSkip?: boolean
  showTitle?: boolean
}

export function ThemeSelector({ onComplete, showSkip = false, showTitle = true }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<string>(theme || "system")
  const { t } = useTranslations()

  // Update selected theme when theme changes
  useEffect(() => {
    if (theme) {
      setSelectedTheme(theme)
    }
  }, [theme])

  const handleChange = (value: string) => {
    setSelectedTheme(value)
  }

  const handleSubmit = () => {
    setTheme(selectedTheme)
    if (onComplete) {
      onComplete()
    }
  }

  const themes = [
    {
      id: "light",
      name: t("settings.lightMode", "Light Mode"),
      description: t("settings.lightModeDescription", "Bright theme for daytime use"),
      icon: <Sun className="h-5 w-5" />,
    },
    {
      id: "dark",
      name: t("settings.darkMode", "Dark Mode"),
      description: t("settings.darkModeDescription", "Dark theme for nighttime use"),
      icon: <Moon className="h-5 w-5" />,
    },
    {
      id: "system",
      name: t("settings.systemTheme", "System Theme"),
      description: t("settings.systemThemeDescription", "Follow your system preferences"),
      icon: <Monitor className="h-5 w-5" />,
    },
  ]

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        {showTitle && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{t("settings.selectTheme", "Select Theme")}</h2>
            <p className="text-muted-foreground">
              {t("settings.selectThemeDescription", "Choose your preferred theme")}
            </p>
          </div>
        )}

        <RadioGroup value={selectedTheme} onValueChange={handleChange} className="grid gap-4">
          {themes.map((themeOption) => (
            <div key={themeOption.id} className="relative">
              <RadioGroupItem value={themeOption.id} id={`theme-${themeOption.id}`} className="peer sr-only" />
              <Label
                htmlFor={`theme-${themeOption.id}`}
                className="flex items-center justify-between p-4 border rounded-md cursor-pointer transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                    {themeOption.icon}
                  </div>
                  <div>
                    <div className="font-medium">{themeOption.name}</div>
                    <div className="text-sm text-muted-foreground">{themeOption.description}</div>
                  </div>
                </div>
                {selectedTheme === themeOption.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between mt-6">
          {showSkip ? (
            <Button variant="ghost" onClick={onComplete}>
              {t("common.skip", "Skip")}
            </Button>
          ) : (
            <div></div>
          )}
          <Button onClick={handleSubmit}>{t("common.continue", "Continue")}</Button>
        </div>
      </CardContent>
    </Card>
  )
}
