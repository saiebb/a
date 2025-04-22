import type React from "react"
import { redirect } from "next/navigation"
import { getServerUser } from "@/lib/server-auth"

export default async function ManagerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // التحقق من صلاحيات المستخدم
  const user = await getServerUser()
  
  // إذا لم يكن المستخدم مسجل الدخول أو ليس لديه دور مدير، قم بتوجيهه إلى الصفحة الرئيسية
  if (!user || (user.role !== "manager" && user.role !== "admin")) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {children}
    </div>
  )
}
