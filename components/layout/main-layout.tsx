"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calendar, Home, PieChart, PlusCircle, Settings, Menu, X, LogOut, User, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/i18n/client.tsx"
import { useTranslations } from "@/hooks/use-translations"
import { motion, AnimatePresence } from "framer-motion"
import { signOut, getCurrentUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [userName, setUserName] = useState<string>("")
  const { isRTL } = useLanguage()
  const { t } = useTranslations()
  const { toast } = useToast()

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      const user = await getCurrentUser()
      if (user?.user_metadata?.name) {
        setUserName(user.user_metadata.name)
      } else if (user?.email) {
        setUserName(user.email.split("@")[0])
      }
    }

    fetchUser()
  }, [])

  // Check scroll position to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSignOut = async () => {
    const { error } = await signOut()

    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
      return
    }

    router.push("/auth/login")
    router.refresh()
  }

  const routes = [
    {
      href: "/",
      label: t("dashboard.title", "Dashboard"),
      icon: <Home className="h-5 w-5" />,
    },
    {
      href: "/add-vacation",
      label: t("vacationForm.title", "Add Vacation"),
      icon: <PlusCircle className="h-5 w-5" />,
    },
    {
      href: "/calendar",
      label: t("calendar.title", "Calendar"),
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      href: "/insights",
      label: t("insights.title", "Insights"),
      icon: <PieChart className="h-5 w-5" />,
    },
    {
      href: "/settings",
      label: t("settings.title", "Settings"),
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl text-primary">{t("app.name", "Jazati")}</span>
        </Link>

        <div className="flex items-center gap-2">
          <NotificationsDropdown />
          <LanguageSwitcher />
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"} className="w-[85vw] max-w-xs sm:max-w-sm">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b pb-4">
                  <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                    <span className="font-bold text-xl text-primary">{t("app.name", "Jazati")}</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>
                <nav className="flex-1 py-4 overflow-y-auto">
                  <ul className="space-y-2">
                    {routes.map((route) => (
                      <li key={route.href}>
                        <Link
                          href={route.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            pathname === route.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          }`}
                        >
                          {route.icon}
                          {route.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="border-t pt-4">
                  <div className="flex items-center gap-3 rounded-md px-3 py-2">
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">{userName || "User"}</span>
                  </div>
                  <Button variant="ghost" className="w-full justify-start gap-3 mt-2" onClick={handleSignOut}>
                    <LogOut className="h-5 w-5" />
                    <span>{t("auth.signOut", "Sign out")}</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="flex flex-1">
        <aside className="hidden w-64 flex-col border-r bg-background md:flex">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-xl text-primary">{t("app.name", "Jazati")}</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-auto py-6 px-4">
            <ul className="space-y-2">
              {routes.map((route) => (
                <li key={route.href}>
                  <Link
                    href={route.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === route.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    {route.icon}
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-md px-3 py-2">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{userName || "User"}</span>
            </div>
            <div className="flex items-center justify-between mt-4 px-3">
              <div className="flex items-center gap-2">
                <NotificationsDropdown />
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">{t("auth.signOut", "Sign out")}</span>
              </Button>
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-auto relative">
          {children}

          {/* Scroll to top button */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="fixed bottom-6 right-6 z-50"
              >
                <Button
                  size="icon"
                  className="rounded-full shadow-lg h-10 w-10"
                  onClick={scrollToTop}
                  aria-label="Scroll to top"
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40">
        <nav className="flex justify-around">
          {routes.slice(0, 4).map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`flex flex-col items-center justify-center py-2 px-3 ${
                pathname === route.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {route.icon}
              <span className="text-xs mt-1">{route.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
