import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getServerUser } from "@/lib/server-auth"
import { getTranslations, getLocale } from "@/lib/i18n/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Building, Calendar, Mail, User, Users } from "lucide-react"
import { getDepartmentById, isAdmin } from "@/lib/admin-actions"
import { formatDate } from "@/lib/utils"
import { EditDepartmentButton } from "@/components/admin/edit-department-button"
import { DeleteDepartmentButton } from "@/components/admin/delete-department-button"
import { DepartmentUsersList } from "@/components/admin/department-users-list"

interface DepartmentPageProps {
  params: {
    id: string
  }
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  // التحقق من صلاحيات المستخدم
  const user = await getServerUser()
  const isUserAdmin = await isAdmin()

  if (!user || !isUserAdmin) {
    redirect("/")
  }

  // الحصول على الترجمات
  const locale = await getLocale()
  const { t } = await getTranslations(locale)

  // الحصول على معلومات القسم
  const department = await getDepartmentById(params.id)

  if (!department) {
    notFound()
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" asChild>
            <Link href="/admin/departments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{department.name}</h1>
          <p className="text-muted-foreground">{t("admin.departments.departmentDetails")}</p>
        </div>
        <div className="flex gap-2">
          <EditDepartmentButton department={department} />
          <DeleteDepartmentButton department={department} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t("admin.departments.information")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">{t("admin.departments.name")}</div>
              <div className="font-medium flex items-center">
                <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                {department.name}
              </div>
            </div>

            {department.description && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">{t("admin.departments.description")}</div>
                <div>{department.description}</div>
              </div>
            )}

            <div>
              <div className="text-sm text-muted-foreground mb-1">{t("admin.departments.createdAt")}</div>
              <div className="font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {formatDate(department.created_at)}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-1">{t("admin.departments.manager")}</div>
              {department.manager ? (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{department.manager.name}</div>
                    <div className="text-sm text-muted-foreground">{department.manager.email}</div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">{t("admin.departments.noManager")}</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              {t("admin.departments.members")}
            </CardTitle>
            <CardDescription>{t("admin.departments.membersDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <DepartmentUsersList departmentId={department.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
