"use client"

import { supabase } from "./supabase-client"

// وظيفة للحصول على دور المستخدم من قاعدة البيانات
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    if (!userId) {
      console.error("getUserRole called with empty userId")
      return null
    }

    console.log("Fetching role for user ID:", userId)

    // استعلام عن دور المستخدم من جدول المستخدمين
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching user role:", error)
      return null
    }

    console.log("User role from database:", data?.role || "user")
    return data?.role || "user" // إرجاع دور المستخدم أو "user" كقيمة افتراضية
  } catch (error) {
    console.error("Unexpected error in getUserRole:", error)
    return null
  }
}

// وظيفة لتحديد مسار إعادة التوجيه بناءً على دور المستخدم
export async function getRedirectPathByRole(userId: string, defaultPath: string = "/"): Promise<string> {
  try {
    // الحصول على دور المستخدم
    const role = await getUserRole(userId)

    // تحديد المسار بناءً على الدور
    switch (role) {
      case "admin":
      case "super_admin":
        return "/admin" // توجيه المشرفين إلى لوحة تحكم المشرف
      case "manager":
        return "/manager" // توجيه المديرين إلى لوحة تحكم المدير
      case "user":
      default:
        return defaultPath // توجيه المستخدمين العاديين إلى المسار الافتراضي (الصفحة الرئيسية)
    }
  } catch (error) {
    console.error("Error in getRedirectPathByRole:", error)
    return defaultPath // في حالة حدوث خطأ، استخدم المسار الافتراضي
  }
}
