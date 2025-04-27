import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminStats, getPendingVacations } from "@/lib/admin-actions"
import { AdminHeader } from "@/components/admin/admin-header"
import { PendingVacationsList } from "@/components/admin/pending-vacations-list"
import { Users, Calendar, CheckCircle, XCircle, Clock, BarChart3, PieChart } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { getTranslations, getLocale } from "@/lib/i18n/server"
import { EnhancedBarChart } from "@/components/charts/enhanced-bar-chart"
import { EnhancedPieChart } from "@/components/charts/enhanced-pie-chart"

export default async function AdminDashboard() {
  const stats = await getAdminStats()
  const pendingVacations = await getPendingVacations()

  // Get translations
  const locale = await getLocale()
  const { t } = await getTranslations(locale)

  // Mock data for charts
  const vacationStatusData = [
    { name: t("admin.dashboard.pendingVacations", "Pending"), value: stats.pendingVacations, color: "#F59E0B" },
    { name: t("admin.dashboard.approvedVacations", "Approved"), value: stats.approvedVacations, color: "#10B981" },
    { name: t("admin.dashboard.rejectedVacations", "Rejected"), value: stats.rejectedVacations, color: "#EF4444" }
  ]

  // Mock data for monthly distribution
  const monthlyData = [
    { name: t("common.months.jan", "Jan"), value: 12 },
    { name: t("common.months.feb", "Feb"), value: 8 },
    { name: t("common.months.mar", "Mar"), value: 15 },
    { name: t("common.months.apr", "Apr"), value: 10 },
    { name: t("common.months.may", "May"), value: 7 },
    { name: t("common.months.jun", "Jun"), value: 9 }
  ]

  // Format days function
  const formatDays = (value: number) => {
    return `${value} ${value === 1 ? t("common.day", "day") : t("common.days", "days")}`
  }

  return (
    <div className="p-6 space-y-6">
      <AdminHeader
        title={t("admin.dashboard.title", "Dashboard")}
        description={t("admin.dashboard.description", "Overview of the vacation management system")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("admin.dashboard.totalUsers", "Total Users")}
          value={stats.totalUsers}
          icon={<Users className="h-5 w-5" />}
          variant="primary"
          animation="scale"
        />

        <StatCard
          title={t("admin.dashboard.totalVacations", "Total Vacations")}
          value={stats.totalVacations}
          icon={<Calendar className="h-5 w-5" />}
          variant="secondary"
          animation="scale"
        />

        <StatCard
          title={t("admin.dashboard.pendingRequests", "Pending Requests")}
          value={stats.pendingVacations}
          icon={<Clock className="h-5 w-5" />}
          variant="warning"
          animation="scale"
          trend={stats.pendingVacations > 5 ? { value: 12, direction: "up", label: t("admin.dashboard.fromLastWeek", "from last week") } : undefined}
        />

        <StatCard
          title={t("admin.dashboard.approvedRejected", "Approved / Rejected")}
          value={`${stats.approvedVacations} / ${stats.rejectedVacations}`}
          icon={<CheckCircle className="h-5 w-5" />}
          variant="success"
          animation="scale"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.dashboard.vacationStatus", "Vacation Status")}</CardTitle>
            <CardDescription>{t("admin.dashboard.vacationStatusDescription", "Distribution of vacation requests by status")}</CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedPieChart
              data={vacationStatusData}
              height={300}
              innerRadius={60}
              outerRadius={100}
              valueFormatter={formatDays}
              showLabels={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.dashboard.monthlyDistribution", "Monthly Distribution")}</CardTitle>
            <CardDescription>{t("admin.dashboard.monthlyDistributionDescription", "Vacation days usage by month")}</CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedBarChart
              data={monthlyData}
              height={300}
              valueFormatter={formatDays}
              xAxisLabel={t("common.months", "Months")}
              yAxisLabel={t("common.days", "Days")}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Vacation Requests</CardTitle>
          <CardDescription>Review and manage vacation requests that need your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <PendingVacationsList vacations={pendingVacations} />
        </CardContent>
      </Card>
    </div>
  )
}
