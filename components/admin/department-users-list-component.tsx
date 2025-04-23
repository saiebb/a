"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { UserPlus, Mail, Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getAllUsers, assignUserToDepartment } from "@/lib/admin-actions"
import { formatDate } from "@/lib/utils"
import type { User } from "@/types"

interface DepartmentUsersListProps {
  departmentId: string
}

export function DepartmentUsersList({ departmentId }: DepartmentUsersListProps) {
  const { t } = useTranslations()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [departmentUsers, setDepartmentUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true)
      try {
        const allUsers = await getAllUsers()
        setUsers(allUsers)
        setDepartmentUsers(allUsers.filter(user => user.department_id === departmentId))
      } catch (error) {
        console.error("Error loading users:", error)
        toast({
          title: t("admin.departments.loadUsersFailed"),
          description: t("common.errorMessages.unexpectedError"),
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [departmentId, t])

  const handleAssignUser = async () => {
    if (!selectedUserId) {
      toast({
        title: t("admin.departments.selectUser"),
        variant: "destructive",
      })
      return
    }

    setIsAssigning(true)

    try {
      const result = await assignUserToDepartment(selectedUserId, departmentId)

      if (result.success) {
        toast({
          title: t("admin.departments.userAssigned"),
          description: result.message,
          variant: "success",
        })

        setOpen(false)
        setSelectedUserId("")
        router.refresh()

        // Update the local state
        const updatedUsers = await getAllUsers()
        setUsers(updatedUsers)
        setDepartmentUsers(updatedUsers.filter(user => user.department_id === departmentId))
      } else {
        toast({
          title: t("admin.departments.assignFailed"),
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error assigning user to department:", error)
      toast({
        title: t("admin.departments.assignFailed"),
        description: t("common.errorMessages.unexpectedError"),
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    try {
      const result = await assignUserToDepartment(userId, null)

      if (result.success) {
        toast({
          title: t("admin.departments.userRemoved"),
          description: result.message,
          variant: "success",
        })

        router.refresh()

        // Update the local state
        const updatedUsers = await getAllUsers()
        setUsers(updatedUsers)
        setDepartmentUsers(updatedUsers.filter(user => user.department_id === departmentId))
      } else {
        toast({
          title: t("admin.departments.removeFailed"),
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing user from department:", error)
      toast({
        title: t("admin.departments.removeFailed"),
        description: t("common.errorMessages.unexpectedError"),
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    )
  }

  const availableUsers = users.filter(user => !user.department_id || user.department_id !== departmentId)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {t("admin.departments.totalMembers")}: {departmentUsers.length}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              {t("admin.departments.assignUser")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin.departments.assignUser")}</DialogTitle>
              <DialogDescription>
                {t("admin.departments.assignUserDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                <Label htmlFor="user">{t("admin.departments.selectUser")}</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger id="user">
                    <SelectValue placeholder={t("admin.departments.selectUserPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.length > 0 ? (
                      availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        {t("admin.departments.noAvailableUsers")}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isAssigning}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleAssignUser}
                disabled={isAssigning || !selectedUserId || availableUsers.length === 0}
              >
                {isAssigning ? t("common.assigning") : t("common.assign")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {departmentUsers.length > 0 ? (
        <div className="space-y-4">
          {departmentUsers.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={user.profile_image_url || ""} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    {t("admin.departments.removeFromDepartment")}
                  </Button>
                </div>
                <div className="border-t p-4 flex justify-between items-center">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-1">{t("common.joined")}:</span>
                    <span>{formatDate(user.created_at)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`mailto:${user.email}`} className="text-primary hover:underline">
                      {t("common.contact")}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground">{t("admin.departments.noMembers")}</p>
        </div>
      )}
    </div>
  )
}
