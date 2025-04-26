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

    // الحصول على معلومات المستخدم من جدول auth
    console.log("Getting current user from auth...")
    const { data: userData, error: userError } = await supabase.auth.getUser()
    console.log("Auth user data:", userData)

    if (userError || !userData.user) {
      console.error("Error getting user data:", userError)
      return null
    }

    const userEmail = userData.user.email
    console.log("User email for role lookup:", userEmail)

    // استخدام وظيفة RPC للحصول على دور المستخدم بواسطة البريد الإلكتروني
    try {
      const { data, error } = await supabase
        .rpc('get_user_role_by_email', { user_email: userEmail })

      if (error) {
        console.error("Error fetching user role by RPC:", error)

        // في حالة فشل وظيفة RPC، نحاول الاستعلام المباشر من جدول users
        console.log("Falling back to direct query from users table")
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("email", userEmail)
          .single()

        if (userError) {
          console.error("Error fetching user role by direct query:", userError)
          return null
        }

        console.log("User role from direct query:", userData?.role || "user")
        return userData?.role || "user"
      }

      // وظيفة RPC ترجع الدور مباشرة كنص
      console.log("User role from RPC:", data || "user")
      return data || "user" // إرجاع دور المستخدم أو "user" كقيمة افتراضية
    } catch (rpcError) {
      console.error("RPC execution error:", rpcError)

      // في حالة حدوث خطأ في تنفيذ RPC، نحاول الاستعلام المباشر
      console.log("Falling back to direct query after RPC error")
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("users")
        .select("role")
        .eq("email", userEmail)
        .single()

      if (fallbackError) {
        console.error("Error in fallback query:", fallbackError)
        return null
      }

      console.log("User role from fallback query:", fallbackData?.role || "user")
      return fallbackData?.role || "user"
    }

    // الكود السابق تم استبداله بالكود أعلاه
  } catch (error) {
    console.error("Unexpected error in getUserRole:", error)
    return null
  }
}

// وظيفة لتحديد مسار إعادة التوجيه بناءً على دور المستخدم
export async function getRedirectPathByRole(userId: string, defaultPath: string = "/"): Promise<string> {
  try {
    console.log("Getting redirect path for user ID:", userId)

    // الحصول على دور المستخدم
    const role = await getUserRole(userId)
    console.log("User role for redirect:", role)

    // تحديد المسار بناءً على الدور
    let redirectPath = defaultPath

    // حالة خاصة للبريد الإلكتروني muhammadelshora@outlook.com
    const { data: userData } = await supabase.auth.getUser()
    const userEmail = userData?.user?.email
    console.log("User email for special case check:", userEmail)

    if (userEmail === "muhammadelshora@outlook.com") {
      console.log("Special case detected: muhammadelshora@outlook.com")
      redirectPath = "/super-admin"
      console.log("Final redirect path (special case):", redirectPath)
      return redirectPath
    }

    switch (role) {
      case "super_admin":
        // توجيه المشرف الأعلى إلى لوحة تحكم خاصة
        // لوحة التحكم هذه تحتوي على وظائف إدارية متقدمة
        redirectPath = "/super-admin"
        break
      case "admin":
        // توجيه المشرفين إلى لوحة تحكم المشرف
        redirectPath = "/admin"
        break
      case "manager":
        // توجيه المديرين إلى لوحة تحكم المدير
        redirectPath = "/manager"
        break
      case "user":
      default:
        // توجيه المستخدمين العاديين إلى المسار الافتراضي
        redirectPath = defaultPath
        break
    }

    console.log("Final redirect path:", redirectPath)
    return redirectPath
  } catch (error) {
    console.error("Error in getRedirectPathByRole:", error)
    return defaultPath // في حالة حدوث خطأ، استخدم المسار الافتراضي
  }
}
