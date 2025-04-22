"use server"

import { revalidatePath } from "next/cache"
import { getServerSupabase } from "./supabase"
import { validate as validateUUID } from "uuid"
import type { AdminStats, UserRole, VacationWithUser } from "@/types/admin"
import type { User } from "@/types"
import type { Department } from "@/types/department"
import { getServerUser } from "./server-auth"

// Check if the current user is an admin
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getServerUser()

    if (!user?.id) return false

    const supabase = getServerSupabase()

    const { data, error } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (error || !data) return false

    return data.role === "admin" || data.role === "super_admin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// Check if the current user is a super admin
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const user = await getServerUser()

    if (!user?.id) return false

    const supabase = getServerSupabase()

    const { data, error } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (error || !data) return false

    return data.role === "super_admin"
  } catch (error) {
    console.error("Error checking super admin status:", error)
    return false
  }
}

// Get admin dashboard stats
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const supabase = getServerSupabase()

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    // Get vacation counts
    const { data: vacationStats, error: vacationsError } = await supabase.from("vacations").select("status")

    if (usersError || vacationsError) {
      console.error("Error fetching admin stats:", usersError || vacationsError)
      return {
        totalUsers: 0,
        totalVacations: 0,
        pendingVacations: 0,
        approvedVacations: 0,
        rejectedVacations: 0,
      }
    }

    const totalVacations = vacationStats?.length || 0
    const pendingVacations = vacationStats?.filter((v) => v.status === "pending").length || 0
    const approvedVacations = vacationStats?.filter((v) => v.status === "approved").length || 0
    const rejectedVacations = vacationStats?.filter((v) => v.status === "rejected").length || 0

    return {
      totalUsers: totalUsers || 0,
      totalVacations,
      pendingVacations,
      approvedVacations,
      rejectedVacations,
    }
  } catch (error) {
    console.error("Error getting admin stats:", error)
    return {
      totalUsers: 0,
      totalVacations: 0,
      pendingVacations: 0,
      approvedVacations: 0,
      rejectedVacations: 0,
    }
  }
}

