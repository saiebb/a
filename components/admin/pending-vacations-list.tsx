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
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"
import { updateVacationStatus } from "@/lib/admin-actions"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { VacationWithUser } from "@/types/admin"

interface PendingVacationsListProps {
  vacations: VacationWithUser[]
}

export function PendingVacationsList({ vacations }: PendingVacationsListProps) {
  const [selectedVacation, setSelectedVacation] = useState<VacationWithUser | null>(null)
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [adminNote, setAdminNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleAction = async () => {
    if (!selectedVacation || !action) return

    setIsSubmitting(true)

    try {
      const status = action === "approve" ? "approved" : "rejected"
      const result = await updateVacationStatus(selectedVacation.id, status, adminNote)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })

        // Close dialog and reset state
        setSelectedVacation(null)
        setAction(null)
        setAdminNote("")

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
      console.error("Error updating vacation status:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (vacations.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No pending vacation requests found.</div>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Requested On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vacations.map((vacation) => (
              <TableRow key={vacation.id}>
                <TableCell className="font-medium">
                  <div>{vacation.user.name}</div>
                  <div className="text-xs text-muted-foreground">{vacation.user.email}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: vacation.vacation_type?.color || "#4CAF50",
                      color: "#fff",
                    }}
                  >
                    {vacation.vacation_type?.name || "Vacation"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDate(vacation.start_date)} - {formatDate(vacation.end_date)}
                </TableCell>
                <TableCell>
                  {/* Calculate duration */}
                  {Math.ceil(
                    (new Date(vacation.end_date).getTime() - new Date(vacation.start_date).getTime()) /
                      (1000 * 60 * 60 * 24),
                  ) + 1}{" "}
                  days
                </TableCell>
                <TableCell>{formatDate(vacation.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
                      onClick={() => {
                        setSelectedVacation(vacation)
                        setAction("approve")
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => {
                        setSelectedVacation(vacation)
                        setAction("reject")
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedVacation && !!action}
        onOpenChange={() => {
          setSelectedVacation(null)
          setAction(null)
          setAdminNote("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "approve" ? "Approve Vacation Request" : "Reject Vacation Request"}</DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "Are you sure you want to approve this vacation request?"
                : "Are you sure you want to reject this vacation request?"}
            </DialogDescription>
          </DialogHeader>

          {selectedVacation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Employee</p>
                  <p className="text-sm">{selectedVacation.user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm">{selectedVacation.vacation_type?.name || "Vacation"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm">{formatDate(selectedVacation.start_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-sm">{formatDate(selectedVacation.end_date)}</p>
                </div>
              </div>

              {selectedVacation.notes && (
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm">{selectedVacation.notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">Admin Note (Optional)</p>
                <Textarea
                  placeholder="Add a note to the employee about this decision..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedVacation(null)
                setAction(null)
                setAdminNote("")
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {action === "approve" ? "Approving..." : "Rejecting..."}
                </>
              ) : (
                <>{action === "approve" ? "Approve" : "Reject"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
