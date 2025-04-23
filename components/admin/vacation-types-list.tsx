"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/hooks/use-translations"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { deleteVacationType } from "@/lib/admin-actions"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { VacationType } from "@/types"
import { EditVacationTypeForm } from "./edit-vacation-type-form"

interface VacationTypesListProps {
  vacationTypes: VacationType[]
}

export function VacationTypesList({ vacationTypes }: VacationTypesListProps) {
  const { t } = useTranslations()
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<VacationType | null>(null)
  const [action, setAction] = useState<"edit" | "delete" | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteVacationType = async () => {
    if (!selectedType) return

    setIsDeleting(true)

    try {
      const result = await deleteVacationType(selectedType.id)

      if (result.success) {
        toast({
          title: t("admin.vacationTypes.typeDeleted"),
          description: result.message,
          variant: "success",
        })

        setSelectedType(null)
        setAction(null)
        router.refresh()
      } else {
        toast({
          title: t("admin.vacationTypes.deleteFailed"),
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting vacation type:", error)
      toast({
        title: t("admin.vacationTypes.deleteFailed"),
        description: t("common.errorMessages.unexpectedError"),
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!vacationTypes.length) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">{t("admin.vacationTypes.noTypes")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {vacationTypes.map((type) => (
        <Card key={type.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div
                  className="w-8 h-8 rounded-full mr-3 flex items-center justify-center text-white"
                  style={{ backgroundColor: type.color }}
                >
                  {type.icon && <span className="text-sm">{type.icon}</span>}
                </div>
                <div>
                  <div className="font-medium">{type.name}</div>
                  {type.description && (
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedType(type)
                    setAction("edit")
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {t("common.edit")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedType(type)
                    setAction("delete")
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t("common.delete")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Edit Vacation Type Dialog */}
      <Dialog
        open={!!selectedType && action === "edit"}
        onOpenChange={() => {
          setSelectedType(null)
          setAction(null)
        }}
      >
        <DialogContent>
          {selectedType && (
            <EditVacationTypeForm
              vacationType={selectedType}
              onSuccess={() => {
                setSelectedType(null)
                setAction(null)
                router.refresh()
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Vacation Type Dialog */}
      <Dialog
        open={!!selectedType && action === "delete"}
        onOpenChange={() => {
          setSelectedType(null)
          setAction(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.vacationTypes.deleteType")}</DialogTitle>
            <DialogDescription>
              {t("admin.vacationTypes.deleteTypeDescription")}
            </DialogDescription>
          </DialogHeader>

          {selectedType && (
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedType.color }}
                  >
                    {selectedType.icon && <span className="text-xs">{selectedType.icon}</span>}
                  </div>
                  <div className="font-medium">{selectedType.name}</div>
                </div>
                {selectedType.description && (
                  <div className="text-sm text-muted-foreground mt-1">{selectedType.description}</div>
                )}
              </div>

              <div className="text-sm text-destructive">
                {t("admin.vacationTypes.deleteWarning")}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedType(null)
                setAction(null)
              }}
              disabled={isDeleting}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteVacationType} disabled={isDeleting}>
              {isDeleting ? t("common.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
