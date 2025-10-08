import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

export const getSupabase = () => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[v0] Missing Supabase environment variables:", {
        url: supabaseUrl ? "set" : "missing",
        key: supabaseAnonKey ? "set" : "missing",
      })
      throw new Error("Supabase environment variables are not configured")
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

export const getSupabaseAdmin = () => {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase admin environment variables are not configured")
    }

    supabaseAdminInstance = createClient(supabaseUrl, serviceRoleKey)
  }
  return supabaseAdminInstance
}

export const supabase = getSupabase()
