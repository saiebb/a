import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInDays, format, isWeekend } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return format(dateObj, "MMM dd, yyyy")
}

export function calculateVacationDays(startDate: Date, endDate: Date, excludeWeekends = true): number {
  try {
    // Ensure we're working with Date objects
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error("Invalid date provided to calculateVacationDays", { startDate, endDate })
      return 0
    }

    // Calculate total days (inclusive of start and end date)
    let days = differenceInDays(end, start) + 1
    console.log("Total days including weekends:", days)

    // If end date is before start date, return 0
    if (days <= 0) {
      console.log("End date is before or same as start date")
      return 0
    }

    if (excludeWeekends) {
      const currentDate = new Date(start)
      let weekendDays = 0

      while (currentDate <= end) {
        if (isWeekend(currentDate)) {
          weekendDays++
          console.log("Weekend day found:", currentDate.toISOString().split("T")[0])
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }

      console.log("Weekend days to exclude:", weekendDays)
      days -= weekendDays
    }

    return Math.max(0, days) // Ensure we don't return negative days
  } catch (error) {
    console.error("Error in calculateVacationDays:", error)
    return 0
  }
}

export function getVacationTypeColor(typeId: number): string {
  const colors: Record<number, string> = {
    1: "#4CAF50", // Regular
    2: "#ADD8E6", // Casual
    3: "#FF8A65", // Sick
    4: "#9C27B0", // Personal
    5: "#FFC107", // Public Holiday
  }

  return colors[typeId] || "#4CAF50"
}
