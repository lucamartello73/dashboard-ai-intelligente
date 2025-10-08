'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SpazioAI } from '@/types/database'
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink,
  MessageSquare,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export default function SpaziAI() {
  const [spazi, setSpazi] = useState<SpazioAI[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSpazio, setEditingSpazio] = useState<SpazioAI | null>(null)
  const [formData, setFormData] = useState({
    nome_spazio: '',
    piattaforma: '',
    url_spazio: '',
    descrizione: '',
    contesto_utilizzo: ''
  })

  useEffect(() => {
    caricaSpazi()
  }, [])

  const caricaSpazi = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('Spazi_AI')
        .select('*')
        .order('data_creazione', { ascending: false })

      if (error) throw error
      setSpazi(data || [])
    } catch (error) {
      console.error('Errore caricamento spazi:', error)
    } finally {
      setLoading(false)
    }
  }

  const salvaSpazio = async () => {
    try {
      const contesto_array = formData.contesto_utilizzo
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)

      const spazioData = {
        nome_spazio: formData.nome_spazio,
        piattaforma: formData.piattaforma,
        url_spazio: formData.url_spazio || null,
        descrizione: formData.descrizione || null,
        contesto_utilizzo: contesto_array
      }

      if (editingSpazio) {
        const { error } = await (supabase as any)
          .from('Spazi_AI')
          .update(spazioData)
          .eq('id', editingSpazio.id)
        
        if (error) throw error
      } else {
        const { error } = await (supabase as any)
          .from('Spazi_AI')
          .insert([spazioData])
        
        if (error) throw error
      }

      resetForm()
      caricaSpazi()
    } catch (error) {
      console.error('Errore salvataggio spazio:', error)
      alert('Errore nel salvataggio dello spazio AI')
    }
  }

  const eliminaSpazio = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo spazio AI?')) return

    try {
      const { error } = await (supabase as any)
        .from('Spazi_AI')
        .delete()
        .eq('id', id)

      if (error) throw error
      caricaSpazi()
    } catch (error) {
      console.error('Errore eliminazione spazio:', error)
      alert('Errore nell&apos;eliminazione dello spazio AI')
    }
  }

  const modificaSpazio = (spazio: SpazioAI) => {
    setEditingSpazio(spazio)
    setFormData({
      nome_spazio: spazio.nome_spazio,
      piattaforma: spazio.piattaforma,
      url_spazio: spazio.url_spazio || '',
      descrizione: spazio.descrizione || '',
      contesto_utilizzo: spazio.contesto_utilizzo.join(', ')
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      nome_spazio: '',
      piattaforma: '',
      url_spazio: '',
      descrizione: '',
      contesto_utilizzo: ''
    })
    setEditingSpazio(null)
    setShowForm(false)
  }

  const piattaforme = ['ChatGPT', 'Claude', 'Perplexity', 'Gemini', 'Altro']

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Caricamento spazi AI...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna alla Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Gestione Spazi AI
              </h1>
              <p className="text-gray-600">
                Configura i tuoi spazi AI specializzati per l&apos;orchestrazione intelligente
              </p>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Nuovo Spazio AI
            </button>
          </div>
        </div>

        {/* Form per nuovo/modifica spazio */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editingSpazio ? 'Modifica Spazio AI' : 'Nuovo Spazio AI'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Spazio *
                </label>
                <input
                  type="text"
                  value={formData.nome_spazio}
                  onChange={(e) => setFormData({...formData, nome_spazio: e.target.value})}
                  placeholder="es. GPT Marketing"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Piattaforma *
                </label>
                <select
                  value={formData.piattaforma}
                  onChange={(e) => setFormData({...formData, piattaforma: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleziona piattaforma</option>
                  {piattaforme.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Spazio (opzionale)
                </label>
                <input
                  type="url"
                  value={formData.url_spazio}
                  onChange={(e) => setFormData({...formData, url_spazio: e.target.value})}
                  placeholder="https://chat.openai.com/g/g-xyz..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrizione
                </label>
                <textarea
                  value={formData.descrizione}
                  onChange={(e) => setFormData({...formData, descrizione: e.target.value})}
                  placeholder="Descrivi a cosa serve questo spazio AI..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contesti di Utilizzo *
                </label>
                <input
                  type="text"
                  value={formData.contesto_utilizzo}
                  onChange={(e) => setFormData({...formData, contesto_utilizzo: e.target.value})}
                  placeholder="marketing, copywriting, social media, campagne (separati da virgola)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Inserisci le parole chiave che identificano quando usare questo spazio, separate da virgola
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={salvaSpazio}
                disabled={!formData.nome_spazio || !formData.piattaforma || !formData.contesto_utilizzo}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingSpazio ? 'Aggiorna' : 'Salva'} Spazio AI
              </button>
              
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Annulla
              </button>
            </div>
          </div>
        )}

        {/* Lista spazi AI */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Spazi AI Configurati ({spazi.length})
            </h2>
          </div>

          {spazi.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessuno spazio AI configurato
              </h3>
              <p className="text-gray-500 mb-6">
                Inizia aggiungendo il tuo primo spazio AI specializzato
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Aggiungi Primo Spazio AI
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spazi.map((spazio) => (
                <div key={spazio.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {spazio.nome_spazio}
                      </h3>
                      <p className="text-sm text-blue-600 font-medium">
                        {spazio.piattaforma}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {spazio.url_spazio && (
                        <a
                          href={spazio.url_spazio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-blue-600"
                          title="Apri spazio AI"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      
                      <button
                        onClick={() => modificaSpazio(spazio)}
                        className="p-2 text-gray-500 hover:text-blue-600"
                        title="Modifica"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => eliminaSpazio(spazio.id)}
                        className="p-2 text-gray-500 hover:text-red-600"
                        title="Elimina"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {spazio.descrizione && (
                    <p className="text-gray-600 text-sm mb-4">
                      {spazio.descrizione}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {spazio.contesto_utilizzo.map((contesto, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {contesto}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Creato il {new Date(spazio.data_creazione).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
