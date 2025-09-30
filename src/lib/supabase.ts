import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

// Factory function to create or return existing browser client
export function createClient() {
  if (typeof window === "undefined") {
    // Server-side: create a new client each time
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  // Client-side: use singleton pattern
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  return browserClient
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get: (target, prop) => {
    const client = createClient()
    return client[prop as keyof typeof client]
  },
})
