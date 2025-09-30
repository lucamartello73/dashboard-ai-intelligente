'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Progetto, Task } from '@/types/database'
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  Clock,
  Play,
  Pause,
  ArrowLeft,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

export default function Progetti() {
  const [progetti, setProgetti] = useState<Progetto[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProgetto, setEditingProgetto] = useState<Progetto | null>(null)

  const [formData, setFormData] = useState<{
    nome_progetto: string
    obiettivo_generale: string
    stato: Progetto['stato']
  }>({
    nome_progetto: '',
    obiettivo_generale: '',
    stato: 'Da Iniziare'
  })

  useEffect(() => {
    caricaDati()
  }, [])

  const caricaDati = async () => {
    try {
      const [progettiRes, tasksRes] = await Promise.all([
        supabase
          .from('Progetti')
          .select('*')
          .order('data_creazione', { ascending: false }),
        supabase
          .from('Task')
          .select('*')
          .order('data_creazione', { ascending: false })
      ])

      if (progettiRes.error) throw progettiRes.error
      if (tasksRes.error) throw tasksRes.error

      setProgetti(progettiRes.data || [])
      setTasks(tasksRes.data || [])
    } catch (error) {
      console.error('Errore caricamento dati:', error)
    } finally {
      setLoading(false)
    }
  }

  const salvaProgetto = async () => {
    try {
      if (editingProgetto) {
        const { error } = await supabase
          .from('Progetti')
          .update(formData)
          .eq('id', editingProgetto.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('Progetti')
          .insert([formData])
        
        if (error) throw error
      }

      resetForm()
      caricaDati()
    } catch (error) {
      console.error('Errore salvataggio progetto:', error)
      alert('Errore nel salvataggio del progetto')
    }
  }

  const eliminaProgetto = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo progetto? Verranno eliminati anche tutti i task associati.')) return

    try {
      const { error } = await supabase
        .from('Progetti')
        .delete()
        .eq('id', id)

      if (error) throw error
      caricaDati()
    } catch (error) {
      console.error('Errore eliminazione progetto:', error)
      alert('Errore nell&apos;eliminazione del progetto')
    }
  }

  const modificaProgetto = (progetto: Progetto) => {
    setEditingProgetto(progetto)
    setFormData({
      nome_progetto: progetto.nome_progetto,
      obiettivo_generale: progetto.obiettivo_generale || '',
      stato: progetto.stato
    })
    setShowForm(true)
  }

  const cambiaStatoProgetto = async (id: string, nuovoStato: Progetto['stato']) => {
    try {
      const updateData: { stato: Progetto['stato'], data_completamento?: string } = { stato: nuovoStato }
      if (nuovoStato === 'Completato') {
        updateData.data_completamento = new Date().toISOString()
      }

      const { error } = await supabase
        .from('Progetti')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      caricaDati()
    } catch (error) {
      console.error('Errore cambio stato:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      nome_progetto: '',
      obiettivo_generale: '',
      stato: 'Da Iniziare'
    })
    setEditingProgetto(null)
    setShowForm(false)
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

  const getStatoIcon = (stato: string) => {
    switch (stato) {
      case 'Da Iniziare': return <Clock className="w-4 h-4" />
      case 'In Corso': return <Play className="w-4 h-4" />
      case 'In Revisione': return <Edit className="w-4 h-4" />
      case 'Completato': return <CheckCircle className="w-4 h-4" />
      case 'Pausa': return <Pause className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getTasksPerProgetto = (progettoId: string) => {
    return tasks.filter(task => task.id_progetto === progettoId)
  }

  const stati = ['Da Iniziare', 'In Corso', 'In Revisione', 'Completato', 'Pausa'] as const

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Caricamento progetti...</p>
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
                Gestione Progetti
              </h1>
              <p className="text-gray-600">
                Organizza e monitora i tuoi progetti e task
              </p>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Nuovo Progetto
            </button>
          </div>
        </div>

        {/* Statistiche rapide */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stati.map(stato => {
            const count = progetti.filter(p => p.stato === stato).length
            return (
              <div key={stato} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  {getStatoIcon(stato)}
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600">{stato}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Form per nuovo/modifica progetto */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editingProgetto ? 'Modifica Progetto' : 'Nuovo Progetto'}
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Progetto *
                </label>
                <input
                  type="text"
                  value={formData.nome_progetto}
                  onChange={(e) => setFormData({...formData, nome_progetto: e.target.value})}
                  placeholder="es. Lancio nuovo prodotto"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Obiettivo Generale
                </label>
                <textarea
                  value={formData.obiettivo_generale}
                  onChange={(e) => setFormData({...formData, obiettivo_generale: e.target.value})}
                  placeholder="Descrivi l'obiettivo principale di questo progetto..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stato
                </label>
                <select
                  value={formData.stato}
                  onChange={(e) => setFormData({...formData, stato: e.target.value as Progetto['stato']})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {stati.map(stato => (
                    <option key={stato} value={stato}>{stato}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={salvaProgetto}
                disabled={!formData.nome_progetto}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingProgetto ? 'Aggiorna' : 'Salva'} Progetto
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

        {/* Lista progetti */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Progetti ({progetti.length})
            </h2>
          </div>

          {progetti.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessun progetto ancora
              </h3>
              <p className="text-gray-500 mb-6">
                Inizia creando il tuo primo progetto
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Crea Primo Progetto
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {progetti.map((progetto) => {
                const progettoTasks = getTasksPerProgetto(progetto.id)
                const tasksCompletati = progettoTasks.filter(t => t.stato === 'Fatto').length
                
                return (
                  <div key={progetto.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {progetto.nome_progetto}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatoColor(progetto.stato)}`}>
                            {getStatoIcon(progetto.stato)}
                            {progetto.stato}
                          </span>
                        </div>
                        
                        {progetto.obiettivo_generale && (
                          <p className="text-gray-600 mb-3">
                            {progetto.obiettivo_generale}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            Creato il {new Date(progetto.data_creazione).toLocaleDateString('it-IT')}
                          </span>
                          {progetto.data_completamento && (
                            <span>
                              Completato il {new Date(progetto.data_completamento).toLocaleDateString('it-IT')}
                            </span>
                          )}
                          <span>
                            Task: {tasksCompletati}/{progettoTasks.length}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {progetto.stato !== 'Completato' && (
                          <button
                            onClick={() => cambiaStatoProgetto(progetto.id, 'Completato')}
                            className="p-2 text-gray-500 hover:text-green-600"
                            title="Segna come completato"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => modificaProgetto(progetto)}
                          className="p-2 text-gray-500 hover:text-blue-600"
                          title="Modifica"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => eliminaProgetto(progetto.id)}
                          className="p-2 text-gray-500 hover:text-red-600"
                          title="Elimina"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar per i task */}
                    {progettoTasks.length > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progresso Task</span>
                          <span>{Math.round((tasksCompletati / progettoTasks.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(tasksCompletati / progettoTasks.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
