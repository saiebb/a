export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
  total_vacation_days: number
  profile_image_url: string | null
  role?: string
  manager_id?: string | null
  department_id?: string | null
}

export interface TeamMember {
  id: string
  name: string
  email: string
  profile_image_url?: string
  total_vacation_days: number
  created_at: string
}

export interface VacationTypeDistribution {
  typeId: number
  typeName: string
  color: string
  count: number
}

export interface TeamVacationSummary {
  totalMembers: number
  pendingVacations: number
  upcomingVacations: number
  onVacationToday: number
  vacationsByType: VacationTypeDistribution[]
}

export interface VacationType {
  id: number
  name: string
  description: string | null
  color: string
  icon: string | null
  created_at: string
}

export interface Vacation {
  id: string
  user_id: string
  vacation_type_id: number
  start_date: string
  end_date: string
  notes: string | null
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
  admin_note?: string | null
  vacation_types?: {
    id: number
    name: string
    color: string
    icon?: string
  }
  users?: {
    id: string
    name: string
    email: string
    profile_image_url?: string | null
  }
}

export interface Notification {
  id: string
  user_id: string
  message: string
  read: boolean
  vacation_id: string | null
  created_at: string
}

export interface UserPreferences {
  user_id: string
  theme: "light" | "dark"
  language: "en" | "ar"
  notifications_enabled: boolean
  calendar_sync_enabled: boolean
  first_day_of_week?: "sunday" | "monday" | "saturday"
  include_weekend_days?: boolean
  updated_at: string
}

export interface VacationSummary {
  used: number
  remaining: number
  pending: number
  total: number
}
