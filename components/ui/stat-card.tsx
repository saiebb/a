"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n/client"
import { cva, type VariantProps } from "class-variance-authority"

const statCardVariants = cva(
  "transition-all duration-300 hover:shadow-md",
  {
    variants: {
      variant: {
        default: "bg-card",
        primary: "bg-primary/10",
        secondary: "bg-secondary/10",
        accent: "bg-accent/10",
        success: "bg-green-500/10",
        warning: "bg-amber-500/10",
        danger: "bg-red-500/10",
        info: "bg-blue-500/10"
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8"
      },
      animation: {
        none: "",
        pulse: "hover:animate-pulse",
        bounce: "hover:animate-bounce",
        scale: "hover:scale-105"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "scale"
    }
  }
)

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: number
    label?: string
    direction: "up" | "down" | "neutral"
  }
  footer?: React.ReactNode
  loading?: boolean
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  footer,
  variant,
  size,
  animation,
  className,
  loading = false,
  ...props
}: StatCardProps) {
  const { isRTL } = useLanguage()
  
  // Determinar el color del icono de tendencia
  const getTrendColor = () => {
    if (!trend) return ""
    
    if (trend.direction === "up") return "text-green-500"
    if (trend.direction === "down") return "text-red-500"
    return "text-gray-500"
  }
  
  // Determinar el icono de tendencia
  const getTrendIcon = () => {
    if (!trend) return null
    
    if (trend.direction === "up") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z" clipRule="evenodd" />
        </svg>
      )
    }
    
    if (trend.direction === "down") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.769a.75.75 0 011.113.058 20.908 20.908 0 013.813 7.254l1.574-2.727a.75.75 0 011.3.75l-2.475 4.286a.75.75 0 01-1.025.275l-4.287-2.475a.75.75 0 01.75-1.3l2.71 1.565a19.422 19.422 0 00-3.013-6.024L7.53 11.533a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      )
    }
    
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M8 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
        <path d="M3.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
        <path d="M13.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
      </svg>
    )
  }

  return (
    <Card className={cn(statCardVariants({ variant, size, animation }), className)} {...props}>
      <CardContent className={cn("p-0", size === "sm" ? "p-4" : size === "lg" ? "p-8" : "p-6")}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-3xl font-bold mt-1">{value}</p>
            )}
          </div>
          {icon && (
            <div className={cn(
              "p-2 rounded-full",
              variant === "primary" ? "bg-primary text-primary-foreground" :
              variant === "secondary" ? "bg-secondary text-secondary-foreground" :
              variant === "accent" ? "bg-accent text-accent-foreground" :
              variant === "success" ? "bg-green-500 text-white" :
              variant === "warning" ? "bg-amber-500 text-white" :
              variant === "danger" ? "bg-red-500 text-white" :
              variant === "info" ? "bg-blue-500 text-white" :
              "bg-primary/10 text-primary"
            )}>
              {icon}
            </div>
          )}
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 mt-2 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">{trend.value}%</span>
            {trend.label && <span className="text-sm text-muted-foreground">{trend.label}</span>}
          </div>
        )}
        
        {footer && (
          <div className="mt-4 pt-4 border-t">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
