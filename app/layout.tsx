import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/i18n/client"
import { getLocale } from "@/lib/i18n/server"

// Define IBM Plex Sans Arabic font with all available weights
const ibmPlexSansArabic = localFont({
  src: [
    {
      path: '../public/fonts/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../public/fonts/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-ExtraLight.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/IBM_Plex_Sans_Arabic/IBMPlexSansArabic-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-ibm-plex-sans-arabic',
})

export const metadata: Metadata = {
  title: "Jazati - My Vacation",
  description: "Manage your vacation days efficiently",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={ibmPlexSansArabic.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
