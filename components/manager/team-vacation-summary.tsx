"use client"

import { useTranslations } from "@/hooks/use-translations"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { TeamVacationSummary } from "@/types/manager"

interface TeamVacationSummaryProps {
  summary: TeamVacationSummary
}

export function TeamVacationSummary({ summary }: TeamVacationSummaryProps) {
  const { t } = useTranslations()

  // حساب إجمالي الإجازات حسب النوع
  const totalVacationsByType = summary.vacationsByType.reduce((acc, item) => acc + item.count, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">{t("manager.dashboard.onVacationToday")}</div>
            <div className="text-2xl font-bold mt-1">{summary.onVacationToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">{t("manager.dashboard.upcomingVacations")}</div>
            <div className="text-2xl font-bold mt-1">{summary.upcomingVacations}</div>
          </CardContent>
        </Card>
      </div>

      {summary.vacationsByType.length > 0 ? (
        <div className="space-y-3">
          <div className="text-sm font-medium">{t("manager.dashboard.vacationsByType")}</div>
          {summary.vacationsByType.map((item) => (
            <div key={item.typeId} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{item.typeName}</span>
                <span>{item.count} {t(item.count === 1 ? "common.day" : "common.days")}</span>
              </div>
              <Progress 
                value={totalVacationsByType ? (item.count / totalVacationsByType) * 100 : 0} 
                className="h-2"
                style={{ backgroundColor: `${item.color}40` }} // استخدام لون النوع مع شفافية
                indicatorStyle={{ backgroundColor: item.color }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted-foreground">{t("manager.dashboard.noVacationData")}</p>
        </div>
      )}
    </div>
  )
}
