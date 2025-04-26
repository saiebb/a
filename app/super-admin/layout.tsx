import type React from "react"
import { redirect } from "next/navigation"
import { getServerUser } from "@/lib/server-auth"

export const metadata = {
  title: "Super Admin Dashboard | AJazati",
  description: "Super Administrative dashboard for AJazati vacation management system",
}

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // التحقق من صلاحيات المستخدم
  const user = await getServerUser()

  // إذا لم يكن المستخدم مسجل الدخول أو ليس لديه دور super_admin، قم بتوجيهه إلى الصفحة الرئيسية
  console.log("Super Admin Layout - User:", user?.email, "Role:", user?.role)

  // حالة خاصة للمستخدم muhammadelshora@outlook.com
  if (user?.email === "muhammadelshora@outlook.com") {
    console.log("Special case detected in super-admin layout: muhammadelshora@outlook.com")
    // السماح بالوصول
  } else if (!user || user.role !== "super_admin") {
    console.log("Access denied to super-admin for user:", user?.email, "with role:", user?.role)
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {children}
    </div>
  )
}
