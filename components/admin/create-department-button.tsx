"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { createDepartment } from "@/lib/admin-actions"

export function CreateDepartmentButton() {
  const { t } = useTranslations()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

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
      const result = await createDepartment(name, description)
      
      if (result.success) {
        toast({
          title: t("admin.departments.departmentCreated"),
          description: result.message,
          variant: "success",
        })
        
        setOpen(false)
        setName("")
        setDescription("")
        router.refresh()
        
        // إذا تم إنشاء القسم بنجاح وتم إرجاع معرف القسم، انتقل إلى صفحة القسم
        if (result.department?.id) {
          router.push(`/admin/departments/${result.department.id}`)
        }
      } else {
        toast({
          title: t("admin.departments.createFailed"),
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating department:", error)
      toast({
        title: t("admin.departments.createFailed"),
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.departments.createDepartment")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.departments.createDepartment")}</DialogTitle>
          <DialogDescription>
            {t("admin.departments.createDepartmentDescription")}
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
              {isLoading ? t("common.creating") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
