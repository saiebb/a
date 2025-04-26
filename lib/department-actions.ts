"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase"
import type { Department } from "@/types/department"

/**
 * الحصول على جميع الأقسام
 */
export async function getAllDepartments(): Promise<Department[]> {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: departments, error } = await supabase
      .from("departments")
      .select(`
        *,
        users (
          id,
          name,
          email,
          profile_image_url
        )
      `)
      .order("name")

    if (error) {
      console.error("Error fetching departments:", error)
      throw new Error("Failed to fetch departments")
    }

    return departments || []
  } catch (error) {
    console.error("Error in getAllDepartments:", error)
    return []
  }
}

/**
 * الحصول على قسم بواسطة المعرف
 */
export async function getDepartmentById(id: number): Promise<Department | null> {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: department, error } = await supabase
      .from("departments")
      .select(`
        *,
        users (
          id,
          name,
          email,
          profile_image_url
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching department:", error)
      throw new Error("Failed to fetch department")
    }

    return department
  } catch (error) {
    console.error("Error in getDepartmentById:", error)
    return null
  }
}

/**
 * إنشاء قسم جديد
 */
export async function createDepartment(data: { name: string; description?: string; manager_id?: string }): Promise<{ success: boolean; message: string; department?: Department }> {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // التحقق من صلاحيات المستخدم
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: "User not authenticated" }
    }

    // التحقق من صلاحيات المستخدم
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (userError || !userData || (userData.role !== "admin" && userData.role !== "super_admin")) {
      return { success: false, message: "Unauthorized" }
    }

    // إنشاء القسم
    const { data: department, error } = await supabase
      .from("departments")
      .insert({
        name: data.name,
        description: data.description || null,
        manager_id: data.manager_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating department:", error)
      return { success: false, message: "Failed to create department" }
    }

    revalidatePath("/admin/departments")
    return { success: true, message: "Department created successfully", department }
  } catch (error) {
    console.error("Error in createDepartment:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

/**
 * تحديث قسم
 */
export async function updateDepartment(id: number, data: { name?: string; description?: string; manager_id?: string | null }): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // التحقق من صلاحيات المستخدم
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: "User not authenticated" }
    }

    // التحقق من صلاحيات المستخدم
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (userError || !userData || (userData.role !== "admin" && userData.role !== "super_admin")) {
      return { success: false, message: "Unauthorized" }
    }

    // تحديث القسم
    const { error } = await supabase
      .from("departments")
      .update({
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.manager_id !== undefined && { manager_id: data.manager_id }),
        updated_at: new Date().toISOString()
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating department:", error)
      return { success: false, message: "Failed to update department" }
    }

    revalidatePath("/admin/departments")
    return { success: true, message: "Department updated successfully" }
  } catch (error) {
    console.error("Error in updateDepartment:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

/**
 * حذف قسم
 */
export async function deleteDepartment(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // التحقق من صلاحيات المستخدم
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: "User not authenticated" }
    }

    // التحقق من صلاحيات المستخدم
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (userError || !userData || (userData.role !== "admin" && userData.role !== "super_admin")) {
      return { success: false, message: "Unauthorized" }
    }

    // التحقق من وجود مستخدمين في هذا القسم
    const { count, error: countError } = await supabase
      .from("users")
      .select("id", { count: true })
      .eq("department_id", id)

    if (countError) {
      console.error("Error checking department users:", countError)
      return { success: false, message: "Failed to check department users" }
    }

    if (count && count > 0) {
      return { success: false, message: "Cannot delete department with assigned users" }
    }

    // حذف القسم
    const { error } = await supabase
      .from("departments")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting department:", error)
      return { success: false, message: "Failed to delete department" }
    }

    revalidatePath("/admin/departments")
    return { success: true, message: "Department deleted successfully" }
  } catch (error) {
    console.error("Error in deleteDepartment:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

/**
 * الحصول على المستخدمين المؤهلين ليكونوا مديري أقسام
 */
export async function getEligibleDepartmentManagers(): Promise<{ id: string; name: string; email: string; role: string }[]> {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: managers, error } = await supabase
      .from("users")
      .select("id, name, email, role")
      .in("role", ["manager", "admin"])
      .order("name")

    if (error) {
      console.error("Error fetching eligible managers:", error)
      throw new Error("Failed to fetch eligible managers")
    }

    return managers || []
  } catch (error) {
    console.error("Error in getEligibleDepartmentManagers:", error)
    return []
  }
}

/**
 * الحصول على المستخدمين في قسم معين
 */
export async function getUsersByDepartment(departmentId: number): Promise<{ id: string; name: string; email: string; role: string }[]> {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("department_id", departmentId)
      .order("name")

    if (error) {
      console.error("Error fetching department users:", error)
      throw new Error("Failed to fetch department users")
    }

    return users || []
  } catch (error) {
    console.error("Error in getUsersByDepartment:", error)
    return []
  }
}

/**
 * تعيين قسم للمستخدم
 */
export async function assignUserToDepartment(userId: string, departmentId: number | null): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // التحقق من صلاحيات المستخدم
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: "User not authenticated" }
    }

    // التحقق من صلاحيات المستخدم
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (userError || !userData || (userData.role !== "admin" && userData.role !== "super_admin")) {
      return { success: false, message: "Unauthorized" }
    }

    // تحديث القسم للمستخدم
    const { error } = await supabase
      .from("users")
      .update({
        department_id: departmentId,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)

    if (error) {
      console.error("Error assigning user to department:", error)
      return { success: false, message: "Failed to assign user to department" }
    }

    revalidatePath("/admin/departments")
    revalidatePath("/admin/users")
    return { success: true, message: "User assigned to department successfully" }
  } catch (error) {
    console.error("Error in assignUserToDepartment:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}
