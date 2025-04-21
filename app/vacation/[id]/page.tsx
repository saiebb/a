"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, Clock, Edit, Trash2, ArrowLeft } from "lucide-react"
import { formatDate, getVacationTypeColor } from "@/lib/utils"
import type { Vacation } from "@/types"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

// This would normally come from a server component or API
const mockVacation: Vacation = {
  id: "1",
  user_id: "123e4567-e89b-12d3-a456-426614174000",
  vacation_type_id: 1,
  start_date: "2024-05-10",
  end_date: "2024-05-15",
  notes:
    "Annual family trip to visit relatives in the countryside. Will have limited internet access during this time.",
  status: "approved",
  created_at: "2024-04-01",
  updated_at: "2024-04-02",
  vacation_type: {
    id: 1,
    name: "Regular",
    description: "Standard vacation days",
    color: "#4CAF50",
    icon: "palm-tree",
    created_at: "2024-01-01",
  },
}

export default function VacationDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [vacation, setVacation] = useState<Vacation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    // This would normally fetch from an API
    setVacation(mockVacation)
    setIsLoading(false)
  }, [params.id])

  const handleDelete = async () => {
    setIsDeleting(true)

    // This would normally call an API
    setTimeout(() => {
      toast({
        title: "Vacation deleted",
        description: "Your vacation request has been deleted successfully.",
      })

      router.push("/")
    }, 1000)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-3xl py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-muted rounded"></div>
            <Card>
              <CardHeader>
                <div className="h-6 w-32 bg-muted rounded"></div>
                <div className="h-4 w-48 bg-muted rounded"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-3/4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!vacation) {
    return (
      <MainLayout>
        <div className="container max-w-3xl py-6">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Vacation not found</p>
              <Button asChild className="mt-4">
                <Link href="/">Go back to dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const typeColor = getVacationTypeColor(vacation.vacation_type_id)

  const statusColors = {
    pending: "bg-amber-500",
    approved: "bg-green-500",
    rejected: "bg-red-500",
  }

  return (
    <MainLayout>
      <div className="container max-w-3xl py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Vacation Details</h1>
        </div>

        <Card>
          <div className="h-2" style={{ backgroundColor: typeColor }} />
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>{vacation.vacation_type?.name || `Vacation #${vacation.vacation_type_id}`}</CardTitle>
              <CardDescription>
                {formatDate(vacation.start_date)} - {formatDate(vacation.end_date)}
              </CardDescription>
            </div>
            <Badge className={statusColors[vacation.status]}>
              {vacation.status.charAt(0).toUpperCase() + vacation.status.slice(1)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            {vacation.notes && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Notes</h3>
                <p className="text-sm">{vacation.notes}</p>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Details</h3>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">5 working days</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Requested on</p>
                    <p className="text-sm text-muted-foreground">{formatDate(vacation.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/vacation/${vacation.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your vacation request.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  )
}
