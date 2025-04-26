export interface Department {
  id: number
  name: string
  description: string | null
  manager_id: string | null
  created_at: string
  updated_at: string
  users?: {
    id: string
    name: string
    email: string
    profile_image_url?: string | null
  } | null
}
