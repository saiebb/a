"use client"

import React from "react"
import {
  LineChart,
  Line,
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

interface DataPoint {
  name: string
  value: number
}

interface DataSeries {
  name: string
  data: DataPoint[]
  color?: string
}

interface EnhancedLineChartProps {
  series: DataSeries[]
  xAxisLabel?: string
  yAxisLabel?: string
  title?: string
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  className?: string
  valueFormatter?: (value: number) => string
  nameFormatter?: (name: string) => string
  showDots?: boolean
  curved?: boolean
}

export function EnhancedLineChart({
  series,
  xAxisLabel,
  yAxisLabel,
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  className = "",
  valueFormatter = (value) => `${value}`,
  nameFormatter = (name) => name,
  showDots = true,
  curved = true
}: EnhancedLineChartProps) {
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
  
  // Preparar los datos para el gráfico
  // Necesitamos transformar los datos de series a un formato que Recharts pueda usar
  const allNames = new Set<string>()
  series.forEach(s => {
    s.data.forEach(d => {
      allNames.add(d.name)
    })
  })
  
  const chartData = Array.from(allNames).map(name => {
    const point: any = { name }
    series.forEach(s => {
      const dataPoint = s.data.find(d => d.name === name)
      point[s.name] = dataPoint ? dataPoint.value : null
    })
    return point
  })
  
  // Ordenar los datos por nombre (útil para fechas o categorías ordenadas)
  chartData.sort((a, b) => {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  })
  
  // Personalizar el tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{nameFormatter(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}: </span>
              {entry.value !== null ? valueFormatter(entry.value) : t("common.noData", "No data")}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className={`w-full ${className}`}>
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
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
          
          {series.map((s, index) => (
            <Line
              key={s.name}
              type={curved ? "monotone" : "linear"}
              dataKey={s.name}
              stroke={s.color || getDefaultColor(index, theme === "dark")}
              activeDot={{ r: 8 }}
              dot={showDots}
              strokeWidth={2}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
