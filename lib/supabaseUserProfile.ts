"use client"

import { supabase } from './supabase'

export interface AITool {
  id: string
  user_id?: string
  nome: string
  tipo: 'chat' | 'coding' | 'image' | 'video' | 'audio' | 'analysis'
  piano: 'free' | 'plus' | 'pro' | 'enterprise'
  attivo: boolean
  created_at?: string
  updated_at?: string
}

export interface UserPreferences {
  id?: string
  user_id?: string
  aiPreferito: { [key: string]: string }
  budget: {
    mensile: number
    disponibileNuoviTool: boolean
  }
  notifiche: {
    suggerimenti: boolean
    nuoveFunzionalita: boolean
  }
  tema: 'light' | 'dark' | 'auto'
  created_at?: string
  updated_at?: string
}

export class SupabaseUserProfileManager {
  
  // ==================== AI TOOLS ====================
  
  static async getAITools(): Promise<AITool[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('SupabaseUserProfileManager: Errore auth.getUser in getAITools:', authError)
        return []
      }
      if (!user) {
        console.log('SupabaseUserProfileManager: Utente non autenticato in getAITools, restituisco array vuoto.')
        return []
      }
      console.log('SupabaseUserProfileManager: Utente autenticato in getAITools:', user.id)

      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('SupabaseUserProfileManager: Errore nel caricamento strumenti AI:', error)
        return []
      }
      console.log('SupabaseUserProfileManager: Strumenti AI caricati:', data)
      return data || []
    } catch (error) {
      console.error('SupabaseUserProfileManager: Errore catch in getAITools:', error)
      return []
    }
  }

  static async addAITool(tool: Omit<AITool, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<AITool | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('SupabaseUserProfileManager: Errore auth.getUser in addAITool:', authError)
        throw new Error('Errore di autenticazione')
      }
      if (!user) {
        console.error('SupabaseUserProfileManager: Utente non autenticato in addAITool.')
        throw new Error('Utente non autenticato')
      }
      console.log('SupabaseUserProfileManager: Utente autenticato in addAITool:', user.id)

      const { data, error } = await supabase
        .from('ai_tools')
        .insert([{
          ...tool,
          user_id: user.id
        }])
        .select()
        .single()

      if (error) {
        console.error('SupabaseUserProfileManager: Errore nell\'aggiunta strumento AI:', error)
        return null
      }
      console.log('SupabaseUserProfileManager: Strumento AI aggiunto:', data)
      return data
    } catch (error) {
      console.error('SupabaseUserProfileManager: Errore catch in addAITool:', error)
      return null
    }
  }

  static async updateAITool(toolId: string, updates: Partial<AITool>): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('SupabaseUserProfileManager: Errore auth.getUser in updateAITool:', authError)
        throw new Error('Errore di autenticazione')
      }
      if (!user) {
        console.error('SupabaseUserProfileManager: Utente non autenticato in updateAITool.')
        throw new Error('Utente non autenticato')
      }
      console.log('SupabaseUserProfileManager: Utente autenticato in updateAITool:', user.id)

      const { error } = await supabase
        .from('ai_tools')
        .update(updates)
        .eq('id', toolId)
        .eq('user_id', user.id)

      if (error) {
        console.error('SupabaseUserProfileManager: Errore nell\'aggiornamento strumento AI:', error)
        return false
      }
      console.log('SupabaseUserProfileManager: Strumento AI aggiornato con successo:', toolId)
      return true
    } catch (error) {
      console.error('SupabaseUserProfileManager: Errore catch in updateAITool:', error)
      return false
    }
  }

  static async removeAITool(toolId: string): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('SupabaseUserProfileManager: Errore auth.getUser in removeAITool:', authError)
        throw new Error('Errore di autenticazione')
      }
      if (!user) {
        console.error('SupabaseUserProfileManager: Utente non autenticato in removeAITool.')
        throw new Error('Utente non autenticato')
      }
      console.log('SupabaseUserProfileManager: Utente autenticato in removeAITool:', user.id)

      const { error } = await supabase
        .from('ai_tools')
        .delete()
        .eq('id', toolId)
        .eq('user_id', user.id)

      if (error) {
        console.error('SupabaseUserProfileManager: Errore nella rimozione strumento AI:', error)
        return false
      }
      console.log('SupabaseUserProfileManager: Strumento AI rimosso con successo:', toolId)
      return true
    } catch (error) {
      console.error('SupabaseUserProfileManager: Errore catch in removeAITool:', error)
      return false
    }
  }

  // ==================== USER PREFERENCES ====================

  static async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('SupabaseUserProfileManager: Errore auth.getUser in getUserPreferences:', authError)
        return null
      }
      if (!user) {
        console.log('SupabaseUserProfileManager: Utente non autenticato in getUserPreferences, restituisco null.')
        return null
      }
      console.log('SupabaseUserProfileManager: Utente autenticato in getUserPreferences:', user.id)

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('SupabaseUserProfileManager: Errore nel caricamento preferenze:', error)
        if (error.code === 'PGRST116') {
          console.log('SupabaseUserProfileManager: Nessun record preferenze trovato, creo preferenze di default.')
          return await this.createDefaultPreferences()
        }
        return null
      }
      console.log('SupabaseUserProfileManager: Preferenze utente caricate:', data)
      return data
    } catch (error) {
      console.error('SupabaseUserProfileManager: Errore catch in getUserPreferences:', error)
      return null
    }
  }

  static async createDefaultPreferences(): Promise<UserPreferences | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('SupabaseUserProfileManager: Errore auth.getUser in createDefaultPreferences:', authError)
        throw new Error('Errore di autenticazione')
      }
      if (!user) {
        console.error('SupabaseUserProfileManager: Utente non autenticato in createDefaultPreferences.')
        throw new Error('Utente non autenticato')
      }
      console.log('SupabaseUserProfileManager: Utente autenticato in createDefaultPreferences:', user.id)

      const defaultPreferences: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        aiPreferito: {
          marketing: 'Claude',
          sviluppo: 'GitHub Copilot',
          analisi: 'ChatGPT-4',
          creativo: 'Midjourney',
          generico: 'ChatGPT-4'
        },
        budget: {
          mensile: 50,
          disponibileNuoviTool: true
        },
        notifiche: {
          suggerimenti: true,
          nuoveFunzionalita: true
        },
        tema: 'light'
      }
      console.log('SupabaseUserProfileManager: Tentativo di inserire preferenze di default per user:', user.id, defaultPreferences)

      const { data, error } = await supabase
        .from('user_preferences')
        .insert([defaultPreferences])
        .select()
        .single()

      if (error) {
        console.error('SupabaseUserProfileManager: Errore nella creazione preferenze di default:', error)
        return null
      }
      console.log('SupabaseUserProfileManager: Preferenze di default create:', data)
      return data
    } catch (error) {
      console.error('SupabaseUserProfileManager: Errore catch in createDefaultPreferences:', error)
      return null
    }
  }

  static async updateUserPreferences(updates: Partial<UserPreferences>): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('SupabaseUserProfileManager: Errore auth.getUser in updateUserPreferences:', authError)
        throw new Error('Errore di autenticazione')
      }
      if (!user) {
        console.error('SupabaseUserProfileManager: Utente non autenticato in updateUserPreferences.')
        throw new Error('Utente non autenticato')
      }
      console.log('SupabaseUserProfileManager: Utente autenticato in updateUserPreferences:', user.id)

      // Rimuovi campi che non dovrebbero essere aggiornati
      const { id, user_id, created_at, updated_at, ...updateData } = updates
      console.log('SupabaseUserProfileManager: Tentativo di aggiornare preferenze per user:', user.id, updateData)

      const { error } = await supabase
        .from('user_preferences')
        .update(updateData)
        .eq('user_id', user.id)

      if (error) {
        console.error('SupabaseUserProfileManager: Errore nell\'aggiornamento preferenze:', error)
        return false
      }
      console.log('SupabaseUserProfileManager: Preferenze utente aggiornate con successo.')
      return true
    } catch (error) {
      console.error('SupabaseUserProfileManager: Errore catch in updateUserPreferences:', error)
      return false
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  static async getAvailableAIOptions(): Promise<string[]> {
    try {
      const userTools = await this.getAITools()
      const userAINames = userTools.filter(tool => tool.attivo).map(tool => tool.nome)
      
      const defaultOptions = [
        'ChatGPT-4', 'Claude', 'Gemini', 'GitHub Copilot', 'Midjourney', 
        'DALL-E', 'Stable Diffusion', 'Runway', 'ElevenLabs', 'Perplexity'
      ]
      
      // Combina strumenti utente + default, rimuovendo duplicati
      const allOptions = [...new Set([...userAINames, ...defaultOptions])]
      console.log('SupabaseUserProfileManager: Opzioni AI disponibili:', allOptions)
      return allOptions
    } catch (error) {
      console.error('SupabaseUserProfileManager: Errore nel caricamento opzioni AI:', error)
      return [
        'ChatGPT-4', 'Claude', 'Gemini', 'GitHub Copilot', 'Midjourney', 
        'DALL-E', 'Stable Diffusion', 'Runway', 'ElevenLabs', 'Perplexity'
      ]
    }
  }

  static async isUserAuthenticated(): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('SupabaseUserProfileManager: Errore auth.getUser in isUserAuthenticated:', error)
        return false
      }
      console.log('SupabaseUserProfileManager: isUserAuthenticated - user:', user ? user.id : 'null')
      return !!user
    } catch (error) {
      console.error('SupabaseUserProfileManager: Errore catch in isUserAuthenticated:', error)
      return false
    }
  }

  // ==================== AUTHENTICATION HELPERS ====================

  static async signInAnonymously(): Promise<boolean> {
    try {
      console.log('SupabaseUserProfileManager: Tentativo di autenticazione anonima...')
      const { data, error } = await supabase.auth.signInAnonymously()
      
      if (error) {
        console.error('SupabaseUserProfileManager: Errore nell\'autenticazione anonima:', error)
        return false
      }
      console.log('SupabaseUserProfileManager: Autenticazione anonima riuscita, user:', data.user?.id)
      return !!data.user
    } catch (error) {
      console.error('SupabaseUserProfileManager: Errore catch nell\'autenticazione anonima:', error)
      return false
    }
  }

  static async ensureAuthenticated(): Promise<boolean> {
    console.log('SupabaseUserProfileManager: ensureAuthenticated - Inizio.')
    const isAuth = await this.isUserAuthenticated()
    if (!isAuth) {
      console.log('SupabaseUserProfileManager: ensureAuthenticated - Utente non autenticato, tentativo di signInAnonymously.')
      return await this.signInAnonymously()
    }
    console.log('SupabaseUserProfileManager: ensureAuthenticated - Utente già autenticato.')
    return true
  }
}

