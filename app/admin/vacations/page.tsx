import { AdminHeader } from "@/components/admin/admin-header"
import { getAllVacations } from "@/lib/admin-actions"
import { VacationsTable } from "@/components/admin/vacations-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTranslations, getLocale } from "@/lib/i18n/server"

export default async function VacationsPage() {
  const vacations = await getAllVacations()

  // Get translations
  const locale = await getLocale()
  const { t } = await getTranslations(locale)

  // Filter vacations by status
  const pendingVacations = vacations.filter((v) => v.status === "pending")
  const approvedVacations = vacations.filter((v) => v.status === "approved")
  const rejectedVacations = vacations.filter((v) => v.status === "rejected")

  // Convert translations to strings to avoid type issues
  const titleText = t("admin.vacations.title") as string
  const descriptionText = t("admin.vacations.description") as string

  return (
    <div className="container py-6 space-y-6">
      <AdminHeader
        title={titleText}
        description={descriptionText}
      />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            {t("vacationStatus.pending")} ({pendingVacations.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            {t("vacationStatus.approved")} ({approvedVacations.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            {t("vacationStatus.rejected")} ({rejectedVacations.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            {t("admin.vacations.allVacations")} ({vacations.length})
          </TabsTrigger>
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
