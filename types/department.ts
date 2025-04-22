export interface Department {
  id: string
  name: string
  description: string | null
  manager_id: string | null
  created_at: string
  updated_at: string
  manager?: {
    id: string
    name: string
    email: string
  }
}
