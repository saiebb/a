"use client"

import React from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { useTheme } from "next-themes"
import { useLanguage } from "@/lib/i18n/client"
import { useTranslations } from "@/hooks/use-translations"

interface DataItem {
  name: string
  value: number
  color?: string
}

interface EnhancedPieChartProps {
  data: DataItem[]
  title?: string
  height?: number
  showLegend?: boolean
  innerRadius?: number
  outerRadius?: number
  className?: string
  valueFormatter?: (value: number) => string
  nameFormatter?: (name: string) => string
  showLabels?: boolean
  showPercentage?: boolean
}

export function EnhancedPieChart({
  data,
  title,
  height = 300,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
  className = "",
  valueFormatter = (value) => `${value}`,
  nameFormatter = (name) => name,
  showLabels = false,
  showPercentage = true
}: EnhancedPieChartProps) {
  const { theme } = useTheme()
  const { locale, isRTL } = useLanguage()
  const { t } = useTranslations()
  
  // Colores para el tema claro y oscuro
  const lightColors = {
    text: "#1e293b", // slate-800
    tooltip: "#ffffff",
    tooltipText: "#1e293b"
  }
  
  const darkColors = {
    text: "#e2e8f0", // slate-200
    tooltip: "#1e293b",
    tooltipText: "#e2e8f0"
  }
  
  // Seleccionar colores basados en el tema
  const colors = theme === "dark" ? darkColors : lightColors
  
  // Formatear los datos para asegurar que tienen colores
  const formattedData = data.map((item, index) => ({
    ...item,
    color: item.color || getDefaultColor(index, theme === "dark")
  }))
  
  // Calcular el total para porcentajes
  const total = formattedData.reduce((sum, item) => sum + item.value, 0)
  
  // Función para obtener colores por defecto
  function getDefaultColor(index: number, isDark: boolean): string {
    const lightPalette = [
      "#4CAF50", // Verde
      "#2196F3", // Azul
      "#FF9800", // Naranja
      "#9C27B0", // Púrpura
      "#F44336", // Rojo
      "#00BCD4", // Cian
      "#FFEB3B", // Amarillo
      "#795548", // Marrón
    ]
    
    const darkPalette = [
      "#81C784", // Verde claro
      "#64B5F6", // Azul claro
      "#FFB74D", // Naranja claro
      "#BA68C8", // Púrpura claro
      "#E57373", // Rojo claro
      "#4DD0E1", // Cian claro
      "#FFF176", // Amarillo claro
      "#A1887F", // Marrón claro
    ]
    
    const palette = isDark ? darkPalette : lightPalette
    return palette[index % palette.length]
  }
  
  // Personalizar el tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]
      const percentage = ((item.value / total) * 100).toFixed(1)
      
      return (
        <div className="bg-popover border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{nameFormatter(item.name)}</p>
          <p className="text-sm">
            <span className="font-medium">{t("common.value", "Value")}: </span>
            {valueFormatter(item.value)}
          </p>
          {showPercentage && (
            <p className="text-sm">
              <span className="font-medium">{t("common.percentage", "Percentage")}: </span>
              {percentage}%
            </p>
          )}
        </div>
      )
    }
    return null
  }
  
  // Renderizar etiquetas personalizadas
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    if (!showLabels) return null
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {showPercentage ? `${(percent * 100).toFixed(0)}%` : nameFormatter(name)}
      </text>
    )
  }
  
  // Renderizar leyenda personalizada
  const renderCustomLegend = ({ payload }: any) => {
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">{nameFormatter(entry.value)}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {title && <h3 className="text-lg font-medium mb-4 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            labelLine={showLabels}
            label={renderCustomizedLabel}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend content={renderCustomLegend} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
