import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerUser } from "@/lib/server-auth"
import { SuperAdminHeader } from "@/components/super-admin/super-admin-header"
import { Button } from "@/components/ui/button"
import { getTranslations, getLocale } from "@/lib/i18n/server"
import Link from "next/link"
import { Users, Settings, Database, Shield, Building, CalendarDays } from "lucide-react"

export default async function SuperAdminDashboard() {
  // الحصول على معلومات المستخدم
  const user = await getServerUser()

  // الحصول على الترجمات
  const locale = await getLocale()
  const { t: originalT } = await getTranslations(locale)

  // إنشاء وظيفة مساعدة للترجمة لتجنب مشاكل الأنواع
  const t = (key: string, defaultValue: string) => {
    return originalT(key, { defaultValue }) as string
  }

  return (
    <div className="p-6 space-y-6">
      <SuperAdminHeader
        title={t("superAdmin.dashboard.title", "Super Admin Dashboard")}
        description={t("superAdmin.dashboard.description", "Complete system management and configuration")}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("superAdmin.dashboard.userManagement", "User Management")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t("superAdmin.dashboard.manageAllUsers", "Manage All Users")}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("superAdmin.dashboard.userManagementDescription", "Create, edit, and manage all user accounts and permissions")}
            </p>
            <Button asChild className="w-full mt-4" size="sm">
              <Link href="/super-admin/users">
                {t("superAdmin.dashboard.manageUsers", "Manage Users")}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("superAdmin.dashboard.roleManagement", "Role Management")}
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t("superAdmin.dashboard.manageRoles", "Manage Roles")}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("superAdmin.dashboard.roleManagementDescription", "Configure user roles and permissions across the system")}
            </p>
            <Button asChild className="w-full mt-4" size="sm">
              <Link href="/super-admin/roles">
                {t("superAdmin.dashboard.manageRolesButton", "Manage Roles")}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("superAdmin.dashboard.departmentManagement", "Department Management")}
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t("superAdmin.dashboard.manageDepartments", "Manage Departments")}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("superAdmin.dashboard.departmentManagementDescription", "Create and manage organizational departments")}
            </p>
            <Button asChild className="w-full mt-4" size="sm">
              <Link href="/super-admin/departments">
                {t("superAdmin.dashboard.manageDepartments", "Manage Departments")}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("superAdmin.dashboard.vacationTypes", "Vacation Types")}
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t("superAdmin.dashboard.manageVacationTypes", "Manage Vacation Types")}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("superAdmin.dashboard.vacationTypesDescription", "Configure vacation types and policies")}
            </p>
            <Button asChild className="w-full mt-4" size="sm">
              <Link href="/super-admin/vacation-types">
                {t("superAdmin.dashboard.manageVacationTypes", "Manage Vacation Types")}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("superAdmin.dashboard.systemSettings", "System Settings")}
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t("superAdmin.dashboard.configureSystem", "Configure System")}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("superAdmin.dashboard.systemSettingsDescription", "Manage global system settings and configurations")}
            </p>
            <Button asChild className="w-full mt-4" size="sm">
              <Link href="/super-admin/settings">
                {t("superAdmin.dashboard.systemSettings", "System Settings")}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("superAdmin.dashboard.database", "Database Management")}
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t("superAdmin.dashboard.manageDatabase", "Manage Database")}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("superAdmin.dashboard.databaseDescription", "Database maintenance and backup operations")}
            </p>
            <Button asChild className="w-full mt-4" size="sm">
              <Link href="/super-admin/database">
                {t("superAdmin.dashboard.manageDatabase", "Manage Database")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
