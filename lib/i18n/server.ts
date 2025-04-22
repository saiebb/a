import { createIntl } from "@formatjs/intl"
import { cookies, headers } from "next/headers"
import { locales, defaultLocale, type Locale } from "./config"

// Import messages from index file
import messages from "./messages"

export async function getLocale(): Promise<Locale> {
  // First check cookies
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get("locale")?.value as Locale | undefined

  if (localeCookie && locales.includes(localeCookie)) {
    return localeCookie
  }

  // Then check Accept-Language header
  const headersList = await headers()
  const acceptLanguage = headersList.get("Accept-Language")

  if (acceptLanguage) {
    // Parse the Accept-Language header
    const browserLocales = acceptLanguage.split(",").map((lang) => lang.split(";")[0].trim().substring(0, 2))

    // Find the first locale that matches our supported locales
    const matchedLocale = browserLocales.find((locale) => locales.includes(locale as Locale)) as Locale | undefined

    if (matchedLocale) {
      return matchedLocale
    }
  }

  // Default fallback
  return defaultLocale
}

export async function getTranslations(passedLocale?: Locale) {
  // Get the current locale from cookies if not passed
  const locale = passedLocale || await getLocale()

  // Ensure we have the messages for the locale
  const localeMessages = messages[locale] || messages[defaultLocale]

  // Create the intl instance
  const intl = createIntl({
    locale: locale,
    messages: localeMessages,
  })

  return {
    t: (id: string, values?: Record<string, any>) => {
      try {
        // Split the ID by dots to handle nested keys
        const keys = id.split('.')
        let result = localeMessages

        // Navigate through the nested keys
        for (const key of keys) {
          if (result && typeof result === 'object' && key in result) {
            result = result[key]
          } else {
            // If key not found, use the default locale as fallback
            if (locale !== defaultLocale) {
              let defaultResult = messages[defaultLocale]
              for (const k of keys) {
                if (defaultResult && typeof defaultResult === 'object' && k in defaultResult) {
                  defaultResult = defaultResult[k]
                } else {
                  defaultResult = null
                  break
                }
              }
              if (typeof defaultResult === 'string') {
                return defaultResult
              }
            }
            // If still not found, use the ID as fallback
            console.error(`Translation missing for: ${id} in locale ${locale}`)
            return id
          }
        }

        // If we found a string, return it
        if (typeof result === 'string') {
          // Handle any values for replacement
          if (values) {
            return Object.entries(values).reduce(
              (str, [key, value]) => str.replace(`{${key}}`, String(value)),
              result
            )
          }
          return result
        }

        // If we didn't find a string, use formatMessage as a fallback
        return intl.formatMessage({ id }, values)
      } catch (error) {
        console.error(`Error formatting translation for: ${id}`, error)
        return id
      }
    },
  }
}
