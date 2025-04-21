"use server"

import { revalidatePath } from "next/cache"
import { getServerSupabase } from "@/lib/supabase"
import { z } from "zod"
import { validate as validateUUID } from "uuid"
import { getCurrentUser } from "@/lib/auth"
import { getServerUser } from "@/lib/server-auth"

const vacationSchema = z.object({
  vacationType: z.string().min(1, "Vacation type is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z
    .date({
      required_error: "End date is required",
    })
    .refine((date) => date instanceof Date, {
      message: "End date is required",
    }),
  notes: z.string().optional(),
})

export async function createVacationAction(formData: FormData) {
  try {
    console.log("createVacationAction called with formData", Object.fromEntries(formData.entries()))

    // Get the current user from the server
    const serverUser = await getServerUser()

    if (!serverUser || !serverUser.id) {
      console.error("No authenticated user found")
      return {
        success: false,
        message: "You must be logged in to create a vacation request",
      }
    }

    const userId = serverUser.id
    console.log("Using userId from server session:", userId)

    // Parse and validate the form data
    const vacationType = formData.get("vacationType")
    const startDateStr = formData.get("startDate")
    const endDateStr = formData.get("endDate")
    const notes = formData.get("notes")

    console.log("Form data received:", { vacationType, startDateStr, endDateStr, notes })

    if (!vacationType || !startDateStr || !endDateStr) {
      return {
        success: false,
        message: "Missing required fields",
      }
    }

    const startDate = new Date(startDateStr as string)
    const endDate = new Date(endDateStr as string)

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error("Invalid date format:", { startDateStr, endDateStr })
      return {
        success: false,
        message: "Invalid date format",
      }
    }

    // Create the Supabase client
    const supabase = getServerSupabase()

    // Prepare vacation data
    const vacationData = {
      user_id: userId,
      vacation_type_id: Number.parseInt(vacationType as string),
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      notes: notes || null,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Creating vacation with data:", vacationData)

    // Insert the vacation
    const { data, error } = await supabase
      .from("vacations")
      .insert(vacationData)
      .select()

    if (error) {
      console.error("Error creating vacation:", error)
      return {
        success: false,
        message: `Failed to create vacation request: ${error.message}`,
      }
    }

    if (!data || data.length === 0) {
      console.error("No data returned from vacation creation")
      return {
        success: false,
        message: "Failed to create vacation request. No data returned.",
      }
    }

    const createdVacation = data[0]
    console.log("Vacation created successfully:", createdVacation)

    // Create a notification
    try {
      const notificationData = {
        user_id: userId,
        message: `Your vacation request from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} has been submitted and is pending approval.`,
        vacation_id: createdVacation.id,
        created_at: new Date().toISOString(),
        read: false
      }

      await supabase.from("notifications").insert(notificationData)
      console.log("Notification created successfully")
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError)
      // Continue anyway, this is not critical
    }

    // Revalidate the path to update the UI
    revalidatePath("/")

    return {
      success: true,
      message: "Vacation request created successfully",
      vacation: createdVacation,
    }
  } catch (error) {
    console.error("Unexpected error in createVacationAction:", error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation error",
        errors: error.errors,
      }
    }

    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}
