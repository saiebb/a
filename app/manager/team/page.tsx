import Link from "next/link"
import { getServerUser } from "@/lib/server-auth"
import { getTranslations, getLocale } from "@/lib/i18n/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Mail, Phone } from "lucide-react"
import { getTeamMembers } from "@/lib/manager-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"

export default async function TeamMembersPage() {
  // الحصول على المستخدم الحالي
  const user = await getServerUser()
  
  // الحصول على الترجمات
  const locale = await getLocale()
  const { t } = await getTranslations(locale)
  
  // الحصول على أعضاء الفريق
  const teamMembers = await getTeamMembers(user?.id)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" asChild>
            <Link href="/manager">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{t("manager.team.title")}</h1>
          <p className="text-muted-foreground">{t("manager.team.description")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("manager.team.teamMembers")}</CardTitle>
          <CardDescription>{t("manager.team.teamMembersDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.profile_image_url || ""} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="border-t p-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground mr-2">{t("settings.vacationAllowance")}:</span>
                        <span>{member.total_vacation_days} {t("common.days")}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground mr-2">{t("common.joined")}:</span>
                        <span>{formatDate(member.created_at)}</span>
                      </div>
                    </div>
                    <div className="border-t p-4 flex justify-between">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/manager/team/${member.id}/vacations`}>
                          <Calendar className="h-4 w-4 mr-2" />
                          {t("manager.team.viewVacations")}
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`mailto:${member.email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          {t("manager.team.contact")}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-6">
                <p className="text-muted-foreground">{t("manager.team.noTeamMembers")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
