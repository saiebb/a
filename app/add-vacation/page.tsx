"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn, calculateVacationDays } from "@/lib/utils"
import { createVacationAction } from "./action"
import { useToast } from "@/hooks/use-toast"
import { checkUserAuthenticated, getCurrentUser } from "@/lib/auth"

export default function AddVacationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vacationType, setVacationType] = useState<string>("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [notes, setNotes] = useState<string>("")
  const [daysCount, setDaysCount] = useState(0)

  // Check authentication status when component mounts
  useEffect(() => {
    async function checkAuth() {
      try {
        const isAuth = await checkUserAuthenticated()
        console.log("User authentication status:", isAuth)

        if (isAuth) {
          const user = await getCurrentUser()
          console.log("Current user:", user)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
      }
    }

    checkAuth()
  }, [])

  // Calculate vacation days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      try {
        console.log("Calculating vacation days between", startDate, "and", endDate)
        const days = calculateVacationDays(startDate, endDate)
        console.log("Calculated days:", days)
        setDaysCount(days)
      } catch (error) {
        console.error("Error calculating vacation days:", error)
        setDaysCount(0)
      }
    } else {
      setDaysCount(0)
    }
  }, [startDate, endDate])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    console.log("Form submitted")

    // Basic form validation
    if (!vacationType || !startDate || !endDate) {
      console.log("Missing required fields:", { vacationType, startDate, endDate })
      toast({
        title: "خطأ في التحقق",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    // Validate dates
    if (startDate > endDate) {
      console.log("Invalid date range:", { startDate, endDate })
      toast({
        title: "خطأ في التواريخ",
        description: "تاريخ البداية يجب أن يكون قبل تاريخ الانتهاء",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare form data
      const formData = new FormData()
      formData.append("vacationType", vacationType)
      formData.append("startDate", startDate.toISOString())
      formData.append("endDate", endDate.toISOString())
      formData.append("notes", notes || "")

      console.log("Submitting vacation request with data:", {
        vacationType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        notes: notes || "(no notes)",
      })

      // Submit the vacation request
      const result = await createVacationAction(formData)
      console.log("Vacation creation result:", result)

      if (result && result.success) {
        toast({
          title: "نجاح",
          description: "تم تقديم طلب الإجازة بنجاح",
        })

        // Redirect to home page
        router.push("/")
      } else {
        console.error("Error creating vacation:", result)
        toast({
          title: "خطأ",
          description: (result && result.message) || "حدث خطأ أثناء تقديم طلب الإجازة",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Unexpected error in handleSubmit:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="container max-w-2xl py-6">
        <Card>
          <CardHeader>
            <CardTitle>طلب إجازة</CardTitle>
            <CardDescription>املأ النموذج أدناه لطلب إجازة.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="vacationType">نوع الإجازة</Label>
                <Select value={vacationType} onValueChange={setVacationType}>
                  <SelectTrigger id="vacationType">
                    <SelectValue placeholder="اختر نوع الإجازة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">إجازة عادية</SelectItem>
                    <SelectItem value="2">إجازة عارضة</SelectItem>
                    <SelectItem value="3">إجازة مرضية</SelectItem>
                    <SelectItem value="4">إجازة شخصية</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">حدد نوع الإجازة التي ترغب في طلبها.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">تاريخ البداية</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="startDate"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground",
                        )}
                      >
                        {startDate ? format(startDate, "PPP") : <span>اختر تاريخًا</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="endDate"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground",
                        )}
                      >
                        {endDate ? format(endDate, "PPP") : <span>اختر تاريخًا</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => date < (startDate || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {startDate && endDate && (
                <div className="bg-muted p-3 rounded-md text-sm">
                  أنت تطلب <strong>{daysCount} يوم عمل</strong> من الإجازة.
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                <Textarea
                  id="notes"
                  placeholder="أضف أي معلومات إضافية حول طلب الإجازة الخاص بك"
                  className="resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <CardFooter className="px-0 pb-0">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "جاري التقديم..." : "تقديم الطلب"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
