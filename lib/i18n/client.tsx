"use client"
/** @jsxImportSource react */

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { setCookie, getCookie } from "cookies-next"
import { type Locale, defaultLocale, locales, getDirection } from "./config"

type LanguageContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  direction: "ltr" | "rtl"
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  direction: "ltr",
  isRTL: false,
})

export const useLanguage = () => useContext(LanguageContext)

type LanguageProviderProps = {
  children: ReactNode
  initialLocale?: Locale
}

export const LanguageProvider = ({ children, initialLocale = defaultLocale }: LanguageProviderProps) => {
  const router = useRouter()
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const direction = getDirection(locale)
  const isRTL = direction === "rtl"

  useEffect(() => {
    // On mount, check for stored locale in cookies
    const storedLocale = getCookie("locale") as Locale | undefined
    if (storedLocale && locales.includes(storedLocale)) {
      setLocaleState(storedLocale)
    } else {
      // Try to detect browser language
      const browserLocale = detectBrowserLocale()
      if (browserLocale && browserLocale !== locale) {
        setLocaleState(browserLocale)
      }
    }
  }, [])

  useEffect(() => {
    // Update document direction when locale changes
    document.documentElement.dir = direction
    document.documentElement.lang = locale
  }, [locale, direction])

  const setLocale = (newLocale: Locale) => {
    if (newLocale !== locale && locales.includes(newLocale)) {
      setLocaleState(newLocale)
      setCookie("locale", newLocale, { maxAge: 60 * 60 * 24 * 365 }) // 1 year

      // Refresh the page to apply the new locale
      router.refresh()
    }
  }

  const detectBrowserLocale = (): Locale | undefined => {
    if (typeof window === "undefined") return undefined

    // Get browser language
    const browserLang = navigator.language.split("-")[0]

    // Check if it's one of our supported locales
    const matchedLocale = locales.find((locale) => locale === browserLang) as Locale | undefined
    return matchedLocale
  }

  return <LanguageContext.Provider value={{ locale, setLocale, direction, isRTL }}>{children}</LanguageContext.Provider>
}
