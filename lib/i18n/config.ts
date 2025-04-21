export type Locale = "en" | "ar"

export const defaultLocale: Locale = "en"

export const locales: Locale[] = ["en", "ar"]

export const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
}

export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
}

export const getDirection = (locale: Locale): "ltr" | "rtl" => {
  return localeDirections[locale] || "ltr"
}

export const isRTL = (locale: Locale): boolean => {
  return getDirection(locale) === "rtl"
}
