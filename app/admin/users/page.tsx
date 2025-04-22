import { AdminHeader } from "@/components/admin/admin-header"
import { getAllUsers, isSuperAdmin } from "@/lib/admin-actions"
import { UsersTable } from "@/components/admin/users-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { getTranslations, getLocale } from "@/lib/i18n/server"

export default async function UsersPage() {
  const users = await getAllUsers()
  const userIsSuperAdmin = await isSuperAdmin()

  // Get translations
  const locale = await getLocale()
  const { t } = await getTranslations(locale)

  // Convert translations to strings to avoid type issues
  const titleText = t("admin.users.title") as string
  const descriptionText = t("admin.users.description") as string
  const addUserText = t("admin.users.addUser") as string

  return (
    <div className="container py-6 space-y-6">
      <AdminHeader
        title={titleText}
        description={descriptionText}
        action={
          <Button asChild>
            <Link href="/admin/users/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              {addUserText}
            </Link>
          </Button>
        }
      />

      <UsersTable users={users} isSuperAdmin={userIsSuperAdmin} />
    </div>
  )
}
