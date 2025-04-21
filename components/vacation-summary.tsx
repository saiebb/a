"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { VacationSummary } from "@/types"
import { useTranslations } from "@/hooks/use-translations"

interface VacationSummaryCardProps {
  summary: VacationSummary
}

export function VacationSummaryCard({ summary }: VacationSummaryCardProps) {
  const { t } = useTranslations()
  const usedPercentage = Math.round((summary.used / summary.total) * 100)
  const pendingPercentage = Math.round((summary.pending / summary.total) * 100)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t("vacationSummary.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">{t("vacationSummary.used")}</p>
              <p className="text-2xl font-bold">{summary.used} {summary.used === 1 ? t("common.day") : t("common.days")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{t("vacationSummary.remaining")}</p>
              <p className="text-2xl font-bold text-primary">{summary.remaining} {summary.remaining === 1 ? t("common.day") : t("common.days")}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("vacationSummary.used")} ({usedPercentage}%)</span>
              <span>
                {summary.used} / {summary.total}
              </span>
            </div>
            <Progress value={usedPercentage} className="h-2" />
          </div>

          {summary.pending > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("vacationSummary.pending")} ({pendingPercentage}%)</span>
                <span>
                  {summary.pending} / {summary.total}
                </span>
              </div>
              <Progress value={pendingPercentage} className="h-2 bg-muted" indicatorClassName="bg-amber-500" />
            </div>
          )}

          <div className="pt-2 text-sm text-muted-foreground">
            <p>{t("vacationSummary.annualAllowance", { days: summary.total })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
