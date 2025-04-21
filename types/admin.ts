import type { User, Vacation } from "./index"

export type UserRole = "user" | "admin" | "super_admin"

export interface AdminUser extends User {
  role: UserRole
}

export interface VacationWithUser extends Vacation {
  user: {
    id: string
    name: string
    email: string
  }
}

export interface UserWithVacations extends User {
  vacations: Vacation[]
}

export interface AdminStats {
  totalUsers: number
  totalVacations: number
  pendingVacations: number
  approvedVacations: number
  rejectedVacations: number
}
