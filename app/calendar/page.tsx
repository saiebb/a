"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { addDays, format, getMonth, getYear, isSameDay, parseISO } from "date-fns"
import { getUserVacationsForCalendar } from "@/lib/actions"
import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { Vacation } from "@/types"

// Vacation type colors from the database
const vacationTypeColors: Record<number, string> = {
  1: "#4CAF50", // Regular
  2: "#ADD8E6", // Casual
  3: "#FF8A65", // Sick
  4: "#9C27B0", // Personal
  5: "#FFC107", // Public Holiday
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [year, setYear] = useState<number>(getYear(new Date()))
  const [month, setMonth] = useState<number>(getMonth(new Date()))
  const [vacations, setVacations] = useState<Vacation[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch vacations when the component mounts
  useEffect(() => {
    async function fetchVacations() {
      try {
        setLoading(true)
        setError(null)

        // Get the current user
        const user = await getCurrentUser()

        if (!user || !user.id) {
          setError("يرجى تسجيل الدخول لعرض الإجازات")
          setLoading(false)
          return
        }

        // Get vacations for the user
        const userVacations = await getUserVacationsForCalendar(user.id)
        setVacations(userVacations)
      } catch (err) {
        console.error("Error fetching vacations:", err)
        setError("حدث خطأ أثناء جلب الإجازات")
      } finally {
        setLoading(false)
      }
    }

    fetchVacations()
  }, [])

  // Generate all dates that have vacations
  const vacationDates = vacations.flatMap((vacation) => {
    const dates: Date[] = []
    const start = parseISO(vacation.start_date)
    const end = parseISO(vacation.end_date)

    let current = start
    while (current <= end) {
      dates.push(new Date(current))
      current = addDays(current, 1)
    }

    return dates.map((date) => ({
      date,
      typeId: vacation.vacation_type_id,
      status: vacation.status,
    }))
  })

  // Find vacations for the selected date
  const selectedDateVacations = vacations.filter((vacation) => {
    const start = parseISO(vacation.start_date)
    const end = parseISO(vacation.end_date)
    return date >= start && date <= end
  })

  // Years for the select
  const years = Array.from({ length: 5 }, (_, i) => getYear(new Date()) + i - 2)

  // Months for the select
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">تقويم الإجازات</h1>

          <div className="flex gap-2">
            <Select value={year.toString()} onValueChange={(value) => setYear(Number.parseInt(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="السنة" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={month.toString()} onValueChange={(value) => setMonth(Number.parseInt(value))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="الشهر" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mr-2">جاري تحميل الإجازات...</span>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-500">{error}</p>
              <Button asChild className="mt-4">
                <a href="/auth/login">تسجيل الدخول</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>عرض التقويم</CardTitle>
                <CardDescription>عرض وإدارة أيام الإجازة الخاصة بك</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  month={new Date(year, month)}
                  onMonthChange={(date) => {
                    setMonth(getMonth(date))
                    setYear(getYear(date))
                  }}
                  className="rounded-md border"
                  modifiers={{
                    vacation: vacationDates.map((v) => v.date),
                  }}
                  modifiersStyles={{
                    vacation: {
                      fontWeight: "bold",
                    },
                  }}
                  components={{
                    DayContent: ({ date, activeModifiers, ...props }) => {
                      const matchingVacations = vacationDates.filter((v) => isSameDay(v.date, date))

                      if (matchingVacations.length === 0) {
                        return <div className="text-center">{date.getDate()}</div>
                      }

                      return (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {date.getDate()}
                          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                            {matchingVacations.map((vacation, i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  backgroundColor: vacationTypeColors[vacation.typeId],
                                  opacity: vacation.status === "pending" ? 0.6 : 1,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{format(date, "MMMM d, yyyy")}</CardTitle>
                <CardDescription>
                  {selectedDateVacations.length > 0
                    ? "تفاصيل الإجازة للتاريخ المحدد"
                    : "لا توجد إجازات مجدولة لهذا التاريخ"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDateVacations.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateVacations.map((vacation) => (
                      <div key={vacation.id} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              {vacation.vacation_type?.name ||
                                (vacation.vacation_type_id === 1
                                ? "إجازة عادية"
                                : vacation.vacation_type_id === 2
                                  ? "إجازة عارضة"
                                  : vacation.vacation_type_id === 3
                                    ? "إجازة مرضية"
                                    : vacation.vacation_type_id === 4
                                      ? "إجازة شخصية"
                                      : "إجازة")}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(vacation.start_date), "MMM d")} -{" "}
                              {format(parseISO(vacation.end_date), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge className={vacation.status === "approved" ? "bg-green-500" : "bg-amber-500"}>
                            {vacation.status === "approved" ? "معتمدة" : "قيد الانتظار"}
                          </Badge>
                        </div>
                        {vacation.notes && (
                          <p className="text-sm mt-2 text-muted-foreground">{vacation.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>لا توجد إجازات مجدولة لهذا التاريخ.</p>
                    <p className="mt-2 text-sm">حدد تاريخًا يحتوي على مؤشر ملون لعرض التفاصيل.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
