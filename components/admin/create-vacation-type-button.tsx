"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { createVacationType } from "@/lib/admin-actions"
import { ColorPicker } from "./color-picker"
import { IconPicker } from "./icon-picker"

export function CreateVacationTypeButton() {
  const { t } = useTranslations()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#4CAF50")
  const [icon, setIcon] = useState("")

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
    
    setIsLoading(true)
    
    try {
      const result = await createVacationType(name, description || null, color, icon || null)
      
      if (result.success) {
        toast({
          title: t("admin.vacationTypes.typeCreated"),
          description: result.message,
          variant: "success",
        })
        
        setOpen(false)
        setName("")
        setDescription("")
        setColor("#4CAF50")
        setIcon("")
        router.refresh()
      } else {
        toast({
          title: t("admin.vacationTypes.createFailed"),
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating vacation type:", error)
      toast({
        title: t("admin.vacationTypes.createFailed"),
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
          {t("admin.vacationTypes.createType")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.vacationTypes.createType")}</DialogTitle>
          <DialogDescription>
            {t("admin.vacationTypes.createTypeDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("common.creating")}
                </>
              ) : (
                t("common.create")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
