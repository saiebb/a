"use client"

import Link from "next/link"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Users, 
  Building, 
  Calendar, 
  Settings, 
  ChevronDown, 
  LayoutDashboard,
  LogOut
} from "lucide-react"

export function AdminLayoutHeader() {
  const { t } = useTranslations()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="font-bold text-lg">{t("common.jazatiAdmin")}</span>
          </Link>
        </div>
        <div className="flex items-center justify-between flex-1">
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                {t("common.dashboard")}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/users">
                <Users className="h-4 w-4 mr-2" />
                {t("admin.users.title")}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/departments">
                <Building className="h-4 w-4 mr-2" />
                {t("admin.departments.title")}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/vacations">
                <Calendar className="h-4 w-4 mr-2" />
                {t("admin.vacations.title")}
              </Link>
            </Button>
          </nav>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  {t("common.settings")}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("common.settings")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">
                    {t("settings.profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/preferences">
                    {t("settings.preferences")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/auth/logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("auth.signOut")}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
