"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { deleteDepartment } from "@/lib/admin-actions"
import type { Department } from "@/types/department"

interface DeleteDepartmentButtonProps {
  department: Department
}

export function DeleteDepartmentButton({ department }: DeleteDepartmentButtonProps) {
  const { t } = useTranslations()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await deleteDepartment(department.id)

      if (result.success) {
        toast({
          title: t("admin.departments.departmentDeleted"),
          description: result.message,
          variant: "success",
        })

        setOpen(false)
        router.push("/admin/departments")
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Error deleting department:", error)
      setError(t("common.errorMessages.unexpectedError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash className="mr-2 h-4 w-4" />
          {t("admin.departments.deleteDepartment")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.departments.deleteDepartment")}</DialogTitle>
          <DialogDescription>
            {t("admin.departments.deleteDepartmentDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">{`${t("admin.departments.deleteConfirmation")} ${department.name}?`}</p>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
              {error}
            </div>
          )}
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? t("common.deleting") : t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
