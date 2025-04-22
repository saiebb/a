"use client"

import { AdminLayoutHeader } from "@/components/admin/admin-layout-header"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminLayoutHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
