"use client"

import { useState } from "react"
import { formatDate } from "@/lib/utils"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle } from "lucide-react"
import { approveVacation, rejectVacation } from "@/lib/manager-actions"
import { toast } from "@/hooks/use-toast"
import type { Vacation } from "@/types"

interface PendingVacationsListProps {
  vacations: Vacation[]
}

export function PendingVacationsList({ vacations }: PendingVacationsListProps) {
  const { t } = useTranslations()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [selectedVacation, setSelectedVacation] = useState<Vacation | null>(null)
  const [openRejectDialog, setOpenRejectDialog] = useState(false)

  const handleApprove = async (vacation: Vacation) => {
    try {
      setIsApproving(true)
      setSelectedVacation(vacation)
      
      const result = await approveVacation(vacation.id)
      
      if (result.success) {
        toast({
          title: t("manager.actions.vacationApproved"),
          description: t("manager.actions.vacationApprovedDescription"),
          variant: "success",
        })
        
        // تحديث القائمة (يمكن استخدام إعادة التحميل أو تحديث الحالة)
        window.location.reload()
      } else {
        toast({
          title: t("manager.actions.approvalFailed"),
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving vacation:", error)
      toast({
        title: t("manager.actions.approvalFailed"),
        description: t("manager.actions.unexpectedError"),
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
      setSelectedVacation(null)
    }
  }

  const handleReject = async () => {
    if (!selectedVacation) return
    
    try {
      setIsRejecting(true)
      
      const result = await rejectVacation(selectedVacation.id, rejectReason)
      
      if (result.success) {
        toast({
          title: t("manager.actions.vacationRejected"),
          description: t("manager.actions.vacationRejectedDescription"),
          variant: "success",
        })
        
        setOpenRejectDialog(false)
        setRejectReason("")
        
        // تحديث القائمة (يمكن استخدام إعادة التحميل أو تحديث الحالة)
        window.location.reload()
      } else {
        toast({
          title: t("manager.actions.rejectionFailed"),
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting vacation:", error)
      toast({
        title: t("manager.actions.rejectionFailed"),
        description: t("manager.actions.unexpectedError"),
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
      setSelectedVacation(null)
    }
  }

  const openRejectDialogWithVacation = (vacation: Vacation) => {
    setSelectedVacation(vacation)
    setOpenRejectDialog(true)
  }

  if (!vacations.length) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">{t("manager.dashboard.noPendingRequests")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {vacations.map((vacation) => (
        <Card key={vacation.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-4 border-b">
              <Avatar className="h-10 w-10 mr-4">
                <AvatarImage src={vacation.users?.profile_image_url || ""} alt={vacation.users?.name || ""} />
                <AvatarFallback>{vacation.users?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{vacation.users?.name}</div>
                <div className="text-sm text-muted-foreground">{vacation.users?.email}</div>
              </div>
              <Badge style={{ backgroundColor: vacation.vacation_types?.color || "#888" }}>
                {vacation.vacation_types?.name}
              </Badge>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">{t("vacationForm.startDate")}</div>
                  <div>{formatDate(vacation.start_date)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t("vacationForm.endDate")}</div>
                  <div>{formatDate(vacation.end_date)}</div>
                </div>
              </div>
              {vacation.notes && (
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground">{t("vacationDetails.notes")}</div>
                  <div className="text-sm mt-1">{vacation.notes}</div>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openRejectDialogWithVacation(vacation)}
                  disabled={isApproving || isRejecting}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t("manager.actions.reject")}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleApprove(vacation)}
                  disabled={isApproving || isRejecting}
                >
                  {isApproving && selectedVacation?.id === vacation.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></div>
                      {t("manager.actions.approving")}
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t("manager.actions.approve")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={openRejectDialog} onOpenChange={setOpenRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("manager.actions.rejectVacation")}</DialogTitle>
            <DialogDescription>
              {t("manager.actions.rejectVacationDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={t("manager.actions.rejectReasonPlaceholder")}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenRejectDialog(false)}
              disabled={isRejecting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting}
            >
              {isRejecting ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></div>
                  {t("manager.actions.rejecting")}
                </div>
              ) : (
                t("manager.actions.confirmReject")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
