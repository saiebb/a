import { SuperAdminHeader } from "@/components/super-admin/super-admin-header"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { getTranslations, getLocale } from "@/lib/i18n/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SuperAdminUsersPage() {
  // الحصول على الترجمات
  const locale = await getLocale()
  const { t: originalT } = await getTranslations(locale)

  // إنشاء وظيفة مساعدة للترجمة لتجنب مشاكل الأنواع
  const t = (key: string, defaultValue: string) => {
    return originalT(key, { defaultValue }) as string
  }

  return (
    <div className="container py-6 space-y-6">
      <SuperAdminHeader
        title={t("superAdmin.users.title", "User Management")}
        description={t("superAdmin.users.description", "Manage all users and their permissions")}
        backHref="/super-admin"
        action={
          <Button asChild>
            <Link href="/super-admin/users/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              {t("superAdmin.users.addUser", "Add User")}
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("superAdmin.users.allUsers", "All Users")}</CardTitle>
          <CardDescription>
            {t("superAdmin.users.allUsersDescription", "View and manage all users in the system")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("superAdmin.users.comingSoon", "User management functionality coming soon.")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
