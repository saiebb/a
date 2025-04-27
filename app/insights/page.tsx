"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart as PieChartIcon, BarChart as BarChartIcon, LineChart as LineChartIcon, Lightbulb } from "lucide-react"
import { EnhancedPieChart } from "@/components/charts/enhanced-pie-chart"
import { EnhancedBarChart } from "@/components/charts/enhanced-bar-chart"
import { EnhancedLineChart } from "@/components/charts/enhanced-line-chart"
import { useTranslations } from "@/hooks/use-translations"
import { useLanguage } from "@/lib/i18n/client"

// This would normally come from an API
const mockData = {
  byType: [
    { name: "Regular", value: 10, color: "#4CAF50" },
    { name: "Casual", value: 5, color: "#ADD8E6" },
    { name: "Sick", value: 3, color: "#FF8A65" },
    { name: "Personal", value: 2, color: "#9C27B0" },
  ],
  byMonth: [
    { name: "Jan", value: 1 },
    { name: "Feb", value: 0 },
    { name: "Mar", value: 2 },
    { name: "Apr", value: 3 },
    { name: "May", value: 4 },
    { name: "Jun", value: 2 },
    { name: "Jul", value: 0 },
    { name: "Aug", value: 5 },
    { name: "Sep", value: 3 },
    { name: "Oct", value: 0 },
    { name: "Nov", value: 0 },
    { name: "Dec", value: 0 },
  ],
  trends: [
    {
      name: "Vacation Days",
      data: [
        { name: "2023-Q1", value: 5 },
        { name: "2023-Q2", value: 7 },
        { name: "2023-Q3", value: 10 },
        { name: "2023-Q4", value: 8 },
        { name: "2024-Q1", value: 6 },
        { name: "2024-Q2", value: 9 }
      ],
      color: "#4CAF50"
    },
    {
      name: "Sick Days",
      data: [
        { name: "2023-Q1", value: 2 },
        { name: "2023-Q2", value: 1 },
        { name: "2023-Q3", value: 0 },
        { name: "2023-Q4", value: 3 },
        { name: "2024-Q1", value: 2 },
        { name: "2024-Q2", value: 1 }
      ],
      color: "#FF8A65"
    }
  ],
  insights: [
    "You've used 48% of your annual vacation allowance.",
    "August was your most active vacation month.",
    "You tend to take more vacations on Mondays and Fridays.",
    "You haven't taken any sick leave in the last 3 months.",
    "Consider planning your remaining 11 days before the year ends.",
  ],
}

export default function InsightsPage() {
  const { t } = useTranslations()
  const { locale, isRTL } = useLanguage()

  // Traducir los nombres de los meses si es necesario
  const monthNames = {
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
  }

  // Traducir los tipos de vacaciones
  const vacationTypeNames = {
    en: {
      "Regular": "Regular",
      "Casual": "Casual",
      "Sick": "Sick",
      "Personal": "Personal"
    },
    ar: {
      "Regular": "عادية",
      "Casual": "عارضة",
      "Sick": "مرضية",
      "Personal": "شخصية"
    }
  }

  // Traducir los trimestres
  const quarterNames = {
    en: {
      "2023-Q1": "2023-Q1",
      "2023-Q2": "2023-Q2",
      "2023-Q3": "2023-Q3",
      "2023-Q4": "2023-Q4",
      "2024-Q1": "2024-Q1",
      "2024-Q2": "2024-Q2"
    },
    ar: {
      "2023-Q1": "2023-ر1",
      "2023-Q2": "2023-ر2",
      "2023-Q3": "2023-ر3",
      "2023-Q4": "2023-ر4",
      "2024-Q1": "2024-ر1",
      "2024-Q2": "2024-ر2"
    }
  }

  // Traducir los nombres de las series
  const seriesNames = {
    en: {
      "Vacation Days": "Vacation Days",
      "Sick Days": "Sick Days"
    },
    ar: {
      "Vacation Days": "أيام الإجازة",
      "Sick Days": "أيام المرض"
    }
  }

  // Formatear los datos para los gráficos
  const formattedByMonth = mockData.byMonth.map((item, index) => ({
    ...item,
    name: monthNames[locale as keyof typeof monthNames][index]
  }))

  const formattedByType = mockData.byType.map(item => ({
    ...item,
    name: vacationTypeNames[locale as keyof typeof vacationTypeNames][item.name as keyof typeof vacationTypeNames[typeof locale]]
  }))

  const formattedTrends = mockData.trends.map(series => ({
    ...series,
    name: seriesNames[locale as keyof typeof seriesNames][series.name as keyof typeof seriesNames[typeof locale]],
    data: series.data.map(item => ({
      ...item,
      name: quarterNames[locale as keyof typeof quarterNames][item.name as keyof typeof quarterNames[typeof locale]]
    }))
  }))

  // Formatear valores para los gráficos
  const formatDays = (value: number) => {
    return `${value} ${value === 1 ? t("common.day", "day") : t("common.days", "days")}`
  }

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <h1 className="text-2xl font-bold">{t("insights.title", "Vacation Insights")}</h1>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">
              <PieChartIcon className="h-4 w-4 mr-2" />
              {t("insights.overview", "Overview")}
            </TabsTrigger>
            <TabsTrigger value="monthly">
              <BarChartIcon className="h-4 w-4 mr-2" />
              {t("insights.monthly", "Monthly")}
            </TabsTrigger>
            <TabsTrigger value="trends">
              <LineChartIcon className="h-4 w-4 mr-2" />
              {t("insights.trends", "Trends")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("insights.vacationByType", "Vacation by Type")}</CardTitle>
                  <CardDescription>{t("insights.vacationByTypeDescription", "Distribution of your vacation days by type")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <EnhancedPieChart
                    data={formattedByType}
                    height={300}
                    innerRadius={60}
                    outerRadius={100}
                    valueFormatter={formatDays}
                    showLabels={true}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("insights.smartInsights", "Smart Insights")}</CardTitle>
                  <CardDescription>{t("insights.smartInsightsDescription", "Personalized insights based on your vacation patterns")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {mockData.insights.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <div className="bg-primary/20 text-primary rounded-full p-1 mr-3 mt-0.5">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("insights.monthlyDistribution", "Monthly Distribution")}</CardTitle>
                <CardDescription>{t("insights.monthlyDistributionDescription", "Your vacation days usage by month")}</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedBarChart
                  data={formattedByMonth}
                  height={300}
                  valueFormatter={formatDays}
                  xAxisLabel={t("common.months", "Months")}
                  yAxisLabel={t("common.days", "Days")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("insights.vacationTrends", "Vacation Trends")}</CardTitle>
                <CardDescription>{t("insights.vacationTrendsDescription", "Analysis of your vacation patterns over time")}</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedLineChart
                  series={formattedTrends}
                  height={300}
                  valueFormatter={formatDays}
                  xAxisLabel={t("common.quarters", "Quarters")}
                  yAxisLabel={t("common.days", "Days")}
                  curved={true}
                  showDots={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
