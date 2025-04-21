"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUserNotifications, markNotificationAsRead } from "@/lib/actions"
import type { Notification } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { getCurrentUser } from "@/lib/auth"

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get the current user ID
    async function getUserId() {
      try {
        const user = await getCurrentUser()
        if (user?.id) {
          setUserId(user.id)
        } else {
          console.log("No user found or user ID is missing")
          setLoading(false)
        }
      } catch (error) {
        console.error("Error getting current user:", error)
        setLoading(false)
      }
    }

    getUserId()
  }, [])

  // Fetch notifications when userId is available
  useEffect(() => {
    if (!userId) return

    async function fetchNotifications() {
      try {
        setLoading(true)
        setError(null)

        const data = await getUserNotifications(userId)

        // Check if data is an array (successful response)
        if (Array.isArray(data)) {
          setNotifications(data)
          setUnreadCount(data.filter((n) => !n.read).length)
        } else {
          // Handle unexpected response format
          console.error("Unexpected response format:", data)
          setError("Failed to load notifications")
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
        setError("Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [userId])

  async function handleMarkAsRead(id: string) {
    if (!userId) return

    try {
      const result = await markNotificationAsRead(id)

      if (result.success) {
        // Update local state
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } else {
        console.error("Failed to mark notification as read")
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // If no user is logged in, don't render the dropdown
  if (!userId && !loading) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-accent" />}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Loading notifications...</div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-destructive">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 ${!notification.read ? "bg-muted/50" : ""}`}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <div className="text-sm font-medium">{notification.message}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
