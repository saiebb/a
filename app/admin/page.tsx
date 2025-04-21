import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminStats, getPendingVacations } from "@/lib/admin-actions"
import { AdminHeader } from "@/components/admin/admin-header"
import { PendingVacationsList } from "@/components/admin/pending-vacations-list"
import { Users, Calendar, CheckCircle, XCircle, Clock } from "lucide-react"

export default async function AdminDashboard() {
  const stats = await getAdminStats()
  const pendingVacations = await getPendingVacations()

  return (
    <div className="p-6 space-y-6">
      <AdminHeader title="Dashboard" description="Overview of the vacation management system" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vacations</p>
                <p className="text-3xl font-bold">{stats.totalVacations}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-3xl font-bold">{stats.pendingVacations}</p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-full">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved / Rejected</p>
                <p className="text-3xl font-bold">
                  {stats.approvedVacations} / {stats.rejectedVacations}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="p-2 bg-red-500/10 rounded-full">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </div>
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
