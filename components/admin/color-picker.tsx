"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

const predefinedColors = [
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#F44336", // Red
  "#FF9800", // Orange
  "#9C27B0", // Purple
  "#00BCD4", // Cyan
  "#FFEB3B", // Yellow
  "#795548", // Brown
  "#607D8B", // Blue Grey
  "#E91E63", // Pink
]

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(color)

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setCustomColor(newColor)
    onChange(newColor)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {predefinedColors.map((presetColor) => (
          <button
            key={presetColor}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            style={{ backgroundColor: presetColor }}
            onClick={() => {
              onChange(presetColor)
              setCustomColor(presetColor)
            }}
          >
            {color === presetColor && <Check className="h-4 w-4 text-white" />}
          </button>
        ))}
      </div>
      
      <div className="flex gap-2 items-center">
        <div
          className="w-10 h-10 rounded border border-gray-200"
          style={{ backgroundColor: customColor }}
        />
        <Input
          type="text"
          value={customColor}
          onChange={handleCustomColorChange}
          placeholder="#RRGGBB"
          className="flex-1"
        />
      </div>
    </div>
  )
}
