'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Progetto, Task, SpazioAI } from '@/types/database'
import { 
  Plus, 
  Brain, 
  Monitor, 
  Zap, 
  BarChart3, 
  MessageSquare,
  Copy,
  ExternalLink,
  Play
} from 'lucide-react'

export default function Dashboard() {
  const [progetti, setProgetti] = useState<Progetto[]>([])
  const [spaziAI, setSpaziAI] = useState<SpazioAI[]>([])
  const [nuovaRichiesta, setNuovaRichiesta] = useState('')
  const [suggerimento, setSuggerimento] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    caricaDati()
  }, [])

  const caricaDati = async () => {
    try {
      const [progettiRes, spaziRes] = await Promise.all([
        supabase.from('Progetti').select('*').order('data_creazione', { ascending: false }),
        supabase.from('Spazi_AI').select('*')
      ])

      if (progettiRes.data) setProgetti(progettiRes.data)
      if (spaziRes.data) setSpaziAI(spaziRes.data)
    } catch (error) {
      console.error('Errore caricamento dati:', error)
    }
  }

  const analizzaRichiesta = async () => {
    if (!nuovaRichiesta.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ richiesta: nuovaRichiesta })
      })

      const result = await response.json()
      setSuggerimento(result)
    } catch (error) {
      console.error('Errore analisi:', error)
    } finally {
      setLoading(false)
    }
  }

  const creaProgetto = async () => {
    if (!nuovaRichiesta.trim()) return

    try {
      const { data, error } = await supabase
        .from('Progetti')
        .insert([{
          nome_progetto: nuovaRichiesta.slice(0, 100),
          obiettivo_generale: nuovaRichiesta,
          stato: 'Da Iniziare'
        }])
        .select()

      if (error) throw error

      setNuovaRichiesta('')
      setSuggerimento(null)
      caricaDati()
    } catch (error) {
      console.error('Errore creazione progetto:', error)
    }
  }

  const copiaPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    alert('Prompt copiato negli appunti!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dashboard AI Intelligente
          </h1>
          <p className="text-gray-600">
            Il tuo orchestratore personale per gestire progetti, AI e automazioni
          </p>
        </div>

        {/* Sezione principale: "Cosa vuoi fare oggi?" */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Cosa vuoi fare oggi?
            </h2>
          </div>

          <div className="space-y-4">
            <textarea
              value={nuovaRichiesta}
              onChange={(e) => setNuovaRichiesta(e.target.value)}
              placeholder="Descrivi cosa vuoi realizzare... (es. 'Crea una campagna marketing per il nuovo prodotto' o 'Analizza i dati di vendita del Q3')"
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={analizzaRichiesta}
                disabled={loading || !nuovaRichiesta.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain className="w-5 h-5" />
                {loading ? 'Analizzando...' : 'Analizza e Suggerisci'}
              </button>

              <button
                onClick={creaProgetto}
                disabled={!nuovaRichiesta.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                Crea Progetto Diretto
              </button>
            </div>
          </div>

          {/* Suggerimento dell'orchestratore */}
          {suggerimento && (
            <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                💡 Suggerimento dell'Orchestratore AI
              </h3>
              
              <div className="space-y-3">
                <p className="text-blue-800">
                  <strong>Tipo di task:</strong> {suggerimento.tipo_task}
                </p>
                
                <p className="text-blue-800">
                  <strong>Motivazione:</strong> {suggerimento.motivazione}
                </p>

                {suggerimento.spazio_ai_suggerito && (
                  <div className="bg-white p-4 rounded border">
                    <p className="font-medium text-gray-900 mb-2">
                      🎯 Spazio AI consigliato trovato!
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => copiaPrompt(suggerimento.prompt_ottimizzato)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                        Copia Prompt Ottimizzato
                      </button>
                      <span className="text-sm text-gray-600">
                        Incolla nello spazio AI suggerito
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <p className="font-medium text-blue-900 mb-2">Passi successivi:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    {suggerimento.passi_successivi?.map((passo: string, index: number) => (
                      <li key={index}>{passo}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Griglia delle sezioni */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Progetti Attivi */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Progetti Attivi</h3>
            </div>
            
            <div className="space-y-3">
              {progetti.slice(0, 3).map((progetto) => (
                <div key={progetto.id} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{progetto.nome_progetto}</h4>
                  <p className="text-sm text-gray-600">{progetto.stato}</p>
                </div>
              ))}
              
              {progetti.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nessun progetto ancora. Creane uno sopra!
                </p>
              )}
            </div>
          </div>

          {/* Spazi AI */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Spazi AI</h3>
            </div>
            
            <div className="space-y-3">
              {spaziAI.slice(0, 3).map((spazio) => (
                <div key={spazio.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{spazio.nome_spazio}</h4>
                      <p className="text-sm text-gray-600">{spazio.piattaforma}</p>
                    </div>
                    {spazio.url_spazio && (
                      <a 
                        href={spazio.url_spazio} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
              
              {spaziAI.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nessuno spazio AI configurato
                </p>
              )}
            </div>
          </div>

          {/* Computer */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Computer</h3>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Analista Senior</h4>
                <p className="text-sm text-gray-600">3 schermi - Analisi complesse</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Manager Operativo</h4>
                <p className="text-sm text-gray-600">2 schermi - Gestione progetti</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">Creativo Digitale</h4>
                <p className="text-sm text-gray-600">1 schermo - Design e frontend</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          Dashboard AI Intelligente - Il tuo maestro d'orchestra per l'automazione
        </div>
      </div>
    </div>
  )
}
