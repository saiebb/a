"use client"

import { useState } from "react"
import { useTranslations } from "@/hooks/use-translations"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { updateVacationType } from "@/lib/admin-actions"
import { Loader2 } from "lucide-react"
import type { VacationType } from "@/types"
import { ColorPicker } from "./color-picker"
import { IconPicker } from "./icon-picker"

interface EditVacationTypeFormProps {
  vacationType: VacationType
  onSuccess: () => void
}

export function EditVacationTypeForm({ vacationType, onSuccess }: EditVacationTypeFormProps) {
  const { t } = useTranslations()
  const [name, setName] = useState(vacationType.name)
  const [description, setDescription] = useState(vacationType.description || "")
  const [color, setColor] = useState(vacationType.color)
  const [icon, setIcon] = useState(vacationType.icon || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast({
        title: t("admin.vacationTypes.nameRequired"),
        variant: "destructive",
      })
      return
    }
    
    if (!color) {
      toast({
        title: t("admin.vacationTypes.colorRequired"),
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await updateVacationType(
        vacationType.id,
        name,
        description || null,
        color,
        icon || null
      )
      
      if (result.success) {
        toast({
          title: t("admin.vacationTypes.typeUpdated"),
          description: result.message,
          variant: "success",
        })
        
        onSuccess()
      } else {
        toast({
          title: t("admin.vacationTypes.updateFailed"),
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating vacation type:", error)
      toast({
        title: t("admin.vacationTypes.updateFailed"),
        description: t("common.errorMessages.unexpectedError"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{t("admin.vacationTypes.editType")}</DialogTitle>
        <DialogDescription>
          {t("admin.vacationTypes.editTypeDescription")}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("admin.vacationTypes.name")}</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("admin.vacationTypes.namePlaceholder")}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">{t("admin.vacationTypes.description")}</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("admin.vacationTypes.descriptionPlaceholder")}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label>{t("admin.vacationTypes.color")}</Label>
          <ColorPicker color={color} onChange={setColor} />
        </div>
        
        <div className="space-y-2">
          <Label>{t("admin.vacationTypes.icon")}</Label>
          <IconPicker icon={icon} onChange={setIcon} />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("common.saving")}
            </>
          ) : (
            t("common.save")
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
