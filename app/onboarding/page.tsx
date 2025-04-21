"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, PlusCircle, PieChart, Calendar, ArrowRight, ArrowLeft } from "lucide-react"
import { setCookie } from "cookies-next"
import { useLanguage } from "@/lib/i18n/client"
import { useTranslations } from "@/hooks/use-translations"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeSelector } from "@/components/theme-selector"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const { isRTL } = useLanguage()
  const { t } = useTranslations()

  // Define all steps including language and theme selection
  const totalSteps = 6

  // Set onboarding completion cookie when component mounts
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== "undefined") {
      // Set a cookie to mark that onboarding has been shown
      setCookie("onboardingShown", "true", {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      })
    }
  }, [])

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else {
      // Set onboarding completion cookie before redirecting
      setCookie("onboardingCompleted", "true", {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
      })

      // Redirect to home page
      router.push("/")
    }
  }

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleSkip = () => {
    // Set onboarding completion cookie before skipping
    setCookie("onboardingCompleted", "true", {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    })

    router.push("/")
  }

  const variants = {
    hidden: { opacity: 0, x: isRTL ? -50 : 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: isRTL ? 50 : -50 },
  }

  // Content steps (after language and theme selection)
  const contentSteps = [
    {
      title: t("onboarding.welcome.title", "Welcome to Jazati"),
      description: t(
        "onboarding.welcome.description",
        "The optimal vacation management app to organize and track your vacations with ease",
      ),
      icon: (
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 bg-primary/30 rounded-full"></div>
          <div className="absolute inset-4 flex items-center justify-center">
            <Calendar className="h-16 w-16 text-primary" />
          </div>
        </div>
      ),
    },
    {
      title: t("onboarding.addVacation.title", "Add New Vacation"),
      description: t(
        "onboarding.addVacation.description",
        "You can easily add a new vacation by selecting the type, date, and adding notes",
      ),
      icon: (
        <div className="relative w-48 h-48 mx-auto mb-6">
          <div className="absolute top-0 left-0 right-0 h-12 bg-primary/10 rounded-t-lg flex items-center px-4">
            <div className="w-24 h-4 bg-primary/20 rounded-full"></div>
          </div>
          <div className="absolute top-16 left-4 right-4 flex flex-col gap-3">
            <div className="w-full h-8 bg-primary/20 rounded-md"></div>
            <div className="flex gap-3">
              <div className="w-1/2 h-8 bg-primary/20 rounded-md"></div>
              <div className="w-1/2 h-8 bg-primary/20 rounded-md"></div>
            </div>
            <div className="w-full h-16 bg-primary/20 rounded-md"></div>
            <div className="w-full h-10 bg-primary rounded-md mt-2 flex items-center justify-center">
              <PlusCircle className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("onboarding.insights.title", "Statistics and Insights"),
      description: t(
        "onboarding.insights.description",
        "Get detailed insights and statistics about your vacation usage and distribution throughout the year",
      ),
      icon: (
        <div className="relative w-48 h-48 mx-auto mb-6">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 p-4 w-full">
              <div className="bg-white/80 rounded-lg p-3 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-primary/20 mb-2 flex items-center justify-center">
                  <PieChart className="h-4 w-4 text-primary" />
                </div>
                <div className="w-full h-2 bg-primary/20 rounded-full"></div>
                <div className="w-3/4 h-2 bg-primary/20 rounded-full mt-1"></div>
              </div>
              <div className="bg-white/80 rounded-lg p-3 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-primary/20 mb-2 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="w-full h-2 bg-primary/20 rounded-full"></div>
                <div className="w-3/4 h-2 bg-primary/20 rounded-full mt-1"></div>
              </div>
              <div className="bg-white/80 rounded-lg p-3 shadow-sm col-span-2">
                <div className="flex justify-between mb-2">
                  <div className="w-16 h-2 bg-primary/20 rounded-full"></div>
                  <div className="w-8 h-2 bg-primary/20 rounded-full"></div>
                </div>
                <div className="flex items-end h-12 gap-1">
                  {[40, 20, 60, 30, 80, 50, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("onboarding.getStarted.title", "Let's Get Started"),
      description: t(
        "onboarding.getStarted.description",
        "You are now ready to use the Jazati app. Click the button below to start managing your vacations",
      ),
      icon: (
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ArrowRight className="h-16 w-16 text-primary animate-bounce" />
          </div>
        </div>
      ),
    },
  ]

  // Render the appropriate step content
  const renderStepContent = () => {
    // Language selection step
    if (step === 0) {
      return <LanguageSelector onComplete={handleNext} showSkip={true} />
    }

    // Theme selection step
    if (step === 1) {
      return <ThemeSelector onComplete={handleNext} showSkip={true} />
    }

    // Content steps (2-5)
    const contentStep = contentSteps[step - 2]
    if (contentStep) {
      return (
        <Card className="w-full max-w-md overflow-hidden">
          <CardContent className="p-0">
            <div className="h-2 bg-primary"></div>
            <div className="p-6">
              <div className="flex justify-between mb-8">
                <div className="flex gap-1">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-1 rounded-full ${
                        i === step ? "bg-primary" : i < step ? "bg-primary/50" : "bg-muted"
                      }`}
                    ></div>
                  ))}
                </div>
                {step < totalSteps - 1 && (
                  <Button variant="ghost" size="sm" onClick={handleSkip}>
                    {t("common.skip", "Skip")}
                  </Button>
                )}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={variants}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {contentStep.icon}
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">{contentStep.title}</h2>
                    <p className="text-muted-foreground">{contentStep.description}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between mt-10">
                <Button variant="outline" onClick={handlePrevious}>
                  {isRTL ? (
                    <>
                      {t("common.previous", "Previous")}
                      <ChevronRight className="h-4 w-4 mr-2" />
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      {t("common.previous", "Previous")}
                    </>
                  )}
                </Button>
                <Button onClick={handleNext} className="group">
                  {step === totalSteps - 1 ? (
                    <>
                      {t("common.start", "Start Now")}
                      <motion.div
                        className={isRTL ? "mr-2" : "ml-2"}
                        initial={{ x: 0 }}
                        animate={{ x: [0, isRTL ? -5 : 5, 0] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                      >
                        {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                      </motion.div>
                    </>
                  ) : (
                    <>
                      {t("common.next", "Next")}
                      {isRTL ? <ChevronLeft className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">{renderStepContent()}</div>
    </div>
  )
}

