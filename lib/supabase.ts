import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { type ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export const getServerSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createSupabaseClient(supabaseUrl, supabaseServiceKey)
}

export const createClient = (cookieStore: ReadonlyRequestCookies) => {
  // Usar una función que simula el comportamiento de cookies() de Next.js
  const cookiesAdapter = {
    get: (name: string) => cookieStore.get(name)?.value,
    set: (name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean }) => {
      cookieStore.set({ name, value, ...options })
    },
    remove: (name: string, options: { path?: string; domain?: string }) => {
      cookieStore.set({ name, value: "", ...options, maxAge: 0 })
    },
  }

  // Crear un cliente Supabase con las cookies proporcionadas
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: undefined, // Usar el fetch predeterminado
    },
    auth: {
      storage: {
        getItem: (key) => {
          const value = cookiesAdapter.get(key)
          return value ?? null
        },
        setItem: (key, value) => {
          cookiesAdapter.set(key, value, { path: "/" })
        },
        removeItem: (key) => {
          cookiesAdapter.remove(key, { path: "/" })
        },
      },
    },
  })
}
