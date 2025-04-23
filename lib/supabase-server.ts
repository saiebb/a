import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Create a single supabase client for the entire server
export async function createServerSupabaseClient() {
  // Create the Supabase client without cookie storage
  // This is safer for server components in Next.js 15
  const client = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )

  return client
}
