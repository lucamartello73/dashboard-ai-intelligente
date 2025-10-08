// Sistema di gestione profilo utente con localStorage
export interface UserProfile {
  id: string
  nome?: string
  email?: string
  aiTools: AITool[]
  preferences: UserPreferences
  cronologia: CronologiaItem[]
  createdAt: Date
  updatedAt: Date
}

export interface AITool {
  id: string
  nome: string
  tipo: 'chat' | 'coding' | 'image' | 'video' | 'audio' | 'analysis'
  piano: 'free' | 'plus' | 'pro' | 'enterprise'
  attivo: boolean
  apiKey?: string
  note?: string
}

export interface UserPreferences {
  aiPreferito: {
    marketing: string
    sviluppo: string
    analisi: string
    creativo: string
    generico: string
  }
  budget: {
    mensile: number
    disponibileNuoviTool: boolean
  }
  notifiche: {
    suggerimenti: boolean
    nuoveFunzionalita: boolean
  }
  tema: 'light' | 'dark' | 'auto'
}

export interface CronologiaItem {
  id: string
  richiesta: string
  tipoTask: string
  aiUsato?: string
  suggerimentoSeguito: boolean
  valutazione?: number // 1-5 stelle
  note?: string
  timestamp: Date
}

// Funzioni per gestire il profilo utente
export class UserProfileManager {
  private static STORAGE_KEY = 'dashboard-ai-user-profile'

  static getProfile(): UserProfile | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null
      
      const profile = JSON.parse(stored)
      // Converti le date da string a Date
      profile.createdAt = new Date(profile.createdAt)
      profile.updatedAt = new Date(profile.updatedAt)
      profile.cronologia = profile.cronologia.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }))
      
      return profile
    } catch (error) {
      console.error('Errore caricamento profilo:', error)
      return null
    }
  }

  static saveProfile(profile: UserProfile): void {
    try {
      profile.updatedAt = new Date()
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile))
    } catch (error) {
      console.error('Errore salvataggio profilo:', error)
    }
  }

  static createDefaultProfile(): UserProfile {
    return {
      id: `user_${Date.now()}`,
      aiTools: [],
      preferences: {
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
        tema: 'auto'
      },
      cronologia: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  static addToCronologia(item: Omit<CronologiaItem, 'id' | 'timestamp'>): void {
    const profile = this.getProfile() || this.createDefaultProfile()
    
    const cronologiaItem: CronologiaItem = {
      ...item,
      id: `cronologia_${Date.now()}`,
      timestamp: new Date()
    }
    
    profile.cronologia.unshift(cronologiaItem) // Aggiungi in cima
    
    // Mantieni solo gli ultimi 50 elementi
    if (profile.cronologia.length > 50) {
      profile.cronologia = profile.cronologia.slice(0, 50)
    }
    
    this.saveProfile(profile)
  }

  static updatePreferences(preferences: Partial<UserPreferences>): void {
    const profile = this.getProfile() || this.createDefaultProfile()
    profile.preferences = { ...profile.preferences, ...preferences }
    this.saveProfile(profile)
  }

  static addAITool(tool: Omit<AITool, 'id'>): void {
    const profile = this.getProfile() || this.createDefaultProfile()
    
    const aiTool: AITool = {
      ...tool,
      id: `ai_${Date.now()}`
    }
    
    profile.aiTools.push(aiTool)
    this.saveProfile(profile)
  }

  static updateAITool(toolId: string, updates: Partial<AITool>): void {
    const profile = this.getProfile() || this.createDefaultProfile()
    
    const toolIndex = profile.aiTools.findIndex(tool => tool.id === toolId)
    if (toolIndex !== -1) {
      profile.aiTools[toolIndex] = { ...profile.aiTools[toolIndex], ...updates }
      this.saveProfile(profile)
    }
  }

  static removeAITool(toolId: string): void {
    const profile = this.getProfile() || this.createDefaultProfile()
    profile.aiTools = profile.aiTools.filter(tool => tool.id !== toolId)
    this.saveProfile(profile)
  }

  static getAIToolsByType(tipo: AITool['tipo']): AITool[] {
    const profile = this.getProfile()
    if (!profile) return []
    
    return profile.aiTools.filter(tool => tool.tipo === tipo && tool.attivo)
  }

  static getPreferredAI(tipoTask: keyof UserPreferences['aiPreferito']): string {
    const profile = this.getProfile()
    if (!profile) return 'ChatGPT-4' // Default
    
    return profile.preferences.aiPreferito[tipoTask] || 'ChatGPT-4'
  }

  static getCronologiaByType(tipoTask: string): CronologiaItem[] {
    const profile = this.getProfile()
    if (!profile) return []
    
    return profile.cronologia.filter(item => item.tipoTask === tipoTask)
  }

  static getSuccessfulSuggestions(): CronologiaItem[] {
    const profile = this.getProfile()
    if (!profile) return []
    
    return profile.cronologia.filter(item => item.suggerimentoSeguito && (item.valutazione || 0) >= 4)
  }
}
