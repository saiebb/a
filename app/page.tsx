import { Suspense } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { VacationSummaryCard } from "@/components/vacation-summary"
import { VacationCard } from "@/components/vacation-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle, Calendar, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getServerUser } from "@/lib/server-auth"
import { getUserVacations, getVacationSummary } from "@/lib/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Vacation } from "@/types"
import { getTranslations, getLocale } from "@/lib/i18n/server"
import dashboardTranslations from "@/lib/i18n/messages/dashboard"

function VacationListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <div className="h-2 bg-muted" />
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32 mt-1" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-full mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Welcome component for users who are not logged in
async function WelcomePage() {
  const locale = await getLocale()
  const { t: serverT } = await getTranslations(locale)

  // Custom translation function that uses both server translations and dashboard translations
  const t = (key: string, values?: Record<string, any>) => {
    if (key.startsWith("dashboard.") && dashboardTranslations[locale][key]) {
      // Replace placeholders in the translation
      let translation = dashboardTranslations[locale][key]
      if (values) {
        Object.entries(values).forEach(([k, v]) => {
          translation = translation.replace(`{${k}}`, String(v))
        })
      }
      return translation
    }
    return serverT(key, values)
  }

  return (
    <MainLayout>
      <div className="container py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">{t("onboarding.welcome.title")}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("app.tagline")}
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Button asChild size="lg">
              <Link href="/auth/login">{t("auth.signIn")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signup">{t("auth.createAccount")}</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>{t("welcome.trackVacations")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t("welcome.trackVacationsDesc")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("welcome.requestTimeOff")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t("welcome.requestTimeOffDesc")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("welcome.calendarView")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{t("welcome.calendarViewDesc")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

export default async function Home() {
  // Get translations
  const locale = await getLocale()
  const { t: serverT } = await getTranslations(locale)

  // Custom translation function that uses both server translations and dashboard translations
  const t = (key: string, values?: Record<string, any>) => {
    if (key.startsWith("dashboard.") && dashboardTranslations[locale][key]) {
      // Replace placeholders in the translation
      let translation = dashboardTranslations[locale][key]
      if (values) {
        Object.entries(values).forEach(([k, v]) => {
          translation = translation.replace(`{${k}}`, String(v))
        })
      }
      return translation
    }
    return serverT(key, values)
  }

  // Default values
  let userName = "User"
  let vacations: Vacation[] = []
  let summary = {
    used: 0,
    remaining: 0,
    pending: 0,
    total: 0,
  }
  let error = null

  try {
    // Get the current user directly instead of session
    const user = await getServerUser()

    // If no user is found, show the welcome page
    if (!user) {
      console.log("No authenticated user found, showing welcome page")
      return <WelcomePage />
    }

    // If user is available, fetch their data
    if (user.id) {
      // Get user's name from metadata if available
      userName = user.user_metadata?.name || user.email?.split("@")[0] || "User"

      try {
        // Fetch vacations and summary in parallel with error handling for each
        const vacationsPromise = getUserVacations(user.id).catch((err) => {
          console.error("Error fetching vacations:", err)
          return []
        })

        const summaryPromise = getVacationSummary(user.id).catch((err) => {
          console.error("Error fetching vacation summary:", err)
          return { used: 0, remaining: 0, pending: 0, total: 21 }
        })

        // Wait for both promises to resolve
        const results = await Promise.all([vacationsPromise, summaryPromise])
        vacations = results[0] || []
        summary = results[1] || { used: 0, remaining: 0, pending: 0, total: 21 }
      } catch (fetchError) {
        console.error("Error in data fetching:", fetchError)
        error = t("common.errorMessages.loadVacationData")
      }
    } else {
      // No user ID found, show a more specific error
      error = t("common.errorMessages.userIdNotFound")
    }
  } catch (userError) {
    console.error("Error getting user:", userError)
    error = t("common.errorMessages.verifyAccount")
  }

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("common.error")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{t("dashboard.welcome", { name: userName })}</h1>
              <Link href="/add-vacation">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t("dashboard.newVacation")}
                </Button>
              </Link>
            </div>

            <Tabs defaultValue="upcoming">
              <TabsList>
                <TabsTrigger value="upcoming">{t("dashboard.upcoming")}</TabsTrigger>
                <TabsTrigger value="pending">{t("dashboard.pending")}</TabsTrigger>
                <TabsTrigger value="past">{t("dashboard.past")}</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="space-y-4 mt-4">
                <Suspense fallback={<VacationListSkeleton />}>
                  {vacations.length > 0 ? (
                    vacations.map((vacation) => <VacationCard key={vacation.id} vacation={vacation} />)
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">{t("dashboard.noVacations")}</p>
                      </CardContent>
                    </Card>
                  )}
                </Suspense>
              </TabsContent>
              <TabsContent value="pending" className="space-y-4 mt-4">
                <Suspense fallback={<VacationListSkeleton />}>
                  {vacations.filter((v) => v.status === "pending").length > 0 ? (
                    vacations
                      .filter((v) => v.status === "pending")
                      .map((vacation) => <VacationCard key={vacation.id} vacation={vacation} />)
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">{t("dashboard.noVacations")}</p>
                      </CardContent>
                    </Card>
                  )}
                </Suspense>
              </TabsContent>
              <TabsContent value="past" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">{t("dashboard.noVacations")}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="md:w-1/3 space-y-6">
            <VacationSummaryCard summary={summary} />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("dashboard.quickActions")}</CardTitle>
                <CardDescription>{t("dashboard.quickActionsDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/add-vacation">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t("dashboard.requestVacation")}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/calendar">
                    <Calendar className="mr-2 h-4 w-4" />
                    {t("dashboard.viewCalendar")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
