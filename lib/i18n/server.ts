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

  const intl = createIntl({
    locale: locale,
    messages: messages[locale] || messages[defaultLocale],
  })

  return {
    t: (id: string, values?: Record<string, any>) => {
      try {
        return intl.formatMessage({ id }, values)
      } catch (error) {
        console.error(`Translation missing for: ${id}`)
        return id
      }
    },
  }
}
