import { AdminHeader } from "@/components/admin/admin-header"
import { getAllUsers, isSuperAdmin } from "@/lib/admin-actions"
import { UsersTable } from "@/components/admin/users-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function UsersPage() {
  const users = await getAllUsers()
  const userIsSuperAdmin = await isSuperAdmin()

  return (
    <div className="p-6 space-y-6">
      <AdminHeader
        title="User Management"
        description="Manage employee accounts and permissions"
        action={
          <Button asChild>
            <Link href="/admin/users/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add User
            </Link>
          </Button>
        }
      />

      <UsersTable users={users} isSuperAdmin={userIsSuperAdmin} />
    </div>
  )
}