// Get all pending vacation requests with user information
export async function getPendingVacations(): Promise<VacationWithUser[]> {
  try {
    const supabase = getServerSupabase()

    const { data, error } = await supabase
      .from("vacations")
      .select(`
        *,
        vacation_type:vacation_types(*),
        user:users(id, name, email)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching pending vacations:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error getting pending vacations:", error)
    return []
  }
}

// Get all vacation requests with user information
export async function getAllVacations(): Promise<VacationWithUser[]> {
  try {
    const supabase = getServerSupabase()

    const { data, error } = await supabase
      .from("vacations")
      .select(`
        *,
        vacation_type:vacation_types(*),
        user:users(id, name, email)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching all vacations:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error getting all vacations:", error)
    return []
  }
}

// Approve or reject a vacation request
export async function updateVacationStatus(
  vacationId: string,
  status: "approved" | "rejected",
  adminNote?: string,
): Promise<{ success: boolean; message: string }> {
  // Validate UUID format
  if (!vacationId || !validateUUID(vacationId)) {
    return {
      success: false,
      message: "Invalid vacation ID format",
    }
  }

  try {
    // Check if the current user is an admin
    const isUserAdmin = await isAdmin()

    if (!isUserAdmin) {
      return {
        success: false,
        message: "You don't have permission to perform this action",
      }
    }

    const supabase = getServerSupabase()

    const { data, error } = await supabase
      .from("vacations")
      .update({
        status,
        admin_note: adminNote,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vacationId)
      .select("user_id, start_date, end_date")
      .single()

    if (error) {
      console.error("Error updating vacation status:", error)
      return {
        success: false,
        message: "Failed to update vacation status",
      }
    }

    // Create a notification for the user
    await supabase.from("notifications").insert({
      user_id: data.user_id,
      message: `Your vacation request from ${new Date(data.start_date).toLocaleDateString()} to ${new Date(data.end_date).toLocaleDateString()} has been ${status}${adminNote ? `: ${adminNote}` : "."}`,
      vacation_id: vacationId,
    })

    revalidatePath("/admin/vacations")

    return {
      success: true,
      message: `Vacation ${status} successfully`,
    }
  } catch (error) {
    console.error("Error in updateVacationStatus:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
    }
  }
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    const supabase = getServerSupabase()

    const { data, error } = await supabase.from("users").select("*").order("name")

    if (error) {
      console.error("Error fetching users:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error getting all users:", error)
    return []
  }
}

// Update user role
export async function updateUserRole(userId: string, role: UserRole): Promise<{ success: boolean; message: string }> {
  // Validate UUID format
  if (!userId || !validateUUID(userId)) {
    return {
      success: false,
      message: "Invalid user ID format",
    }
  }

  try {
    // Check if the current user is a super admin
    const isUserSuperAdmin = await isSuperAdmin()

    if (!isUserSuperAdmin) {
      return {
        success: false,
        message: "You don't have permission to perform this action",
      }
    }

    const supabase = getServerSupabase()

    const { error } = await supabase
      .from("users")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating user role:", error)
      return {
        success: false,
        message: "Failed to update user role",
      }
    }

    revalidatePath("/admin/users")

    return {
      success: true,
      message: `User role updated to ${role} successfully`,
    }
  } catch (error) {
    console.error("Error in updateUserRole:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
    }
  }
}

// Create a new user
export async function createUser(
  email: string,
  name: string,
  totalVacationDays: number,
  role: UserRole = "user",
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if the current user is an admin
    const isUserAdmin = await isAdmin()

    if (!isUserAdmin) {
      return {
        success: false,
        message: "You don't have permission to perform this action",
      }
    }

    const supabase = getServerSupabase()

    // Check if user with this email already exists
    const { data: existingUser, error: checkError } = await supabase.from("users").select("id").eq("email", email)

    if (checkError) {
      console.error("Error checking existing user:", checkError)
      return {
        success: false,
        message: "Failed to check if user already exists",
      }
    }

    if (existingUser && existingUser.length > 0) {
      return {
        success: false,
        message: "A user with this email already exists",
      }
    }

    // Create auth user (only super admin can do this)
    if (await isSuperAdmin()) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name },
        password: Math.random().toString(36).slice(-8), // Generate a random password
      })

      if (authError) {
        console.error("Error creating auth user:", authError)
        return {
          success: false,
          message: "Failed to create auth user",
        }
      }

      // Create user record in the users table
      const { error: createError } = await supabase.from("users").insert({
        id: authData.user.id,
        email,
        name,
        total_vacation_days: totalVacationDays,
        profile_image_url: null, // Required field but can be null
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (createError) {
        console.error("Error creating user record:", createError)
        return {
          success: false,
          message: "Failed to create user record",
        }
      }
    } else {
      // Regular admin can only create a user record (not auth user)
      const { error: createError } = await supabase.from("users").insert({
        email,
        name,
        total_vacation_days: totalVacationDays,
        profile_image_url: null, // Required field but can be null
        role: "user", // Regular admin can only create regular users
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (createError) {
        console.error("Error creating user record:", createError)
        return {
          success: false,
          message: "Failed to create user record",
        }
      }
    }

    revalidatePath("/admin/users")

    return {
      success: true,
      message: "User created successfully",
    }
  } catch (error) {
    console.error("Error in createUser:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
    }
  }
}

// Update user details
export async function updateUser(
  userId: string,
  name: string,
  email: string,
  totalVacationDays: number,
): Promise<{ success: boolean; message: string }> {
  // Validate UUID format
  if (!userId || !validateUUID(userId)) {
    return {
      success: false,
      message: "Invalid user ID format",
    }
  }

  try {
    // Check if the current user is an admin
    const isUserAdmin = await isAdmin()

    if (!isUserAdmin) {
      return {
        success: false,
        message: "You don't have permission to perform this action",
      }
    }

    const supabase = getServerSupabase()

    const { error } = await supabase
      .from("users")
      .update({
        name,
        email,
        total_vacation_days: totalVacationDays,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating user:", error)
      return {
        success: false,
        message: "Failed to update user",
      }
    }

    revalidatePath("/admin/users")

    return {
      success: true,
      message: "User updated successfully",
    }
  } catch (error) {
    console.error("Error in updateUser:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
    }
  }
}

// Delete a user
export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
  // Validate UUID format
  if (!userId || !validateUUID(userId)) {
    return {
      success: false,
      message: "Invalid user ID format",
    }
  }

  try {
    // Check if the current user is a super admin
    const isUserSuperAdmin = await isSuperAdmin()

    if (!isUserSuperAdmin) {
      return {
        success: false,
        message: "You don't have permission to perform this action",
      }
    }

    const supabase = getServerSupabase()

    // Delete user's vacations first
    const { error: vacationsError } = await supabase.from("vacations").delete().eq("user_id", userId)

    if (vacationsError) {
      console.error("Error deleting user's vacations:", vacationsError)
      return {
        success: false,
        message: "Failed to delete user's vacations",
      }
    }

    // Delete user's notifications
    const { error: notificationsError } = await supabase.from("notifications").delete().eq("user_id", userId)

    if (notificationsError) {
      console.error("Error deleting user's notifications:", notificationsError)
      return {
        success: false,
        message: "Failed to delete user's notifications",
      }
    }

    // Delete user record
    const { error: userError } = await supabase.from("users").delete().eq("id", userId)

    if (userError) {
      console.error("Error deleting user:", userError)
      return {
        success: false,
        message: "Failed to delete user",
      }
    }

    // Delete auth user (only super admin can do this)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("Error deleting auth user:", authError)
      return {
        success: false,
        message: "User record deleted but failed to delete auth user",
      }
    }

    revalidatePath("/admin/users")

    return {
      success: true,
      message: "User deleted successfully",
    }
  } catch (error) {
    console.error("Error in deleteUser:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
    }
  }
}

