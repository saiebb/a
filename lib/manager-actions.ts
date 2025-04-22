"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase"
import type { Vacation } from "@/types"
import type { TeamVacationSummary } from "@/types/manager"

/**
 * الحصول على ملخص إجازات الفريق
 */
export async function getTeamVacationSummary(managerId?: string): Promise<TeamVacationSummary> {
  try {
    if (!managerId) {
      return {
        totalMembers: 0,
        pendingVacations: 0,
        upcomingVacations: 0,
        onVacationToday: 0,
        vacationsByType: []
      }
    }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // الحصول على عدد أعضاء الفريق
    const { data: teamMembers, error: teamError } = await supabase
      .from("users")
      .select("id")
      .eq("manager_id", managerId)

    if (teamError) {
      console.error("Error fetching team members:", teamError)
      throw new Error("Failed to fetch team members")
    }

    // الحصول على عدد الإجازات المعلقة
    const { count: pendingCount, error: pendingError } = await supabase
      .from("vacations")
      .select("id", { count: true })
      .in("user_id", teamMembers.map(member => member.id))
      .eq("status", "pending")

    if (pendingError) {
      console.error("Error fetching pending vacations:", pendingError)
      throw new Error("Failed to fetch pending vacations")
    }

    // الحصول على عدد الإجازات القادمة في الأسبوع القادم
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)

    const { count: upcomingCount, error: upcomingError } = await supabase
      .from("vacations")
      .select("id", { count: true })
      .in("user_id", teamMembers.map(member => member.id))
      .eq("status", "approved")
      .gte("start_date", today.toISOString().split("T")[0])
      .lte("start_date", nextWeek.toISOString().split("T")[0])

    if (upcomingError) {
      console.error("Error fetching upcoming vacations:", upcomingError)
      throw new Error("Failed to fetch upcoming vacations")
    }

    // الحصول على عدد الموظفين في إجازة اليوم
    const { count: onVacationCount, error: onVacationError } = await supabase
      .from("vacations")
      .select("id", { count: true })
      .in("user_id", teamMembers.map(member => member.id))
      .eq("status", "approved")
      .lte("start_date", today.toISOString().split("T")[0])
      .gte("end_date", today.toISOString().split("T")[0])

    if (onVacationError) {
      console.error("Error fetching on vacation count:", onVacationError)
      throw new Error("Failed to fetch on vacation count")
    }

    // الحصول على توزيع الإجازات حسب النوع
    const { data: vacationsByType, error: typeError } = await supabase
      .from("vacation_types")
      .select(`
        id,
        name,
        color
      `)

    if (typeError) {
      console.error("Error fetching vacations by type:", typeError)
      throw new Error("Failed to fetch vacations by type")
    }

    // الحصول على عدد الإجازات لكل نوع
    const vacationCounts = [];

    for (const type of vacationsByType) {
      const { count, error: countError } = await supabase
        .from("vacations")
        .select("id", { count: true })
        .in("user_id", teamMembers.map(member => member.id))
        .eq("status", "approved")
        .eq("vacation_type_id", type.id);

      if (countError) {
        console.error(`Error fetching count for vacation type ${type.id}:`, countError);
      } else {
        vacationCounts.push({
          typeId: type.id,
          typeName: type.name,
          color: type.color,
          count: count || 0
        });
      }
    }

    return {
      totalMembers: teamMembers.length,
      pendingVacations: pendingCount || 0,
      upcomingVacations: upcomingCount || 0,
      onVacationToday: onVacationCount || 0,
      vacationsByType: vacationCounts
    }
  } catch (error) {
    console.error("Error in getTeamVacationSummary:", error)
    return {
      totalMembers: 0,
      pendingVacations: 0,
      upcomingVacations: 0,
      onVacationToday: 0,
      vacationsByType: []
    }
  }
}

/**
 * الحصول على طلبات الإجازة المعلقة للفريق
 */
export async function getPendingVacations(managerId?: string): Promise<Vacation[]> {
  try {
    if (!managerId) {
      return []
    }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // الحصول على أعضاء الفريق
    const { data: teamMembers, error: teamError } = await supabase
      .from("users")
      .select("id")
      .eq("manager_id", managerId)

    if (teamError) {
      console.error("Error fetching team members:", teamError)
      throw new Error("Failed to fetch team members")
    }

    if (!teamMembers.length) {
      return []
    }

    // الحصول على طلبات الإجازة المعلقة
    const { data: vacations, error: vacationsError } = await supabase
      .from("vacations")
      .select(`
        *,
        users (
          id,
          name,
          email,
          profile_image_url
        ),
        vacation_types (
          id,
          name,
          color
        )
      `)
      .in("user_id", teamMembers.map(member => member.id))
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (vacationsError) {
      console.error("Error fetching pending vacations:", vacationsError)
      throw new Error("Failed to fetch pending vacations")
    }

    return vacations || []
  } catch (error) {
    console.error("Error in getPendingVacations:", error)
    return []
  }
}

