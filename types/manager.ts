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
