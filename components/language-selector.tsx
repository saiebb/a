"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/i18n/client.tsx"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { locales, localeNames, type Locale } from "@/lib/i18n/config"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

interface LanguageSelectorProps {
  onComplete?: () => void
  showSkip?: boolean
  showTitle?: boolean
}

export function LanguageSelector({ onComplete, showSkip = false, showTitle = true }: LanguageSelectorProps) {
  const { locale, setLocale } = useLanguage()
  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale)

  const handleChange = (value: string) => {
    setSelectedLocale(value as Locale)
  }

  const handleSubmit = () => {
    setLocale(selectedLocale)
    if (onComplete) {
      onComplete()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        {showTitle && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Select Your Language</h2>
            <p className="text-muted-foreground">Choose your preferred language</p>
          </div>
        )}

        <RadioGroup value={selectedLocale} onValueChange={handleChange} className="grid gap-4">
          {locales.map((lang) => (
            <div key={lang} className="relative">
              <RadioGroupItem value={lang} id={`lang-${lang}`} className="peer sr-only" />
              <Label
                htmlFor={`lang-${lang}`}
                className="flex items-center justify-between p-4 border rounded-md cursor-pointer transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {lang.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{localeNames[lang as Locale]}</div>
                    <div className="text-sm text-muted-foreground">
                      {lang === "en" ? "Left to Right" : "Right to Left"}
                    </div>
                  </div>
                </div>
                {selectedLocale === lang && (
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
              Skip
            </Button>
          ) : (
            <div></div>
          )}
          <Button onClick={handleSubmit}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  )
}
