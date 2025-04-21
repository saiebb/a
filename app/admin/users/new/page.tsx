import { AdminHeader } from "@/components/admin/admin-header"
import { NewUserForm } from "@/components/admin/new-user-form"
import { isSuperAdmin } from "@/lib/admin-actions"

export default async function NewUserPage() {
  const userIsSuperAdmin = await isSuperAdmin()

  return (
    <div className="p-6 space-y-6">
      <AdminHeader title="Add New User" description="Create a new user account" backHref="/admin/users" />

      <NewUserForm isSuperAdmin={userIsSuperAdmin} />
    </div>
  )
}
