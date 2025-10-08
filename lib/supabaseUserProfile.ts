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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Errore nel caricamento strumenti AI:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Errore nel caricamento strumenti AI:', error)
      return []
    }
  }

  static async addAITool(tool: Omit<AITool, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<AITool | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

      const { data, error } = await supabase
        .from('ai_tools')
        .insert([{
          ...tool,
          user_id: user.id
        }])
        .select()
        .single()

      if (error) {
        console.error('Errore nell\'aggiunta strumento AI:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Errore nell\'aggiunta strumento AI:', error)
      return null
    }
  }

  static async updateAITool(toolId: string, updates: Partial<AITool>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

      const { error } = await supabase
        .from('ai_tools')
        .update(updates)
        .eq('id', toolId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Errore nell\'aggiornamento strumento AI:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Errore nell\'aggiornamento strumento AI:', error)
      return false
    }
  }

  static async removeAITool(toolId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

      const { error } = await supabase
        .from('ai_tools')
        .delete()
        .eq('id', toolId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Errore nella rimozione strumento AI:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Errore nella rimozione strumento AI:', error)
      return false
    }
  }

  // ==================== USER PREFERENCES ====================

  static async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Nessun record trovato, crea preferenze di default
          return await this.createDefaultPreferences()
        }
        console.error('Errore nel caricamento preferenze:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Errore nel caricamento preferenze:', error)
      return null
    }
  }

  static async createDefaultPreferences(): Promise<UserPreferences | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

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

      const { data, error } = await supabase
        .from('user_preferences')
        .insert([defaultPreferences])
        .select()
        .single()

      if (error) {
        console.error('Errore nella creazione preferenze di default:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Errore nella creazione preferenze di default:', error)
      return null
    }
  }

  static async updateUserPreferences(updates: Partial<UserPreferences>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

      // Rimuovi campi che non dovrebbero essere aggiornati
      const { id, user_id, created_at, updated_at, ...updateData } = updates

      const { error } = await supabase
        .from('user_preferences')
        .update(updateData)
        .eq('user_id', user.id)

      if (error) {
        console.error('Errore nell\'aggiornamento preferenze:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Errore nell\'aggiornamento preferenze:', error)
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
      return allOptions
    } catch (error) {
      console.error('Errore nel caricamento opzioni AI:', error)
      return [
        'ChatGPT-4', 'Claude', 'Gemini', 'GitHub Copilot', 'Midjourney', 
        'DALL-E', 'Stable Diffusion', 'Runway', 'ElevenLabs', 'Perplexity'
      ]
    }
  }

  static async isUserAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return !!user
    } catch (error) {
      return false
    }
  }

  // ==================== AUTHENTICATION HELPERS ====================

  static async signInAnonymously(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.signInAnonymously()
      
      if (error) {
        console.error('Errore nell\'autenticazione anonima:', error)
        return false
      }

      return !!data.user
    } catch (error) {
      console.error('Errore nell\'autenticazione anonima:', error)
      return false
    }
  }

  static async ensureAuthenticated(): Promise<boolean> {
    const isAuth = await this.isUserAuthenticated()
    if (!isAuth) {
      return await this.signInAnonymously()
    }
    return true
  }
}
