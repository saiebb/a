import Link from "next/link"
import { getServerUser } from "@/lib/server-auth"
import { getTranslations, getLocale } from "@/lib/i18n/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CalendarDays, CheckCircle, Clock, Users } from "lucide-react"
import { getTeamVacationSummary, getPendingVacations } from "@/lib/manager-actions"
import { PendingVacationsList } from "@/components/manager/pending-vacations-list"
import { TeamVacationSummary } from "@/components/manager/team-vacation-summary"

export default async function ManagerDashboard() {
  // الحصول على المستخدم الحالي
  const user = await getServerUser()

  // الحصول على الترجمات
  const locale = await getLocale()
  const { t } = await getTranslations(locale)

  // الحصول على ملخص إجازات الفريق
  const teamSummary = await getTeamVacationSummary(user?.id)

  // الحصول على طلبات الإجازة المعلقة
  const pendingVacations = await getPendingVacations(user?.id)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("manager.dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("manager.dashboard.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/manager/team">
              <Users className="mr-2 h-4 w-4" />
              {t("manager.dashboard.viewTeam")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/calendar">
              <CalendarDays className="mr-2 h-4 w-4" />
              {t("manager.dashboard.viewCalendar")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t("manager.dashboard.teamMembers")}</CardTitle>
            <CardDescription>{t("manager.dashboard.totalTeamMembers")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teamSummary.totalMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t("manager.dashboard.pendingRequests")}</CardTitle>
            <CardDescription>{t("manager.dashboard.awaitingApproval")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingVacations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t("manager.dashboard.upcomingVacations")}</CardTitle>
            <CardDescription>{t("manager.dashboard.nextSevenDays")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teamSummary.upcomingVacations}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t("manager.dashboard.pendingApprovals")}</CardTitle>
            <CardDescription>{t("manager.dashboard.pendingApprovalsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingVacations.length > 0 ? (
              <PendingVacationsList vacations={pendingVacations} />
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>{t("manager.dashboard.noPendingRequests")}</AlertTitle>
                <AlertDescription>
                  {t("manager.dashboard.noPendingRequestsDescription")}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t("manager.dashboard.teamSummary")}</CardTitle>
            <CardDescription>{t("manager.dashboard.teamSummaryDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <TeamVacationSummary summary={teamSummary} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("manager.dashboard.quickActions")}</CardTitle>
            <CardDescription>{t("manager.dashboard.quickActionsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto py-4 justify-start">
                <Link href="/manager/team">
                  <Users className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">{t("manager.dashboard.viewTeamMembers")}</div>
                    <div className="text-sm text-muted-foreground">{t("manager.dashboard.viewTeamMembersDescription")}</div>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 justify-start">
                <Link href="/manager/pending">
                  <Clock className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">{t("manager.dashboard.reviewRequests")}</div>
                    <div className="text-sm text-muted-foreground">{t("manager.dashboard.reviewRequestsDescription")}</div>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 justify-start">
                <Link href="/calendar">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">{t("manager.dashboard.teamCalendar")}</div>
                    <div className="text-sm text-muted-foreground">{t("manager.dashboard.teamCalendarDescription")}</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
