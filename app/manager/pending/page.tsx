import Link from "next/link"
import { getServerUser } from "@/lib/server-auth"
import { getTranslations, getLocale } from "@/lib/i18n/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { getPendingVacations } from "@/lib/manager-actions"
import { PendingVacationsList } from "@/components/manager/pending-vacations-list"

export default async function PendingVacationsPage() {
  // الحصول على المستخدم الحالي
  const user = await getServerUser()
  
  // الحصول على الترجمات
  const locale = await getLocale()
  const { t } = await getTranslations(locale)
  
  // الحصول على طلبات الإجازة المعلقة
  const pendingVacations = await getPendingVacations(user?.id)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" asChild>
            <Link href="/manager">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{t("manager.pending.title")}</h1>
          <p className="text-muted-foreground">{t("manager.pending.description")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("manager.pending.pendingRequests")}</CardTitle>
          <CardDescription>{t("manager.pending.pendingRequestsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <PendingVacationsList vacations={pendingVacations} />
        </CardContent>
      </Card>
    </div>
  )
}
