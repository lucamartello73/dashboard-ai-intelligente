"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Progetto, SpazioAI, ContestoConversazione } from "@/types/database"
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
  History,
} from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const [progetti, setProgetti] = useState<Progetto[]>([])
  const [spaziAI, setSpaziAI] = useState<SpazioAI[]>([])
  const [contesti, setContesti] = useState<ContestoConversazione[]>([])
  const [nuovaRichiesta, setNuovaRichiesta] = useState("")
  const [suggerimento, setSuggerimento] = useState<{
    tipo_task: string
    spazio_ai_suggerito: string | null
    computer_suggerito: string | null
    prompt_ottimizzato: string
    motivazione: string
    passi_successivi: string[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [cronologiaRichieste, setCronologiaRichieste] = useState<Array<{
    id: string
    richiesta: string
    suggerimento: {
      tipo_task: string
      spazio_ai_suggerito: string | null
      computer_suggerito: string | null
      prompt_ottimizzato: string
      motivazione: string
      passi_successivi: string[]
    }
    timestamp: Date
  }>>([])
  const [richiestaAttiva, setRichiestaAttiva] = useState<string | null>(null)

  useEffect(() => {
    caricaDati()
  }, [])

  const caricaDati = async () => {
    try {
      const [progettiRes, spaziRes, contestiRes] = await Promise.all([
        (supabase as any).from("Progetti").select("*").order("data_creazione", { ascending: false }),
        (supabase as any).from("Spazi_AI").select("*"),
        (supabase as any)
          .from("Contesti_Conversazione")
          .select("*")
          .order("data_ultimo_aggiornamento", { ascending: false })
          .limit(5),
      ])

      if (progettiRes.data) setProgetti(progettiRes.data)
      if (spaziRes.data) setSpaziAI(spaziRes.data)
      if (contestiRes.data) setContesti(contestiRes.data)
    } catch (error) {
      console.error("Errore caricamento dati:", error)
    }
  }

  const analizzaRichiesta = async () => {
    if (!nuovaRichiesta.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ richiesta: nuovaRichiesta }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Errore analisi:", errorText)
        alert("Errore durante l'analisi della richiesta")
        return
      }

      const result = await response.json()
      setSuggerimento(result)
      
      // Salva nella cronologia
      const nuovaVoce = {
        id: Date.now().toString(),
        richiesta: nuovaRichiesta,
        suggerimento: result,
        timestamp: new Date()
      }
      setCronologiaRichieste(prev => [nuovaVoce, ...prev])
      setRichiestaAttiva(nuovaVoce.id)
    } catch (error) {
      console.error("Errore analisi:", error)
      alert("Errore durante l'analisi della richiesta")
    } finally {
      setLoading(false)
    }
  }

  const creaProgetto = async () => {
    if (!nuovaRichiesta.trim()) return

    try {
      const { error } = await (supabase as any)
        .from("Progetti")
        .insert([
          {
            nome_progetto: nuovaRichiesta.slice(0, 100),
            obiettivo_generale: nuovaRichiesta,
            stato: "Da Iniziare",
          },
        ])
        .select()

      if (error) throw error

      setNuovaRichiesta("")
      setSuggerimento(null)
      caricaDati()
    } catch (error) {
      console.error("Errore creazione progetto:", error)
    }
  }

  const resetRichiesta = () => {
    setNuovaRichiesta("")
    setSuggerimento(null)
    setRichiestaAttiva(null)
  }

  const caricaRichiestaStorica = (voce: typeof cronologiaRichieste[0]) => {
    setNuovaRichiesta(voce.richiesta)
    setSuggerimento(voce.suggerimento)
    setRichiestaAttiva(voce.id)
  }

  const copiaPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    alert("Prompt copiato negli appunti!")
  }

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case "Da Iniziare":
        return "bg-gray-100 text-gray-800"
      case "In Corso":
        return "bg-blue-100 text-blue-800"
      case "In Revisione":
        return "bg-yellow-100 text-yellow-800"
      case "Completato":
        return "bg-green-100 text-green-800"
      case "Pausa":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard AI Intelligente</h1>
          <p className="text-gray-600">Il tuo orchestratore personale per gestire progetti, AI e automazioni</p>
        </div>

        {/* Sezione principale: "Cosa vuoi fare oggi?" */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Cosa vuoi fare oggi?</h2>
          </div>

          <div className="space-y-4">
            <textarea
              value={nuovaRichiesta}
              onChange={(e) => setNuovaRichiesta(e.target.value)}
              placeholder="Descrivi cosa vuoi realizzare... (es. 'Crea una campagna marketing per il nuovo prodotto' o 'Analizza i dati di vendita del Q3')"
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={analizzaRichiesta}
                disabled={loading || !nuovaRichiesta.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain className="w-5 h-5" />
                {loading ? "Analizzando..." : "Analizza e Suggerisci"}
              </button>

              <button
                onClick={creaProgetto}
                disabled={!nuovaRichiesta.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                Crea Progetto Diretto
              </button>

              <button
                onClick={resetRichiesta}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Plus className="w-5 h-5 rotate-45" />
                Nuova Richiesta
              </button>
            </div>
          </div>

          {/* Suggerimento dell'orchestratore */}
          {suggerimento && (
            <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Suggerimento dell&apos;Orchestratore AI</h3>

              <div className="space-y-3">
                <p className="text-blue-800">
                  <strong>Tipo di task:</strong> {suggerimento.tipo_task}
                </p>

                <p className="text-blue-800">
                  <strong>Motivazione:</strong> {suggerimento.motivazione}
                </p>

                {suggerimento.spazio_ai_suggerito && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-red-600">🎯</span>
                    <span className="text-red-800 font-medium">Spazio AI consigliato trovato!</span>
                  </div>
                )}

                <button
                  onClick={() => copiaPrompt(suggerimento.prompt_ottimizzato)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Copy className="w-4 h-4" />
                  Copia Prompt Ottimizzato
                </button>

                <p className="text-sm text-blue-600">Incolla nello spazio AI suggerito</p>

                <div className="mt-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Passi successivi:</h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    {suggerimento.passi_successivi.map((passo, index) => (
                      <li key={index}>{passo}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cronologia Richieste */}
        {cronologiaRichieste.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <History className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Richieste Precedenti</h2>
            </div>

            <div className="space-y-4">
              {cronologiaRichieste.map((voce) => (
                <div 
                  key={voce.id} 
                  className={`p-4 rounded-lg border-2 transition-all ${
                    richiestaAttiva === voce.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium mb-1">
                        {voce.richiesta.length > 100 
                          ? `${voce.richiesta.substring(0, 100)}...` 
                          : voce.richiesta
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        {voce.timestamp.toLocaleString('it-IT')} • Tipo: {voce.suggerimento.tipo_task}
                      </p>
                    </div>
                    <button
                      onClick={() => caricaRichiestaStorica(voce)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Ricarica
                    </button>
                  </div>
                  
                  {richiestaAttiva === voce.id && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>AI suggerita:</strong> {voce.suggerimento.spazio_ai_suggerito}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Computer:</strong> {voce.suggerimento.computer_suggerito}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Griglia delle sezioni */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Progetti Attivi */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">Progetti</h3>
              </div>
              <Link href="/progetti" className="text-blue-600 hover:text-blue-800">
                <Settings className="w-5 h-5" />
              </Link>
            </div>

            <div className="space-y-3">
              {progetti.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nessun progetto ancora</p>
              ) : (
                progetti.slice(0, 3).map((progetto) => (
                  <div key={progetto.id} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">{progetto.nome_progetto}</h4>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatoColor(progetto.stato)}`}>
                        {progetto.stato}
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/progetti"
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
            >
              <Settings className="w-4 h-4" />
              Gestisci ({progetti.length})
            </Link>
          </div>

          {/* Spazi AI */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">Spazi AI</h3>
              </div>
              <Link href="/spazi-ai" className="text-blue-600 hover:text-blue-800">
                <Settings className="w-5 h-5" />
              </Link>
            </div>

            <div className="space-y-3">
              {spaziAI.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nessuno spazio configurato</p>
              ) : (
                spaziAI.slice(0, 3).map((spazio) => (
                  <div key={spazio.id} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">{spazio.nome_spazio}</h4>
                    <p className="text-sm text-gray-600">{spazio.piattaforma}</p>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/spazi-ai"
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
            >
              <Settings className="w-4 h-4" />
              Gestisci ({spaziAI.length})
            </Link>
          </div>

          {/* Contesti */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-semibold text-gray-900">Contesti</h3>
              </div>
              <Link href="/contesti" className="text-blue-600 hover:text-blue-800">
                <Settings className="w-5 h-5" />
              </Link>
            </div>

            <div className="space-y-3">
              {contesti.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nessun contesto salvato</p>
              ) : (
                contesti.slice(0, 3).map((contesto) => (
                  <div key={contesto.id} className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">{contesto.titolo_conversazione}</h4>
                    <p className="text-sm text-gray-600">{contesto.spazio_ai_origine}</p>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/contesti"
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50"
            >
              <Settings className="w-4 h-4" />
              Gestisci ({contesti.length})
            </Link>
          </div>

          {/* Computer */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Monitor className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Computer</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Analista Senior</h4>
                <p className="text-sm text-gray-600 mb-2">3 schermi</p>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Disponibile
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Manager Operativo</h4>
                <p className="text-sm text-gray-600 mb-2">2 schermi</p>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Disponibile
                </span>
              </div>
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
// Force deployment Wed Oct  8 04:56:15 EDT 2025
