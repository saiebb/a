"use client"

import Link from "next/link"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building, ChevronRight, User } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Department } from "@/types/department"

interface DepartmentsListProps {
  departments: Department[]
}

export function DepartmentsList({ departments }: DepartmentsListProps) {
  const { t } = useTranslations()

  if (!departments.length) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">{t("admin.departments.noDepartments")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {departments.map((department) => (
        <Card key={department.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <div className="font-medium">{department.name}</div>
                  {department.description && (
                    <div className="text-sm text-muted-foreground line-clamp-1">{department.description}</div>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/departments/${department.id}`}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="border-t p-4 flex justify-between items-center">
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground mr-1">{t("admin.departments.manager")}:</span>
                <span>
                  {department.manager ? department.manager.name : t("admin.departments.noManager")}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {t("admin.departments.createdAt")}: {formatDate(department.created_at)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
