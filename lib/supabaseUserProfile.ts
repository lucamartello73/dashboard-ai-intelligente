import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or anon key is not defined in environment variables.")
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AITool {
  id: string
  user_id: string
  nome: string
  tipo: "chat" | "coding" | "image" | "video" | "audio" | "analysis"
  piano: "free" | "plus" | "pro" | "enterprise"
  attivo: boolean
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  ai_preferito: { [key: string]: string }
  budget: { mensile: number; disponibileNuoviTool: boolean }
  notifiche: { suggerimenti: boolean; nuoveFunzionalita: boolean }
  tema: "light" | "dark" | "auto"
  created_at: string
  updated_at: string
}

export class SupabaseUserProfileManager {
  static async ensureAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      console.log("ensureAuthenticated: Sessione esistente.")
      return true
    }
    console.log("ensureAuthenticated: Nessuna sessione, tentativo di signInAnonymously.")
    const { error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.error("ensureAuthenticated: Errore nell'autenticazione anonima:", error)
      return false
    }
    console.log("ensureAuthenticated: Autenticazione anonima riuscita.")
    return true
  }

  static async getAITools(): Promise<AITool[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("getAITools: Utente non autenticato.")
      return []
    }
    console.log(`getAITools: Tentativo di recuperare strumenti AI per user_id: ${user.id}`)
    const { data, error } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("user_id", user.id)
    if (error) {
      console.error("getAITools: Errore nel recupero strumenti AI:", error)
      return []
    }
    console.log("getAITools: Strumenti AI recuperati con successo:", data)
    return data || []
  }

  static async addAITool(tool: Omit<AITool, "id" | "user_id" | "created_at" | "updated_at">): Promise<AITool | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("addAITool: Utente non autenticato.")
      return null
    }
    console.log(`addAITool: Tentativo di aggiungere strumento AI per user_id: ${user.id}`)
    const { data, error } = await supabase
      .from("ai_tools")
      .insert([{ ...tool, user_id: user.id }])
      .select()
      .single()
    if (error) {
      console.error("addAITool: Errore nell'aggiunta strumento AI:", error)
      return null
    }
    console.log("addAITool: Strumento AI aggiunto con successo:", data)
    return data
  }

  static async updateAITool(toolId: string, updates: Partial<AITool>): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("updateAITool: Utente non autenticato.")
      return false
    }
    console.log(`updateAITool: Tentativo di aggiornare strumento AI ${toolId} per user_id: ${user.id}`)
    const { error } = await supabase
      .from("ai_tools")
      .update(updates)
      .eq("id", toolId)
      .eq("user_id", user.id) // Assicura che l'utente possa aggiornare solo i propri strumenti
    if (error) {
      console.error("updateAITool: Errore nell'aggiornamento strumento AI:", error)
      return false
    }
    console.log(`updateAITool: Strumento AI ${toolId} aggiornato con successo.`) 
    return true
  }

  static async removeAITool(toolId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("removeAITool: Utente non autenticato.")
      return false
    }
    console.log(`removeAITool: Tentativo di rimuovere strumento AI ${toolId} per user_id: ${user.id}`)
    const { error } = await supabase
      .from("ai_tools")
      .delete()
      .eq("id", toolId)
      .eq("user_id", user.id) // Assicura che l'utente possa rimuovere solo i propri strumenti
    if (error) {
      console.error("removeAITool: Errore nella rimozione strumento AI:", error)
      return false
    }
    console.log(`removeAITool: Strumento AI ${toolId} rimosso con successo.`) 
    return true
  }

  static async getUserPreferences(): Promise<UserPreferences | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("getUserPreferences: Utente non autenticato.")
      return null
    }

    console.log(`getUserPreferences: Tentativo di recuperare preferenze per user_id: ${user.id}`)
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") { // Nessuna riga trovata
        console.log(`getUserPreferences: Nessuna preferenza trovata per user_id: ${user.id}. Creazione di default.`)
        return this.createDefaultPreferences()
      } else {
        console.error("getUserPreferences: Errore nel recupero preferenze utente:", error)
        return null
      }
    }
    console.log("getUserPreferences: Preferenze recuperate con successo:", data)
    return data
  }

  static async createDefaultPreferences(): Promise<UserPreferences | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("createDefaultPreferences: Utente non autenticato, impossibile creare preferenze di default.")
      return null
    }

    // Verifica se le preferenze esistono già per evitare errori UNIQUE constraint
    const { data: existingPreferences, error: existingError } = await supabase
      .from("user_preferences")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (existingPreferences) {
      console.log(`createDefaultPreferences: Preferenze esistenti per user_id: ${user.id}. Non è necessario crearne di nuove.`)
      return this.getUserPreferences() // Recupera quelle esistenti
    }
    if (existingError && existingError.code !== "PGRST116") {
      console.error("createDefaultPreferences: Errore durante la verifica delle preferenze esistenti:", existingError)
      return null
    }

    const defaultPreferences = {
      user_id: user.id,
      ai_preferito: { marketing: "Claude", sviluppo: "GitHub Copilot", analisi: "ChatGPT-4", creativo: "Midjourney", generico: "ChatGPT-4" },
      budget: { mensile: 50, disponibileNuoviTool: true },
      notifiche: { suggerimenti: true, nuoveFunzionalita: true },
      tema: "light" as const
    }

    console.log(`createDefaultPreferences: Tentativo di inserire preferenze di default per user_id: ${user.id}`)
    const { data, error } = await supabase
      .from("user_preferences")
      .insert([defaultPreferences])
      .select()
      .single()

    if (error) {
      console.error("createDefaultPreferences: Errore nella creazione preferenze di default:", error)
      return null
    }
    console.log("createDefaultPreferences: Preferenze di default create con successo:", data)
    return data
  }

  static async updateUserPreferences(updates: Partial<UserPreferences>): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("updateUserPreferences: Utente non autenticato.")
      return false
    }
    console.log(`updateUserPreferences: Tentativo di aggiornare preferenze per user_id: ${user.id}`)
    const { error } = await supabase
      .from("user_preferences")
      .update(updates)
      .eq("user_id", user.id)
    if (error) {
      console.error("updateUserPreferences: Errore nell'aggiornamento preferenze utente:", error)
      return false
    }
    console.log("updateUserPreferences: Preferenze utente aggiornate con successo.")
    return true
  }

  static getAvailableAIOptions(tools: AITool[]): string[] {
    const defaultOptions = ["ChatGPT-4", "Claude", "Gemini", "GitHub Copilot", "Midjourney", "DALL-E", "Stable Diffusion", "Runway", "ElevenLabs", "Perplexity"]
    const userTools = tools.filter(tool => tool.attivo).map(tool => tool.nome)
    return [...new Set([...userTools, ...defaultOptions])]
  }
}

