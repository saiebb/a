"use server"

import { revalidatePath } from "next/cache"
import { getServerSupabase } from "./supabase"
import type { Vacation, VacationSummary, VacationType } from "@/types"
import { calculateVacationDays } from "./utils"
import { validate as validateUUID } from "uuid"

// Get all vacation types
export async function getVacationTypes(): Promise<VacationType[]> {
  const supabase = getServerSupabase()

  const { data, error } = await supabase.from("vacation_types").select("*").order("id")

  if (error) {
    console.error("Error fetching vacation types:", error)
    throw new Error("Failed to fetch vacation types")
  }

  return data || []
}

// Get vacations for a user
export async function getUserVacations(userId: string): Promise<Vacation[]> {
  // Validate UUID format
  if (!userId || !validateUUID(userId)) {
    console.error("Invalid or missing UUID format:", userId)
    return []
  }

  try {
    // First, verify that the user is authenticated and the session is valid
    const supabase = getServerSupabase()
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    // Handle session errors gracefully
    if (sessionError) {
      console.error("Error getting session:", sessionError)
      throw new Error("Authentication error: Unable to verify your session")
    }

    // Handle missing session
    if (!sessionData.session) {
      console.log("No active session found, returning empty vacations")
      throw new Error("No active session found")
    }

    // Handle missing user in session
    const sessionUser = sessionData.session.user
    if (!sessionUser) {
      console.error("No user in session")
      throw new Error("User information not found in session")
    }

    // Verify the user ID matches the session user
    if (sessionUser.id !== userId) {
      console.error("User ID mismatch between session and requested ID")
      throw new Error("Security error: User ID mismatch")
    }

    // Fetch vacations
    const { data, error } = await supabase
      .from("vacations")
      .select(`
        *,
        vacation_type:vacation_types(*)
      `)
      .eq("user_id", userId)
      .order("start_date", { ascending: false })

    if (error) {
      console.error("Error fetching vacations:", error)
      return []
    }

    return data || []
  } catch (error) {
    // Check if this is one of our known authentication errors
    if (error instanceof Error) {
      if (error.message === "No active session found") {
        // This is expected when user is not logged in
        console.log("User not logged in, returning empty vacations")
        return []
      } else if (error.message.includes("Authentication error") ||
                error.message.includes("User information not found") ||
                error.message.includes("Security error")) {
        // These are authentication-related errors
        console.error("Authentication error in getUserVacations:", error.message)
        return []
      }
    }

    // For any other unexpected errors
    console.error("Unexpected error in getUserVacations:", error)
    return []
  }
}

