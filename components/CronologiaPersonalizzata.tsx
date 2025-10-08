"use client"

import { useState, useEffect } from "react"
import { UserProfileManager, CronologiaItem } from "@/lib/userProfile"
import {
  History,
  Star,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Filter,
  Search,
  Calendar,
  Brain,
  BarChart3,
  Lightbulb,
  Target,
  Award,
  RefreshCw
} from "lucide-react"

interface CronologiaPersonalizzataProps {
  onRicaricaRichiesta?: (richiesta: string, suggerimento: any) => void
}

export default function CronologiaPersonalizzata({ onRicaricaRichiesta }: CronologiaPersonalizzataProps) {
  const [cronologia, setCronologia] = useState<CronologiaItem[]>([])
  const [filtroTipo, setFiltroTipo] = useState<string>('tutti')
  const [filtroValutazione, setFiltroValutazione] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    loadCronologia()
  }, [])

  const loadCronologia = () => {
    const profile = UserProfileManager.getProfile()
    if (profile) {
      setCronologia(profile.cronologia)
    }
  }

  const handleValutazione = (itemId: string, valutazione: number) => {
    const profile = UserProfileManager.getProfile()
    if (profile) {
      const itemIndex = profile.cronologia.findIndex(item => item.id === itemId)
      if (itemIndex !== -1) {
        profile.cronologia[itemIndex].valutazione = valutazione
        UserProfileManager.saveProfile(profile)
        loadCronologia()
      }
    }
  }

  const handleToggleSeguito = (itemId: string) => {
    const profile = UserProfileManager.getProfile()
    if (profile) {
      const itemIndex = profile.cronologia.findIndex(item => item.id === itemId)
      if (itemIndex !== -1) {
        profile.cronologia[itemIndex].suggerimentoSeguito = !profile.cronologia[itemIndex].suggerimentoSeguito
        UserProfileManager.saveProfile(profile)
        loadCronologia()
      }
    }
  }

  const handleAddNote = (itemId: string, note: string) => {
    const profile = UserProfileManager.getProfile()
    if (profile) {
      const itemIndex = profile.cronologia.findIndex(item => item.id === itemId)
      if (itemIndex !== -1) {
        profile.cronologia[itemIndex].note = note
        UserProfileManager.saveProfile(profile)
        loadCronologia()
      }
    }
  }

  const cronologiaFiltrata = cronologia.filter(item => {
    const matchTipo = filtroTipo === 'tutti' || item.tipoTask === filtroTipo
    const matchValutazione = filtroValutazione === null || item.valutazione === filtroValutazione
    const matchSearch = searchTerm === '' || 
      item.richiesta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchTipo && matchValutazione && matchSearch
  })

  const getStats = () => {
    const totalItems = cronologia.length
    const seguiti = cronologia.filter(item => item.suggerimentoSeguito).length
    const valutati = cronologia.filter(item => item.valutazione).length
    const mediaValutazione = valutati > 0 
      ? cronologia.reduce((sum, item) => sum + (item.valutazione || 0), 0) / valutati 
      : 0
    
    const tipiTask = cronologia.reduce((acc, item) => {
      acc[item.tipoTask] = (acc[item.tipoTask] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const aiPiuUsati = cronologia.reduce((acc, item) => {
      if (item.aiUsato) {
        acc[item.aiUsato] = (acc[item.aiUsato] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return {
      totalItems,
      seguiti,
      valutati,
      mediaValutazione,
      tipiTask,
      aiPiuUsati,
      tassoSuccesso: totalItems > 0 ? (seguiti / totalItems) * 100 : 0
    }
  }

  const stats = getStats()
  const tipiTaskUnici = [...new Set(cronologia.map(item => item.tipoTask))]

  const getSuggerimentiPersonalizzati = () => {
    const suggerimenti = []
    
    // Suggerimento basato su tipo di task più frequente
    const tipoPreferito = Object.entries(stats.tipiTask).sort(([,a], [,b]) => b - a)[0]
    if (tipoPreferito) {
      suggerimenti.push({
        tipo: 'preferenza',
        titolo: 'Specializzazione Identificata',
        descrizione: `Lavori spesso su progetti di tipo "${tipoPreferito[0]}". Considera di approfondire strumenti specializzati per questo settore.`,
        icona: <Target className="w-5 h-5" />
      })
    }

    // Suggerimento basato su valutazioni basse
    const valutazioniBasse = cronologia.filter(item => item.valutazione && item.valutazione <= 2)
    if (valutazioniBasse.length > 2) {
      suggerimenti.push({
        tipo: 'miglioramento',
        titolo: 'Opportunità di Miglioramento',
        descrizione: `Hai ${valutazioniBasse.length} progetti con valutazioni basse. Prova a essere più specifico nelle richieste per ottenere suggerimenti migliori.`,
        icona: <TrendingUp className="w-5 h-5" />
      })
    }

    // Suggerimento basato su AI non utilizzati
    const profile = UserProfileManager.getProfile()
    if (profile && profile.aiTools.length > 0) {
      const aiNonUsati = profile.aiTools.filter(tool => 
        tool.attivo && !cronologia.some(item => item.aiUsato === tool.nome)
      )
      if (aiNonUsati.length > 0) {
        suggerimenti.push({
          tipo: 'esplorazione',
          titolo: 'Strumenti da Esplorare',
          descrizione: `Hai ${aiNonUsati.length} strumenti AI configurati ma non ancora utilizzati. Prova a sperimentare con ${aiNonUsati[0].nome}.`,
          icona: <Lightbulb className="w-5 h-5" />
        })
      }
    }

    return suggerimenti
  }

  const suggerimentiPersonalizzati = getSuggerimentiPersonalizzati()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <History className="w-8 h-8" />
          Cronologia Personalizzata
        </h1>
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          {showStats ? 'Nascondi' : 'Mostra'} Statistiche
        </button>
      </div>

      {/* Statistiche */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Totale Richieste</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Suggerimenti Seguiti</span>
            </div>
            <div className="text-2xl font-bold">{stats.seguiti}</div>
            <div className="text-sm text-gray-500">{stats.tassoSuccesso.toFixed(1)}% tasso successo</div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">Valutazione Media</span>
            </div>
            <div className="text-2xl font-bold">{stats.mediaValutazione.toFixed(1)}</div>
            <div className="text-sm text-gray-500">su {stats.valutati} valutazioni</div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Tipo Preferito</span>
            </div>
            <div className="text-lg font-bold capitalize">
              {Object.entries(stats.tipiTask).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Suggerimenti Personalizzati */}
      {suggerimentiPersonalizzati.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-blue-600" />
            Suggerimenti Personalizzati
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggerimentiPersonalizzati.map((suggerimento, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  {suggerimento.icona}
                  <h3 className="font-medium">{suggerimento.titolo}</h3>
                </div>
                <p className="text-sm text-gray-600">{suggerimento.descrizione}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtri */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtri:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Cerca nelle richieste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="tutti">Tutti i tipi</option>
            {tipiTaskUnici.map(tipo => (
              <option key={tipo} value={tipo} className="capitalize">{tipo}</option>
            ))}
          </select>
          
          <select
            value={filtroValutazione || ''}
            onChange={(e) => setFiltroValutazione(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tutte le valutazioni</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 stelle)</option>
            <option value="4">⭐⭐⭐⭐ (4 stelle)</option>
            <option value="3">⭐⭐⭐ (3 stelle)</option>
            <option value="2">⭐⭐ (2 stelle)</option>
            <option value="1">⭐ (1 stella)</option>
          </select>
        </div>
      </div>

      {/* Lista Cronologia */}
      <div className="space-y-4">
        {cronologiaFiltrata.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nessuna cronologia trovata</h3>
              <p>Inizia a usare l&apos;app per vedere qui la cronologia delle tue richieste</p>
          </div>
        ) : (
          cronologiaFiltrata.map((item) => (
            <CronologiaItemCard
              key={item.id}
              item={item}
              onValutazione={handleValutazione}
              onToggleSeguito={handleToggleSeguito}
              onAddNote={handleAddNote}
              onRicarica={onRicaricaRichiesta}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface CronologiaItemCardProps {
  item: CronologiaItem
  onValutazione: (itemId: string, valutazione: number) => void
  onToggleSeguito: (itemId: string) => void
  onAddNote: (itemId: string, note: string) => void
  onRicarica?: (richiesta: string, suggerimento: any) => void
}

function CronologiaItemCard({ 
  item, 
  onValutazione, 
  onToggleSeguito, 
  onAddNote, 
  onRicarica 
}: CronologiaItemCardProps) {
  const [showNote, setShowNote] = useState(false)
  const [noteText, setNoteText] = useState(item.note || '')

  const handleSaveNote = () => {
    onAddNote(item.id, noteText)
    setShowNote(false)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        onClick={() => onValutazione(item.id, i + 1)}
        className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
      >
        ⭐
      </button>
    ))
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.tipoTask === 'marketing' ? 'bg-pink-100 text-pink-800' :
              item.tipoTask === 'sviluppo' ? 'bg-blue-100 text-blue-800' :
              item.tipoTask === 'analisi' ? 'bg-green-100 text-green-800' :
              item.tipoTask === 'creativo' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {item.tipoTask}
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {item.timestamp.toLocaleDateString('it-IT')}
            </span>
            {item.aiUsato && (
              <span className="text-sm text-blue-600 font-medium">
                {item.aiUsato}
              </span>
            )}
          </div>
          
          <h3 className="font-medium text-gray-900 mb-2">{item.richiesta}</h3>
          
          {item.note && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-yellow-800">{item.note}</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          {onRicarica && (
            <button
              onClick={() => onRicarica(item.richiesta, null)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ricarica questa richiesta"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">Valutazione:</span>
            {renderStars(item.valutazione || 0)}
          </div>
          
          <button
            onClick={() => onToggleSeguito(item.id)}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
              item.suggerimentoSeguito
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {item.suggerimentoSeguito ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
            {item.suggerimentoSeguito ? 'Seguito' : 'Non seguito'}
          </button>
        </div>
        
        <button
          onClick={() => setShowNote(!showNote)}
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          {item.note ? 'Modifica nota' : 'Aggiungi nota'}
        </button>
      </div>

      {showNote && (
        <div className="pt-4 border-t border-gray-100">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Aggiungi una nota su questo progetto..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleSaveNote}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Salva
            </button>
            <button
              onClick={() => setShowNote(false)}
              className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
