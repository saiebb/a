import Link from "next/link"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { getServerUser } from "@/lib/server-auth"
import { getTranslations, getLocale } from "@/lib/i18n/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getVacationTypeColor } from "@/lib/utils"

interface TeamMemberVacationsPageProps {
  params: {
    id: string
  }
}

export default async function TeamMemberVacationsPage({ params }: TeamMemberVacationsPageProps) {
  // الحصول على المستخدم الحالي
  const user = await getServerUser()
  
  // الحصول على الترجمات
  const locale = await getLocale()
  const { t } = await getTranslations(locale)
  
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  // التحقق من صلاحيات المستخدم
  if (!user || (user.role !== "manager" && user.role !== "admin")) {
    notFound()
  }
  
  // الحصول على معلومات عضو الفريق
  const { data: teamMember, error: memberError } = await supabase
    .from("users")
    .select("*")
    .eq("id", params.id)
    .single()
  
  if (memberError || !teamMember) {
    notFound()
  }
  
  // التحقق من أن هذا العضو ينتمي إلى فريق المدير
  if (teamMember.manager_id !== user.id && user.role !== "admin") {
    notFound()
  }
  
  // الحصول على إجازات عضو الفريق
  const { data: vacations, error: vacationsError } = await supabase
    .from("vacations")
    .select(`
      *,
      vacation_types (
        id,
        name,
        color
      )
    `)
    .eq("user_id", params.id)
    .order("start_date", { ascending: false })
  
  if (vacationsError) {
    console.error("Error fetching team member vacations:", vacationsError)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" asChild>
            <Link href="/manager/team">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{teamMember.name} - {t("manager.teamMember.vacations")}</h1>
          <p className="text-muted-foreground">{t("manager.teamMember.vacationsDescription")}</p>
        </div>
        <Button asChild>
          <Link href={`/calendar?userId=${params.id}`}>
            <Calendar className="h-4 w-4 mr-2" />
            {t("manager.teamMember.viewCalendar")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("manager.teamMember.vacationHistory")}</CardTitle>
          <CardDescription>{t("manager.teamMember.vacationHistoryDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {vacations && vacations.length > 0 ? (
            <div className="space-y-4">
              {vacations.map((vacation) => (
                <Card key={vacation.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 border-b flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {formatDate(vacation.start_date)} - {formatDate(vacation.end_date)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 inline-block mr-1" />
                          {new Date(vacation.end_date).getTime() - new Date(vacation.start_date).getTime() > 0
                            ? Math.ceil((new Date(vacation.end_date).getTime() - new Date(vacation.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
                            : 1} {t("common.days")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge style={{ backgroundColor: vacation.vacation_types?.color || getVacationTypeColor(vacation.vacation_type_id) }}>
                          {vacation.vacation_types?.name || t(`vacationTypes.type${vacation.vacation_type_id}`)}
                        </Badge>
                        <Badge className={
                          vacation.status === "approved" ? "bg-green-500" :
                          vacation.status === "rejected" ? "bg-red-500" :
                          "bg-amber-500"
                        }>
                          {t(`vacationStatus.${vacation.status}`)}
                        </Badge>
                      </div>
                    </div>
                    {vacation.notes && (
                      <div className="p-4 border-b">
                        <div className="text-sm text-muted-foreground">{t("vacationDetails.notes")}</div>
                        <div className="text-sm mt-1">{vacation.notes}</div>
                      </div>
                    )}
                    {vacation.admin_note && (
                      <div className="p-4 border-b">
                        <div className="text-sm text-muted-foreground">{t("manager.teamMember.adminNote")}</div>
                        <div className="text-sm mt-1">{vacation.admin_note}</div>
                      </div>
                    )}
                    <div className="p-4 text-sm text-muted-foreground">
                      {t("vacationDetails.requestedOn")} {formatDate(vacation.created_at)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">{t("manager.teamMember.noVacations")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
