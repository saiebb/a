"use client"

import { useCallback } from "react"
import { useLanguage } from "@/lib/i18n/client.tsx"

// Import all message files
import enMessages from "@/lib/i18n/messages/en.json"
import arMessages from "@/lib/i18n/messages/ar.json"

const messages = {
  en: enMessages,
  ar: arMessages,
}

export function useTranslations() {
  const { locale } = useLanguage()

  const t = useCallback(
    (key: string, defaultMessage?: string) => {
      const keys = key.split(".")
      let result = messages[locale]

      for (const k of keys) {
        if (result && typeof result === "object" && k in result) {
          result = result[k]
        } else {
          return defaultMessage || key
        }
      }

      return typeof result === "string" ? result : defaultMessage || key
    },
    [locale],
  )

  return { t }
}
