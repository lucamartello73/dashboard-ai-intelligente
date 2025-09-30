import { createBrowserClient } from "@supabase/ssr"

// Factory function to create a browser client
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export const supabase = createClient()

// Admin client per operazioni server-side
export const supabaseAdmin = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
