import type React from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface AdminHeaderProps {
  title: string
  description?: string
  backHref?: string
  action?: React.ReactNode
}

export function AdminHeader({ title, description, backHref, action }: AdminHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {backHref && (
              <Button variant="ghost" size="icon" asChild>
                <Link href={backHref}>
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Back</span>
                </Link>
              </Button>
            )}
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <Separator />
    </div>
  )
}
