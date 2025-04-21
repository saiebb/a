import { AdminHeader } from "@/components/admin/admin-header"
import { getAllVacations } from "@/lib/admin-actions"
import { VacationsTable } from "@/components/admin/vacations-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function VacationsPage() {
  const vacations = await getAllVacations()

  // Filter vacations by status
  const pendingVacations = vacations.filter((v) => v.status === "pending")
  const approvedVacations = vacations.filter((v) => v.status === "approved")
  const rejectedVacations = vacations.filter((v) => v.status === "rejected")

  return (
    <div className="p-6 space-y-6">
      <AdminHeader title="Vacation Requests" description="Manage employee vacation requests" />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingVacations.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedVacations.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedVacations.length})</TabsTrigger>
          <TabsTrigger value="all">All ({vacations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <VacationsTable vacations={pendingVacations} />
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <VacationsTable vacations={approvedVacations} />
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <VacationsTable vacations={rejectedVacations} />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <VacationsTable vacations={vacations} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