// Get all departments
export async function getAllDepartments(): Promise<Department[]> {
  try {
    const supabase = getServerSupabase()

    const { data, error } = await supabase
      .from("departments")
      .select(`
        *,
        manager:users(id, name, email)
      `)
      .order("name")

    if (error) {
      console.error("Error fetching departments:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllDepartments:", error)
    return []
  }
}

// Get department by ID
export async function getDepartmentById(id: string): Promise<Department | null> {
  // Validate UUID format
  if (!id || !validateUUID(id)) {
    return null
  }

  try {
    const supabase = getServerSupabase()

    const { data, error } = await supabase
      .from("departments")
      .select(`
        *,
        manager:users(id, name, email)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching department:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getDepartmentById:", error)
    return null
  }
}

// Create a new department
export async function createDepartment(
  name: string,
  description?: string,
  managerId?: string
): Promise<{ success: boolean; message: string; department?: Department }> {
  try {
    // Check if the current user is an admin
    const isUserAdmin = await isAdmin()

    if (!isUserAdmin) {
      return { success: false, message: "You don't have permission to perform this action" }
    }

    const supabase = getServerSupabase()

    // Create the department
    const { data, error } = await supabase
      .from("departments")
      .insert({
        name,
        description,
        manager_id: managerId || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating department:", error)
      return { success: false, message: "Failed to create department" }
    }

    revalidatePath("/admin/departments")

    return {
      success: true,
      message: "Department created successfully",
      department: data,
    }
  } catch (error) {
    console.error("Error in createDepartment:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Update a department
export async function updateDepartment(
  id: string,
  name: string,
  description?: string,
  managerId?: string
): Promise<{ success: boolean; message: string }> {
  // Validate UUID format
  if (!id || !validateUUID(id)) {
    return {
      success: false,
      message: "Invalid department ID format",
    }
  }

  try {
    // Check if the current user is an admin
    const isUserAdmin = await isAdmin()

    if (!isUserAdmin) {
      return { success: false, message: "You don't have permission to perform this action" }
    }

    const supabase = getServerSupabase()

    // Update the department
    const { error } = await supabase
      .from("departments")
      .update({
        name,
        description,
        manager_id: managerId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating department:", error)
      return { success: false, message: "Failed to update department" }
    }

    revalidatePath("/admin/departments")
    revalidatePath(`/admin/departments/${id}`)

    return {
      success: true,
      message: "Department updated successfully",
    }
  } catch (error) {
    console.error("Error in updateDepartment:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Delete a department
export async function deleteDepartment(id: string): Promise<{ success: boolean; message: string }> {
  // Validate UUID format
  if (!id || !validateUUID(id)) {
    return {
      success: false,
      message: "Invalid department ID format",
    }
  }

  try {
    // Check if the current user is an admin
    const isUserAdmin = await isAdmin()

    if (!isUserAdmin) {
      return { success: false, message: "You don't have permission to perform this action" }
    }

    const supabase = getServerSupabase()

    // Check if there are users in this department
    const { count, error: countError } = await supabase
      .from("users")
      .select("id", { count: "exact" })
      .eq("department_id", id)

    if (countError) {
      console.error("Error checking department users:", countError)
      return { success: false, message: "Failed to check department users" }
    }

    if (count && count > 0) {
      return {
        success: false,
        message: "Cannot delete department with assigned users. Please reassign users first.",
      }
    }

    // Delete the department
    const { error } = await supabase
      .from("departments")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting department:", error)
      return { success: false, message: "Failed to delete department" }
    }

    revalidatePath("/admin/departments")

    return {
      success: true,
      message: "Department deleted successfully",
    }
  } catch (error) {
    console.error("Error in deleteDepartment:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Get all users with manager role
export async function getAllManagers(): Promise<{ id: string; name: string; email: string }[]> {
  try {
    const supabase = getServerSupabase()

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email")
      .in("role", ["manager", "admin", "super_admin"])
      .order("name")

    if (error) {
      console.error("Error fetching managers:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllManagers:", error)
    return []
  }
}

// Assign user to department
export async function assignUserToDepartment(
  userId: string,
  departmentId: string | null
): Promise<{ success: boolean; message: string }> {
  // Validate UUID format
  if (!userId || !validateUUID(userId)) {
    return {
      success: false,
      message: "Invalid user ID format",
    }
  }

  if (departmentId && !validateUUID(departmentId)) {
    return {
      success: false,
      message: "Invalid department ID format",
    }
  }

  try {
    // Check if the current user is an admin
    const isUserAdmin = await isAdmin()

    if (!isUserAdmin) {
      return { success: false, message: "You don't have permission to perform this action" }
    }

    const supabase = getServerSupabase()

    // Update the user's department
    const { error } = await supabase
      .from("users")
      .update({
        department_id: departmentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error assigning user to department:", error)
      return { success: false, message: "Failed to assign user to department" }
    }

    revalidatePath("/admin/users")
    revalidatePath(`/admin/users/${userId}`)
    revalidatePath("/admin/departments")

    return {
      success: true,
      message: departmentId
        ? "User assigned to department successfully"
        : "User removed from department successfully",
    }
  } catch (error) {
    console.error("Error in assignUserToDepartment:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}