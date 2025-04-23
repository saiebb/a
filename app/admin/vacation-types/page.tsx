import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerUser } from "@/lib/server-auth"
import { getTranslations, getLocale } from "@/lib/i18n/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { getAllVacationTypes, isAdmin } from "@/lib/admin-actions"
import { VacationTypesList } from "@/components/admin/vacation-types-list"
import { CreateVacationTypeButton } from "@/components/admin/create-vacation-type-button"

export default async function VacationTypesPage() {
  // التحقق من صلاحيات المستخدم
  const user = await getServerUser()
  const isUserAdmin = await isAdmin()
  
  if (!user || !isUserAdmin) {
    redirect("/")
  }
  
  // الحصول على الترجمات
  const locale = await getLocale()
  const { t } = await getTranslations(locale)
  
  // الحصول على جميع أنواع الإجازات
  const vacationTypes = await getAllVacationTypes()

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.vacationTypes.title")}</h1>
          <p className="text-muted-foreground">{t("admin.vacationTypes.description")}</p>
        </div>
        <CreateVacationTypeButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.vacationTypes.typesList")}</CardTitle>
          <CardDescription>{t("admin.vacationTypes.typesListDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <VacationTypesList vacationTypes={vacationTypes} />
        </CardContent>
      </Card>
    </div>
  )
}
