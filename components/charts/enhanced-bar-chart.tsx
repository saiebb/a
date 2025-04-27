"use client"

import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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

interface EnhancedBarChartProps {
  data: DataItem[]
  xAxisLabel?: string
  yAxisLabel?: string
  title?: string
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  barSize?: number
  className?: string
  valueFormatter?: (value: number) => string
  nameFormatter?: (name: string) => string
}

export function EnhancedBarChart({
  data,
  xAxisLabel,
  yAxisLabel,
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  barSize = 30,
  className = "",
  valueFormatter = (value) => `${value}`,
  nameFormatter = (name) => name
}: EnhancedBarChartProps) {
  const { theme } = useTheme()
  const { locale, isRTL } = useLanguage()
  const { t } = useTranslations()
  
  // Colores para el tema claro y oscuro
  const lightColors = {
    text: "#1e293b", // slate-800
    grid: "#e2e8f0", // slate-200
    tooltip: "#ffffff",
    tooltipText: "#1e293b"
  }
  
  const darkColors = {
    text: "#e2e8f0", // slate-200
    grid: "#334155", // slate-700
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
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{nameFormatter(label)}</p>
          <p className="text-sm">
            <span className="font-medium">{t("common.value", "Value")}: </span>
            {valueFormatter(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`w-full ${className}`}>
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
          layout={isRTL ? "horizontal" : "horizontal"}
          barSize={barSize}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />}
          <XAxis 
            dataKey="name" 
            tick={{ fill: colors.text }} 
            tickFormatter={nameFormatter}
            label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10, fill: colors.text } : undefined}
          />
          <YAxis 
            tick={{ fill: colors.text }}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: colors.text } : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Bar 
            dataKey="value" 
            fill="#8884d8" 
            radius={[4, 4, 0, 0]}
            // Usar el color específico de cada elemento de datos
            fill={(entry) => entry.color || "#8884d8"}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
