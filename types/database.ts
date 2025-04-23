export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          profile_image_url: string | null
          created_at: string
          updated_at: string
          total_vacation_days: number
          role: string | null
          manager_id: string | null
          department_id: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
          total_vacation_days?: number
          role?: string | null
          manager_id?: string | null
          department_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
          total_vacation_days?: number
          role?: string | null
          manager_id?: string | null
          department_id?: string | null
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          theme: string
          language: string
          notifications_enabled: boolean
          calendar_sync_enabled: boolean
          first_day_of_week: string
          include_weekend_days: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: string
          language?: string
          notifications_enabled?: boolean
          calendar_sync_enabled?: boolean
          first_day_of_week?: string
          include_weekend_days?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          theme?: string
          language?: string
          notifications_enabled?: boolean
          calendar_sync_enabled?: boolean
          first_day_of_week?: string
          include_weekend_days?: boolean
          updated_at?: string
        }
      }
      vacation_types: {
        Row: {
          id: number
          name: string
          description: string | null
          color: string
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          color: string
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          color?: string
          icon?: string | null
          created_at?: string
        }
      }
      vacations: {
        Row: {
          id: string
          user_id: string
          vacation_type_id: number
          start_date: string
          end_date: string
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vacation_type_id: number
          start_date: string
          end_date: string
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vacation_type_id?: number
          start_date?: string
          end_date?: string
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          message: string
          read: boolean
          vacation_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          read?: boolean
          vacation_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          read?: boolean
          vacation_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
