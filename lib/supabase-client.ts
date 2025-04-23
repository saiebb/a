'use client'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Create a single supabase client for the entire client-side application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Export a function to get the current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting current user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Unexpected error getting current user:', error)
    return null
  }
}

// Export a function to get the current session
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting current session:', error)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Unexpected error getting current session:', error)
    return null
  }
}
