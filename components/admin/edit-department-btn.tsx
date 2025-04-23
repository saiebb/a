"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { updateDepartment, getAllManagers } from "@/lib/admin-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Department } from "@/types/department"

interface EditDepartmentButtonProps {
  department: Department
}

export function EditDepartmentButton({ department }: EditDepartmentButtonProps) {
  const { t } = useTranslations()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(department.name)
  const [description, setDescription] = useState(department.description || "")
  const [managerId, setManagerId] = useState(department.manager_id || "")
  const [managers, setManagers] = useState<{ id: string; name: string; email: string }[]>([])
  const [isLoadingManagers, setIsLoadingManagers] = useState(false)

  useEffect(() => {
    const loadManagers = async () => {
      setIsLoadingManagers(true)
      try {
        const managersData = await getAllManagers()
        setManagers(managersData)
      } catch (error) {
        console.error("Error loading managers:", error)
      } finally {
        setIsLoadingManagers(false)
      }
    }

    if (open) {
      loadManagers()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: t("admin.departments.nameRequired"),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await updateDepartment(department.id, name, description, managerId || undefined)

      if (result.success) {
        toast({
          title: t("admin.departments.departmentUpdated"),
          description: result.message,
          variant: "success",
        })

        setOpen(false)
        router.refresh()
      } else {
        toast({
          title: t("admin.departments.updateFailed"),
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating department:", error)
      toast({
        title: t("admin.departments.updateFailed"),
        description: t("common.errorMessages.unexpectedError"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          {t("admin.departments.editDepartment")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.departments.editDepartment")}</DialogTitle>
          <DialogDescription>
            {t("admin.departments.editDepartmentDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("admin.departments.name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("admin.departments.namePlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("admin.departments.description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("admin.departments.descriptionPlaceholder")}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manager">{t("admin.departments.manager")}</Label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger id="manager" disabled={isLoadingManagers}>
                <SelectValue placeholder={t("admin.departments.selectManager")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("admin.departments.noManager")}</SelectItem>
                {managers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.name} ({manager.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
