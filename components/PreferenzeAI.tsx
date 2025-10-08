"use client"

import { useState, useEffect } from "react"
import { UserProfileManager, AITool, UserPreferences } from "@/lib/userProfile"
import {
  Plus,
  Settings,
  Trash2,
  Check,
  X,
  Brain,
  Code,
  Image,
  Video,
  Music,
  BarChart3,
  Star,
  DollarSign,
  Bell,
  Palette
} from "lucide-react"

interface PreferenzeAIProps {
  onClose?: () => void
}

export default function PreferenzeAI({ onClose }: PreferenzeAIProps) {
  const [aiTools, setAiTools] = useState<AITool[]>([])
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [showAddTool, setShowAddTool] = useState(false)
  const [newTool, setNewTool] = useState<Partial<AITool>>({
    nome: '',
    tipo: 'chat',
    piano: 'free',
    attivo: true
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const profile = UserProfileManager.getProfile()
    if (profile) {
      setAiTools(profile.aiTools)
      setPreferences(profile.preferences)
    } else {
      const defaultProfile = UserProfileManager.createDefaultProfile()
      setAiTools(defaultProfile.aiTools)
      setPreferences(defaultProfile.preferences)
    }
  }

  const handleAddTool = () => {
    if (newTool.nome && newTool.tipo) {
      UserProfileManager.addAITool(newTool as Omit<AITool, 'id'>)
      setNewTool({ nome: '', tipo: 'chat', piano: 'free', attivo: true })
      setShowAddTool(false)
      loadData()
    }
  }

  const handleUpdateTool = (toolId: string, updates: Partial<AITool>) => {
    UserProfileManager.updateAITool(toolId, updates)
    loadData()
  }

  const handleRemoveTool = (toolId: string) => {
    UserProfileManager.removeAITool(toolId)
    loadData()
  }

  const handleUpdatePreferences = (updates: Partial<UserPreferences>) => {
    if (preferences) {
      const newPreferences = { ...preferences, ...updates }
      UserProfileManager.updatePreferences(updates)
      setPreferences(newPreferences)
    }
  }

  const getTypeIcon = (tipo: AITool['tipo']) => {
    switch (tipo) {
      case 'chat': return <Brain className="w-4 h-4" />
      case 'coding': return <Code className="w-4 h-4" />
      case 'image': return <Image className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'audio': return <Music className="w-4 h-4" />
      case 'analysis': return <BarChart3 className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getPlanColor = (piano: AITool['piano']) => {
    switch (piano) {
      case 'free': return 'bg-gray-100 text-gray-800'
      case 'plus': return 'bg-blue-100 text-blue-800'
      case 'pro': return 'bg-purple-100 text-purple-800'
      case 'enterprise': return 'bg-gold-100 text-gold-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const aiToolsOptions = [
    'ChatGPT-4', 'Claude', 'Gemini', 'GitHub Copilot', 'Midjourney', 
    'DALL-E', 'Stable Diffusion', 'Runway', 'ElevenLabs', 'Perplexity'
  ]

  if (!preferences) return <div>Caricamento...</div>

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Preferenze AI
        </h1>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Sezione I Miei Strumenti AI */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="w-6 h-6" />
            I Miei Strumenti AI
          </h2>
          <button
            onClick={() => setShowAddTool(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Aggiungi Strumento
          </button>
        </div>

        {/* Form Aggiungi Strumento */}
        {showAddTool && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-medium mb-4">Nuovo Strumento AI</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  value={newTool.nome}
                  onChange={(e) => setNewTool({ ...newTool, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="es. ChatGPT-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={newTool.tipo}
                  onChange={(e) => setNewTool({ ...newTool, tipo: e.target.value as AITool['tipo'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="chat">Chat/Conversazione</option>
                  <option value="coding">Programmazione</option>
                  <option value="image">Generazione Immagini</option>
                  <option value="video">Generazione Video</option>
                  <option value="audio">Generazione Audio</option>
                  <option value="analysis">Analisi Dati</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Piano</label>
                <select
                  value={newTool.piano}
                  onChange={(e) => setNewTool({ ...newTool, piano: e.target.value as AITool['piano'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="free">Gratuito</option>
                  <option value="plus">Plus</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleAddTool}
                  className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Salva
                </button>
                <button
                  onClick={() => setShowAddTool(false)}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista Strumenti */}
        <div className="space-y-3">
          {aiTools.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nessuno strumento AI configurato</p>
              <p className="text-sm">Aggiungi i tuoi strumenti AI per ricevere suggerimenti personalizzati</p>
            </div>
          ) : (
            aiTools.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {getTypeIcon(tool.tipo)}
                  <div>
                    <h3 className="font-medium">{tool.nome}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPlanColor(tool.piano)}`}>
                        {tool.piano.toUpperCase()}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${tool.attivo ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span>{tool.attivo ? 'Attivo' : 'Inattivo'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateTool(tool.id, { attivo: !tool.attivo })}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      tool.attivo 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {tool.attivo ? 'Disattiva' : 'Attiva'}
                  </button>
                  <button
                    onClick={() => handleRemoveTool(tool.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sezione Preferenze AI per Tipo di Task */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
          <Star className="w-6 h-6" />
          AI Preferiti per Tipo di Task
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(preferences.aiPreferito).map(([tipo, aiPreferito]) => (
            <div key={tipo} className="space-y-2">
              <label className="block text-sm font-medium capitalize">
                {tipo === 'generico' ? 'Progetti Generici' : tipo}
              </label>
              <select
                value={aiPreferito}
                onChange={(e) => handleUpdatePreferences({
                  aiPreferito: { ...preferences.aiPreferito, [tipo]: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {aiToolsOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Sezione Budget e Notifiche */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
            <DollarSign className="w-6 h-6" />
            Budget
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Budget Mensile (€)</label>
              <input
                type="number"
                value={preferences.budget.mensile}
                onChange={(e) => handleUpdatePreferences({
                  budget: { ...preferences.budget, mensile: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="nuovi-tool"
                checked={preferences.budget.disponibileNuoviTool}
                onChange={(e) => handleUpdatePreferences({
                  budget: { ...preferences.budget, disponibileNuoviTool: e.target.checked }
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="nuovi-tool" className="text-sm">
                Disponibile per nuovi strumenti AI
              </label>
            </div>
          </div>
        </div>

        {/* Notifiche e Tema */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
            <Bell className="w-6 h-6" />
            Notifiche e Tema
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notif-suggerimenti"
                checked={preferences.notifiche.suggerimenti}
                onChange={(e) => handleUpdatePreferences({
                  notifiche: { ...preferences.notifiche, suggerimenti: e.target.checked }
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="notif-suggerimenti" className="text-sm">
                Suggerimenti personalizzati
              </label>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notif-funzionalita"
                checked={preferences.notifiche.nuoveFunzionalita}
                onChange={(e) => handleUpdatePreferences({
                  notifiche: { ...preferences.notifiche, nuoveFunzionalita: e.target.checked }
                })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="notif-funzionalita" className="text-sm">
                Nuove funzionalità
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Tema
              </label>
              <select
                value={preferences.tema}
                onChange={(e) => handleUpdatePreferences({
                  tema: e.target.value as 'light' | 'dark' | 'auto'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="light">Chiaro</option>
                <option value="dark">Scuro</option>
                <option value="auto">Automatico</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
