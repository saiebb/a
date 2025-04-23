"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"

interface IconPickerProps {
  icon: string
  onChange: (icon: string) => void
}

const commonIcons = [
  "palm-tree",
  "coffee",
  "stethoscope",
  "user",
  "calendar-days",
  "heart",
  "briefcase",
  "graduation-cap",
  "plane",
  "home",
  "car",
  "gift",
  "baby",
  "book",
  "utensils",
]

export function IconPicker({ icon, onChange }: IconPickerProps) {
  const { t } = useTranslations()
  const [customIcon, setCustomIcon] = useState(icon)

  const handleCustomIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIcon = e.target.value
    setCustomIcon(newIcon)
    onChange(newIcon)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {commonIcons.map((iconName) => (
          <button
            key={iconName}
            type="button"
            className={`w-10 h-10 rounded flex items-center justify-center border ${
              icon === iconName ? "border-primary bg-primary/10" : "border-gray-200"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
            onClick={() => {
              onChange(iconName)
              setCustomIcon(iconName)
            }}
          >
            <span className="text-sm">{iconName}</span>
          </button>
        ))}
      </div>
      
      <div className="flex gap-2 items-center">
        <Input
          type="text"
          value={customIcon}
          onChange={handleCustomIconChange}
          placeholder={t("admin.vacationTypes.iconPlaceholder")}
          className="flex-1"
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        {t("admin.vacationTypes.iconHelp")}
      </p>
    </div>
  )
}
