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
    (key: string, valuesOrDefaultMessage?: Record<string, any> | string) => {
      // Handle the case where valuesOrDefaultMessage is a string (used as defaultMessage)
      if (typeof valuesOrDefaultMessage === "string") {
        const defaultMessage = valuesOrDefaultMessage

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
      }

      // Handle the case where valuesOrDefaultMessage is an object (used for parameter substitution)
      const keys = key.split(".")
      let result = messages[locale]

      for (const k of keys) {
        if (result && typeof result === "object" && k in result) {
          result = result[k]
        } else {
          return key
        }
      }

      if (typeof result === "string") {
        // Handle parameter substitution
        if (valuesOrDefaultMessage) {
          let translatedText = result
          Object.entries(valuesOrDefaultMessage).forEach(([k, v]) => {
            translatedText = translatedText.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
          })
          return translatedText
        }
        return result
      }

      return key
    },
    [locale],
  )

  return { t }
}
