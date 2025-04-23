import type React from "react"
import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/admin-actions"
import { AdminLayout } from "@/components/admin/admin-layout"

export const metadata = {
  title: "Admin Dashboard | AJazati",
  description: "Administrative dashboard for AJazati vacation management system",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if the current user is an admin
  const userIsAdmin = await isAdmin()

  if (!userIsAdmin) {
    redirect("/")
  }

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  )
}
