"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDate } from "@/lib/utils"
import { updateUserRole, updateUser, deleteUser } from "@/lib/admin-actions"
import { Pencil, Trash2, Loader2, ShieldAlert, User, UserCog } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "@/hooks/use-translations"
import type { User as UserType } from "@/types"
import type { UserRole } from "@/types/admin"

interface UsersTableProps {
  users: UserType[]
  isSuperAdmin: boolean
}

export function UsersTable({ users, isSuperAdmin }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [action, setAction] = useState<"edit" | "delete" | "role" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    totalVacationDays: 21,
    role: "user" as UserRole,
  })
  const { toast } = useToast()
  const { t } = useTranslations()

  const handleEditUser = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)

    try {
      const result = await updateUser(selectedUser.id, formData.name, formData.email, formData.totalVacationDays)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })

        // Close dialog and reset state
        setSelectedUser(null)
        setAction(null)

        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)

    try {
      const result = await updateUserRole(selectedUser.id, formData.role)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })

        // Close dialog and reset state
        setSelectedUser(null)
        setAction(null)

        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)

    try {
      const result = await deleteUser(selectedUser.id)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })

        // Close dialog and reset state
        setSelectedUser(null)
        setAction(null)

        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleBadge = (role: string | undefined) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-purple-500 text-white">{t("admin.users.superAdmin") || "Super Admin"}</Badge>
      case "admin":
        return <Badge className="bg-blue-500 text-white">{t("admin.users.admin") || "Admin"}</Badge>
      case "manager":
        return <Badge className="bg-green-500 text-white">{t("admin.users.manager") || "Manager"}</Badge>
      case "user":
        return <Badge variant="outline">{t("admin.users.user") || "User"}</Badge>
      default:
        return <Badge variant="outline">{role || t("admin.users.user") || "User"}</Badge>
    }
  }

  const getRoleIcon = (role: string | undefined) => {
    switch (role) {
      case "super_admin":
        return <ShieldAlert className="h-4 w-4 text-purple-500" />
      case "admin":
        return <UserCog className="h-4 w-4 text-blue-500" />
      case "manager":
        return <UserCog className="h-4 w-4 text-green-500" />
      case "user":
        return <User className="h-4 w-4 text-muted-foreground" />
      default:
        return <User className="h-4 w-4 text-muted-foreground" />
    }
  }

  if (users.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">{t("admin.users.noUsers") || "No users found."}</div>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.users.name")}</TableHead>
              <TableHead>{t("admin.users.email")}</TableHead>
              <TableHead>{t("admin.users.role")}</TableHead>
              <TableHead>{t("admin.users.vacationDays")}</TableHead>
              <TableHead>{t("admin.users.created")}</TableHead>
              <TableHead className="text-right">{t("admin.users.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    {getRoleBadge(user.role)}
                  </div>
                </TableCell>
                <TableCell>{user.total_vacation_days}</TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user)
                        setAction("edit")
                        setFormData({
                          name: user.name,
                          email: user.email,
                          totalVacationDays: user.total_vacation_days,
                          role: user.role as UserRole,
                        })
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      {t("admin.users.edit")}
                    </Button>

                    {isSuperAdmin && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
                          onClick={() => {
                            setSelectedUser(user)
                            setAction("role")
                            setFormData({
                              ...formData,
                              role: user.role as UserRole,
                            })
                          }}
                        >
                          <UserCog className="h-4 w-4 mr-1" />
                          {t("admin.users.role")}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                          onClick={() => {
                            setSelectedUser(user)
                            setAction("delete")
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t("admin.users.delete")}
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog
        open={!!selectedUser && action === "edit"}
        onOpenChange={() => {
          setSelectedUser(null)
          setAction(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.users.editUser")}</DialogTitle>
            <DialogDescription>{t("admin.users.editUserDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("admin.users.name")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("admin.users.email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vacationDays">{t("admin.users.vacationDays")}</Label>
              <Input
                id="vacationDays"
                type="number"
                min="0"
                value={formData.totalVacationDays}
                onChange={(e) => setFormData({ ...formData, totalVacationDays: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUser(null)
                setAction(null)
              }}
              disabled={isSubmitting}
            >
              {t("admin.users.cancel")}
            </Button>
            <Button onClick={handleEditUser} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("admin.users.saving")}
                </>
              ) : (
                t("admin.users.saveChanges")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog
        open={!!selectedUser && action === "role"}
        onOpenChange={() => {
          setSelectedUser(null)
          setAction(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.users.updateRole")}</DialogTitle>
            <DialogDescription>{t("admin.users.updateRoleDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="role">{t("admin.users.role")}</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("admin.users.selectRole") || "Select a role"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{t("admin.users.user") || "User"}</SelectItem>
                  <SelectItem value="manager">{t("admin.users.manager") || "Manager"}</SelectItem>
                  <SelectItem value="admin">{t("admin.users.admin") || "Admin"}</SelectItem>
                  <SelectItem value="super_admin">{t("admin.users.superAdmin") || "Super Admin"}</SelectItem>
                </SelectContent>
              </Select>

              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-medium">{t("admin.users.user")}:</span> {t("admin.users.userRoleDescription")}
                <br />
                <span className="font-medium">{t("admin.users.manager")}:</span> {t("admin.users.managerRoleDescription")}
                <br />
                <span className="font-medium">{t("admin.users.admin")}:</span> {t("admin.users.adminRoleDescription")}
                <br />
                <span className="font-medium">{t("admin.users.superAdmin")}:</span> {t("admin.users.superAdminRoleDescription")}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUser(null)
                setAction(null)
              }}
              disabled={isSubmitting}
            >
              {t("admin.users.cancel")}
            </Button>
            <Button onClick={handleUpdateRole} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("admin.users.updating")}
                </>
              ) : (
                t("admin.users.updateRole")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={!!selectedUser && action === "delete"}
        onOpenChange={() => {
          setSelectedUser(null)
          setAction(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.users.deleteUser")}</DialogTitle>
            <DialogDescription>
              {t("admin.users.deleteUserDescription")}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="font-medium">{selectedUser.name}</div>
                <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
              </div>

              <div className="text-sm text-destructive">
                {t("admin.users.deleteWarning")}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUser(null)
                setAction(null)
              }}
              disabled={isSubmitting}
            >
              {t("admin.users.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("admin.users.deleting")}
                </>
              ) : (
                t("admin.users.deleteUser")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