/**
 * الموافقة على طلب إجازة
 */
export async function approveVacation(vacationId: string): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // الحصول على معلومات المستخدم الحالي
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

    if (userError || !userData || (userData.role !== "manager" && userData.role !== "admin")) {
      return { success: false, message: "Unauthorized" }
    }

    // تحديث حالة الإجازة
    const { error: updateError } = await supabase
      .from("vacations")
      .update({
        status: "approved",
        updated_at: new Date().toISOString()
      })
      .eq("id", vacationId)

    if (updateError) {
      console.error("Error approving vacation:", updateError)
      return { success: false, message: "Failed to approve vacation" }
    }

    // الحصول على معلومات الإجازة والمستخدم
    const { data: vacation, error: vacationError } = await supabase
      .from("vacations")
      .select(`
        *,
        users (
          id,
          name
        )
      `)
      .eq("id", vacationId)
      .single()

    if (vacationError) {
      console.error("Error fetching vacation details:", vacationError)
      return { success: true, message: "Vacation approved, but failed to create notification" }
    }

    // إنشاء إشعار للمستخدم
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: vacation.user_id,
        message: `Your vacation request from ${new Date(vacation.start_date).toLocaleDateString()} to ${new Date(vacation.end_date).toLocaleDateString()} has been approved.`,
        vacation_id: vacationId,
        read: false,
        created_at: new Date().toISOString()
      })

    if (notificationError) {
      console.error("Error creating notification:", notificationError)
      return { success: true, message: "Vacation approved, but failed to create notification" }
    }

    revalidatePath("/manager")
    revalidatePath("/manager/pending")
    revalidatePath("/")

    return { success: true, message: "Vacation approved successfully" }
  } catch (error) {
    console.error("Error in approveVacation:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

/**
 * رفض طلب إجازة
 */
export async function rejectVacation(vacationId: string, reason: string): Promise<{ success: boolean; message: string }> {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // الحصول على معلومات المستخدم الحالي
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

    if (userError || !userData || (userData.role !== "manager" && userData.role !== "admin")) {
      return { success: false, message: "Unauthorized" }
    }

    // تحديث حالة الإجازة
    const { error: updateError } = await supabase
      .from("vacations")
      .update({
        status: "rejected",
        admin_note: reason,
        updated_at: new Date().toISOString()
      })
      .eq("id", vacationId)

    if (updateError) {
      console.error("Error rejecting vacation:", updateError)
      return { success: false, message: "Failed to reject vacation" }
    }

    // الحصول على معلومات الإجازة والمستخدم
    const { data: vacation, error: vacationError } = await supabase
      .from("vacations")
      .select(`
        *,
        users (
          id,
          name
        )
      `)
      .eq("id", vacationId)
      .single()

    if (vacationError) {
      console.error("Error fetching vacation details:", vacationError)
      return { success: true, message: "Vacation rejected, but failed to create notification" }
    }

    // إنشاء إشعار للمستخدم
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: vacation.user_id,
        message: `Your vacation request from ${new Date(vacation.start_date).toLocaleDateString()} to ${new Date(vacation.end_date).toLocaleDateString()} has been rejected.`,
        vacation_id: vacationId,
        read: false,
        created_at: new Date().toISOString()
      })

    if (notificationError) {
      console.error("Error creating notification:", notificationError)
      return { success: true, message: "Vacation rejected, but failed to create notification" }
    }

    revalidatePath("/manager")
    revalidatePath("/manager/pending")
    revalidatePath("/")

    return { success: true, message: "Vacation rejected successfully" }
  } catch (error) {
    console.error("Error in rejectVacation:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

/**
 * الحصول على أعضاء الفريق
 */
export async function getTeamMembers(managerId?: string) {
  try {
    if (!managerId) {
      return []
    }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: teamMembers, error } = await supabase
      .from("users")
      .select(`
        id,
        name,
        email,
        profile_image_url,
        total_vacation_days,
        created_at
      `)
      .eq("manager_id", managerId)
      .order("name")

    if (error) {
      console.error("Error fetching team members:", error)
      throw new Error("Failed to fetch team members")
    }

    return teamMembers || []
  } catch (error) {
    console.error("Error in getTeamMembers:", error)
    return []
  }
}