// Get upcoming vacations for a user
export async function getUpcomingVacations(userId: string): Promise<Vacation[]> {
  // Validate UUID format
  if (!userId || !validateUUID(userId)) {
    console.error("Invalid or missing UUID format:", userId)
    return []
  }

  try {
    const supabase = getServerSupabase()
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("vacations")
      .select(`
        *,
        vacation_type:vacation_types(*)
      `)
      .eq("user_id", userId)
      .gte("end_date", today)
      .order("start_date")

    if (error) {
      console.error("Error fetching upcoming vacations:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error in getUpcomingVacations:", error)
    return []
  }
}

// Get all vacations for a user for calendar view
export async function getUserVacationsForCalendar(userId: string): Promise<Vacation[]> {
  // Validate UUID format
  if (!userId || !validateUUID(userId)) {
    console.error("Invalid or missing UUID format:", userId)
    return []
  }

  try {
    // First, verify that the user is authenticated and the session is valid
    const supabase = getServerSupabase()
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    // Handle session errors gracefully
    if (sessionError) {
      console.error("Error getting session:", sessionError)
      throw new Error("Authentication error: Unable to verify your session")
    }

    // Handle missing session
    if (!sessionData.session) {
      console.log("No active session found, returning empty vacations for calendar")
      throw new Error("No active session found")
    }

    // Handle missing user in session
    const sessionUser = sessionData.session.user
    if (!sessionUser) {
      console.error("No user in session")
      throw new Error("User information not found in session")
    }

    // Verify the user ID matches the session user
    if (sessionUser.id !== userId) {
      console.error("User ID mismatch between session and requested ID")
      throw new Error("Security error: User ID mismatch")
    }

    // Get all vacations for the user
    const { data, error } = await supabase
      .from("vacations")
      .select(`
        id,
        user_id,
        vacation_type_id,
        start_date,
        end_date,
        status,
        notes,
        vacation_type:vacation_types(*)
      `)
      .eq("user_id", userId)
      .order("start_date", { ascending: false })

    if (error) {
      console.error("Error fetching vacations for calendar:", error)
      return []
    }

    return data || []
  } catch (error) {
    // Check if this is one of our known authentication errors
    if (error instanceof Error) {
      if (error.message === "No active session found") {
        // This is expected when user is not logged in
        console.log("User not logged in, returning empty vacations for calendar")
        return []
      } else if (error.message.includes("Authentication error") ||
                error.message.includes("User information not found") ||
                error.message.includes("Security error")) {
        // These are authentication-related errors
        console.error("Authentication error in getUserVacationsForCalendar:", error.message)
        return []
      }
    }

    // For any other unexpected errors
    console.error("Unexpected error in getUserVacationsForCalendar:", error)
    return []
  }
}

// Get vacation summary for a user
export async function getVacationSummary(userId: string): Promise<VacationSummary> {
  // Default summary object
  const defaultSummary = {
    used: 0,
    remaining: 0,
    pending: 0,
    total: 21, // Default total days
  }

  // Validate UUID format
  if (!userId || !validateUUID(userId)) {
    console.error("Invalid or missing UUID format:", userId)
    return defaultSummary
  }

  try {
    // First, verify that the user is authenticated and the session is valid
    const supabase = getServerSupabase()
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    // Handle session errors gracefully
    if (sessionError) {
      console.error("Error getting session:", sessionError)
      throw new Error("Authentication error: Unable to verify your session")
    }

    // Handle missing session
    if (!sessionData.session) {
      console.log("No active session found, returning default summary")
      throw new Error("No active session found")
    }

    // Handle missing user in session
    const sessionUser = sessionData.session.user
    if (!sessionUser) {
      console.error("No user in session")
      throw new Error("User information not found in session")
    }

    // Verify the user ID matches the session user
    if (sessionUser.id !== userId) {
      console.error("User ID mismatch between session and requested ID")
      throw new Error("Security error: User ID mismatch")
    }

    // Get user's total vacation days
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("total_vacation_days")
      .eq("id", userId)

    // Check if user data exists
    if (userError || !userData || userData.length === 0) {
      console.log("User not found in database, creating new user record")

      // Create user record in the users table
      const { error: createUserError } = await supabase.from("users").insert({
        id: userId,
        email: sessionUser.email || "",
        name: sessionUser.user_metadata?.name || sessionUser.email?.split("@")[0] || "User",
        total_vacation_days: 21, // Default value
        profile_image_url: null, // Required field but can be null
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (createUserError) {
        console.error("Error creating user record:", createUserError)
        return defaultSummary
      }

      // Also create default user preferences
      try {
        await supabase.from("user_preferences").insert({
          user_id: userId,
          theme: "light",
          language: "en",
          notifications_enabled: true,
          calendar_sync_enabled: false,
          updated_at: new Date().toISOString(),
        })
      } catch (prefError) {
        console.error("Error creating user preferences:", prefError)
        // Continue anyway, this is not critical
      }

      // Return default summary with the default total days
      return {
        used: 0,
        remaining: 21,
        pending: 0,
        total: 21,
      }
    }

    // Use the first user record if multiple were returned
    const totalDays = userData[0]?.total_vacation_days || 21

    // Get all approved vacations for the current year
    const currentYear = new Date().getFullYear()
    const startOfYear = `${currentYear}-01-01`
    const endOfYear = `${currentYear}-12-31`

    const { data: approvedVacations, error: approvedError } = await supabase
      .from("vacations")
      .select("start_date, end_date")
      .eq("user_id", userId)
      .eq("status", "approved")
      .gte("start_date", startOfYear)
      .lte("end_date", endOfYear)

    if (approvedError) {
      console.error("Error fetching approved vacations:", approvedError)
      return { ...defaultSummary, total: totalDays }
    }

    // Get all pending vacations
    const { data: pendingVacations, error: pendingError } = await supabase
      .from("vacations")
      .select("start_date, end_date")
      .eq("user_id", userId)
      .eq("status", "pending")
      .gte("start_date", startOfYear)
      .lte("end_date", endOfYear)

    if (pendingError) {
      console.error("Error fetching pending vacations:", pendingError)
      return { ...defaultSummary, total: totalDays }
    }

    // Calculate used days
    let usedDays = 0
    for (const vacation of approvedVacations || []) {
      usedDays += calculateVacationDays(new Date(vacation.start_date), new Date(vacation.end_date))
    }

    // Calculate pending days
    let pendingDays = 0
    for (const vacation of pendingVacations || []) {
      pendingDays += calculateVacationDays(new Date(vacation.start_date), new Date(vacation.end_date))
    }

    return {
      used: usedDays,
      pending: pendingDays,
      remaining: totalDays - usedDays,
      total: totalDays,
    }
  } catch (error) {
    // Check if this is one of our known authentication errors
    if (error instanceof Error) {
      if (error.message === "No active session found") {
        // This is expected when user is not logged in
        console.log("User not logged in, returning default summary")
        return defaultSummary
      } else if (error.message.includes("Authentication error") ||
                error.message.includes("User information not found") ||
                error.message.includes("Security error")) {
        // These are authentication-related errors
        console.error("Authentication error in getVacationSummary:", error.message)
        return defaultSummary
      }
    }

    // For any other unexpected errors
    console.error("Unexpected error in getVacationSummary:", error)
    return defaultSummary
  }
}

// Get user notifications
export async function getUserNotifications(userId: string) {
  // Validate UUID format
  if (!userId || !validateUUID(userId)) {
    console.error("Invalid or missing UUID format:", userId)
    return []
  }

  try {
    const supabase = getServerSupabase()

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching notifications:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error in getUserNotifications:", error)
    return []
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  // Validate UUID format
  if (!notificationId || !validateUUID(notificationId)) {
    console.error("Invalid or missing UUID format:", notificationId)
    return { success: false }
  }

  try {
    const supabase = getServerSupabase()

    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

    if (error) {
      console.error("Error marking notification as read:", error)
      return { success: false }
    }

    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error in markNotificationAsRead:", error)
    return { success: false }
  }
}

// Create a new vacation request
export async function createVacation(
  userId: string,
  vacationTypeId: number,
  startDate: Date,
  endDate: Date,
  notes?: string,
): Promise<{ success: boolean; message: string; vacation?: Vacation }> {
  // Validate UUID format
  if (!userId || !validateUUID(userId)) {
    console.error("Invalid or missing UUID format:", userId)
    return {
      success: false,
      message: "Invalid user ID format",
    }
  }

  try {
    const supabase = getServerSupabase()

    const { data, error } = await supabase
      .from("vacations")
      .insert({
        user_id: userId,
        vacation_type_id: vacationTypeId,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        notes,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating vacation:", error)
      return {
        success: false,
        message: "Failed to create vacation request",
      }
    }

    // Create a notification
    await supabase.from("notifications").insert({
      user_id: userId,
      message: `Your vacation request from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} has been submitted and is pending approval.`,
      vacation_id: data.id,
    })

    revalidatePath("/")

    return {
      success: true,
      message: "Vacation request created successfully",
      vacation: data,
    }
  } catch (error) {
    console.error("Unexpected error in createVacation:", error)
    return {
      success: false,
      message: "An unexpected error occurred while creating your vacation request",
    }
  }
}

// Update vacation status
export async function updateVacationStatus(
  vacationId: string,
  status: "approved" | "rejected",
): Promise<{ success: boolean; message: string }> {
  // Validate UUID format
  if (!vacationId || !validateUUID(vacationId)) {
    console.error("Invalid or missing UUID format:", vacationId)
    return {
      success: false,
      message: "Invalid vacation ID format",
    }
  }

  try {
    const supabase = getServerSupabase()

    const { data, error } = await supabase
      .from("vacations")
      .update({ status, updated_at: new Date().toISOString() })
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

    // Create a notification
    await supabase.from("notifications").insert({
      user_id: data.user_id,
      message: `Your vacation request from ${new Date(data.start_date).toLocaleDateString()} to ${new Date(data.end_date).toLocaleDateString()} has been ${status}.`,
      vacation_id: vacationId,
    })

    revalidatePath("/")

    return {
      success: true,
      message: `Vacation ${status} successfully`,
    }
  } catch (error) {
    console.error("Unexpected error in updateVacationStatus:", error)
    return {
      success: false,
      message: "An unexpected error occurred while updating the vacation status",
    }
  }
}

// Delete a vacation
export async function deleteVacation(vacationId: string): Promise<{ success: boolean; message: string }> {
  // Validate UUID format
  if (!vacationId || !validateUUID(vacationId)) {
    console.error("Invalid or missing UUID format:", vacationId)
    return {
      success: false,
      message: "Invalid vacation ID format",
    }
  }

  try {
    const supabase = getServerSupabase()

    const { error } = await supabase.from("vacations").delete().eq("id", vacationId)

    if (error) {
      console.error("Error deleting vacation:", error)
      return {
        success: false,
        message: "Failed to delete vacation",
      }
    }

    revalidatePath("/")

    return {
      success: true,
      message: "Vacation deleted successfully",
    }
  } catch (error) {
    console.error("Unexpected error in deleteVacation:", error)
    return {
      success: false,
      message: "An unexpected error occurred while deleting the vacation",
    }
  }
}
