'use client'

import { useState } from 'react'
import { 
  Plus, 
  Brain, 
  Monitor, 
  BarChart3, 
  MessageSquare,
  Copy,
  ExternalLink,
  ArrowRight,
  Settings,
  History
} from 'lucide-react'
import Link from 'next/link'

// Dati demo
const progettiDemo = [
  {
    id: '1',
    nome_progetto: 'Lancio nuovo prodotto',
    obiettivo_generale: 'Creare una strategia completa per il lancio del nuovo prodotto sul mercato',
    stato: 'In Corso',
    data_creazione: '2024-09-25T10:00:00Z'
  },
  {
    id: '2',
    nome_progetto: 'Analisi competitor Q3',
    obiettivo_generale: 'Analizzare la concorrenza e identificare opportunità di mercato',
    stato: 'Completato',
    data_creazione: '2024-09-20T14:30:00Z'
  }
]

const spaziAIDemo = [
  {
    id: '1',
    nome_spazio: 'GPT Marketing',
    piattaforma: 'ChatGPT',
    url_spazio: 'https://chat.openai.com/g/g-marketing',
    descrizione: 'Spazio specializzato per copywriting e strategie marketing',
    contesto_utilizzo: ['marketing', 'copywriting', 'social media']
  },
  {
    id: '2',
    nome_spazio: 'Claude Analisi',
    piattaforma: 'Claude',
    url_spazio: null,
    descrizione: 'Chat dedicata ad analisi dati e ricerche approfondite',
    contesto_utilizzo: ['analisi', 'ricerca', 'dati']
  },
  {
    id: '3',
    nome_spazio: 'Perplexity Research',
    piattaforma: 'Perplexity',
    url_spazio: null,
    descrizione: 'Collezione per ricerche di mercato',
    contesto_utilizzo: ['ricerca', 'mercato', 'trend']
  }
]

const contestiDemo = [
  {
    id: '1',
    titolo_conversazione: 'Strategia social media Q4',
    data_ultimo_aggiornamento: '2024-09-28T16:20:00Z'
  },
  {
    id: '2',
    titolo_conversazione: 'Analisi performance campagne',
    data_ultimo_aggiornamento: '2024-09-27T11:15:00Z'
  }
]

export default function DashboardDemo() {
  const [nuovaRichiesta, setNuovaRichiesta] = useState('')
  const [suggerimento, setSuggerimento] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const analizzaRichiesta = async () => {
    if (!nuovaRichiesta.trim()) return

    setLoading(true)
    
    // Simula l'analisi dell'orchestratore
    setTimeout(() => {
      setSuggerimento({
        tipo_task: 'Marketing e Comunicazione',
        spazio_ai_suggerito: 'GPT Marketing',
        computer_suggerito: 'Manager Operativo',
        prompt_ottimizzato: `Crea una strategia completa per: ${nuovaRichiesta}

Considera:
- Target audience e personas
- Canali di comunicazione più efficaci
- Budget e timeline
- KPI e metriche di successo
- Analisi competitor

Fornisci un piano dettagliato con azioni concrete e tempistiche.`,
        motivazione: 'Ho identificato questa richiesta come un task di marketing. Il GPT Marketing è specializzato in questo tipo di attività e può fornire strategie complete.',
        passi_successivi: [
          'Copia il prompt ottimizzato nel GPT Marketing',
          'Sviluppa la strategia dettagliata',
          'Crea un piano di implementazione',
          'Definisci metriche di successo'
        ]
      })
      setLoading(false)
    }, 2000)
  }

  const copiaPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    alert('Prompt copiato negli appunti!')
  }

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'Da Iniziare': return 'bg-gray-100 text-gray-800'
      case 'In Corso': return 'bg-blue-100 text-blue-800'
      case 'In Revisione': return 'bg-yellow-100 text-yellow-800'
      case 'Completato': return 'bg-green-100 text-green-800'
      case 'Pausa': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Dashboard AI Intelligente
              </h1>
              <p className="text-gray-600">
                Il tuo orchestratore personale per gestire progetti, AI e automazioni
              </p>
            </div>
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2">
              <p className="text-yellow-800 text-sm font-medium">
                🚀 Modalità Demo - Dati di esempio
              </p>
            </div>
          </div>
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
              placeholder="Prova con: 'Crea una campagna marketing per il nuovo prodotto' o 'Analizza i dati di vendita del Q3'"
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
                💡 Suggerimento dell&apos;Orchestratore AI
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
                      🎯 Spazio AI consigliato: {suggerimento.spazio_ai_suggerito}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Progetti Attivi */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">Progetti</h3>
              </div>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {progettiDemo.slice(0, 2).map((progetto) => (
                <div key={progetto.id} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 text-sm">{progetto.nome_progetto}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatoColor(progetto.stato)}`}>
                      {progetto.stato}
                    </span>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-center gap-2 p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                <span className="text-sm">Gestisci ({progettiDemo.length})</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Spazi AI */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">Spazi AI</h3>
              </div>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {spaziAIDemo.slice(0, 2).map((spazio) => (
                <div key={spazio.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{spazio.nome_spazio}</h4>
                      <p className="text-xs text-gray-600">{spazio.piattaforma}</p>
                    </div>
                    {spazio.url_spazio && (
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-center gap-2 p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                <span className="text-sm">Gestisci ({spaziAIDemo.length})</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Contesti Recenti */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-semibold text-gray-900">Contesti</h3>
              </div>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {contestiDemo.slice(0, 2).map((contesto) => (
                <div key={contesto.id} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {contesto.titolo_conversazione}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(contesto.data_ultimo_aggiornamento).toLocaleDateString('it-IT')}
                  </p>
                </div>
              ))}

              <div className="flex items-center justify-center gap-2 p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                <span className="text-sm">Gestisci ({contestiDemo.length})</span>
                <ArrowRight className="w-4 h-4" />
              </div>
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
                <h4 className="font-medium text-gray-900 text-sm">Analista Senior</h4>
                <p className="text-xs text-gray-600">3 schermi</p>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Disponibile
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 text-sm">Manager Operativo</h4>
                <p className="text-xs text-gray-600">2 schermi</p>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Disponibile
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note demo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            🎯 Funzionalità della Dashboard AI Intelligente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
            <div>
              <h4 className="font-medium mb-2">✨ Orchestratore AI</h4>
              <ul className="text-sm space-y-1">
                <li>• Analizza le tue richieste automaticamente</li>
                <li>• Suggerisce il miglior spazio AI specializzato</li>
                <li>• Genera prompt ottimizzati</li>
                <li>• Propone computer e strumenti ideali</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔄 Gestione Contesti</h4>
              <ul className="text-sm space-y-1">
                <li>• Trasferisce conversazioni tra AI diverse</li>
                <li>• Salva contesti per riutilizzo futuro</li>
                <li>• Funzione &quot;Copia Contesto&quot; universale</li>
                <li>• Memoria persistente cross-platform</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          Dashboard AI Intelligente - Il tuo maestro d&apos;orchestra per l&apos;automazione
        </div>
      </div>
    </div>
  )
}
