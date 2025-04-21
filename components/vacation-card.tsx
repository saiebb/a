"use client"

import Link from "next/link"
import { formatDate, getVacationTypeColor } from "@/lib/utils"
import type { Vacation } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"

interface VacationCardProps {
  vacation: Vacation
}

export function VacationCard({ vacation }: VacationCardProps) {
  const { t } = useTranslations()
  const startDate = formatDate(vacation.start_date)
  const endDate = formatDate(vacation.end_date)
  const typeColor = getVacationTypeColor(vacation.vacation_type_id)

  const statusColors = {
    pending: "bg-amber-500",
    approved: "bg-green-500",
    rejected: "bg-red-500",
  }

  const statusTranslations = {
    pending: t("vacationStatus.pending"),
    approved: t("vacationStatus.approved"),
    rejected: t("vacationStatus.rejected"),
  }

  return (
    <Link href={`/vacation/${vacation.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="h-2" style={{ backgroundColor: typeColor }} />
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold">
                {vacation.vacation_type?.name || `Vacation #${vacation.vacation_type_id}`}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {startDate} - {endDate}
                </span>
              </div>
            </div>
            <Badge className={statusColors[vacation.status]}>
              {statusTranslations[vacation.status]}
            </Badge>
          </div>

          {vacation.notes && <p className="text-sm mt-2 line-clamp-2">{vacation.notes}</p>}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{t("vacationDetails.requestedOn")} {formatDate(vacation.created_at)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
