"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, BarChart, LineChart } from "lucide-react"

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
  insights: [
    "You've used 48% of your annual vacation allowance.",
    "August was your most active vacation month.",
    "You tend to take more vacations on Mondays and Fridays.",
    "You haven't taken any sick leave in the last 3 months.",
    "Consider planning your remaining 11 days before the year ends.",
  ],
}

export default function InsightsPage() {
  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <h1 className="text-2xl font-bold">Vacation Insights</h1>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">
              <PieChart className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="monthly">
              <BarChart className="h-4 w-4 mr-2" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="trends">
              <LineChart className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Vacation by Type</CardTitle>
                  <CardDescription>Distribution of your vacation days by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <div className="w-full max-w-md">
                      <div className="flex flex-col space-y-4">
                        {mockData.byType.map((item) => (
                          <div key={item.name} className="flex items-center">
                            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                            <div className="flex-1">{item.name}</div>
                            <div className="font-medium">{item.value} days</div>
                            <div className="w-full max-w-24 h-2 ml-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(item.value / 20) * 100}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Smart Insights</CardTitle>
                  <CardDescription>Personalized insights based on your vacation patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {mockData.insights.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <div className="bg-primary/20 text-primary rounded-full p-1 mr-3 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                          </svg>
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
                <CardTitle>Monthly Distribution</CardTitle>
                <CardDescription>Your vacation days usage by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <div className="flex h-full items-end gap-2">
                    {mockData.byMonth.map((month) => (
                      <div key={month.name} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-primary rounded-t-md transition-all duration-500"
                          style={{
                            height: `${(month.value / 5) * 100}%`,
                            minHeight: month.value ? "8px" : "0",
                          }}
                        />
                        <span className="text-xs font-medium">{month.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Vacation Trends</CardTitle>
                <CardDescription>Analysis of your vacation patterns over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">
                  More detailed trend analysis will be available after you've used the app for a longer period.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
