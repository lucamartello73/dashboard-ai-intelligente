'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ContestoConversazione, SpazioAI, Task } from '@/types/database'
import { 
  Plus, 
  Search, 
  Filter,
  ArrowLeft,
  MessageSquare,
  Calendar,
  Tag,
  Trash2,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import { ConversazioneSalvata } from '@/components/CopiaContesto'

export default function Contesti() {
  const [contesti, setContesti] = useState<ContestoConversazione[]>([])
  const [spaziAI, setSpaziAI] = useState<SpazioAI[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroSpazio, setFiltroSpazio] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingContesto, setEditingContesto] = useState<ContestoConversazione | null>(null)
  const [formData, setFormData] = useState({
    titolo_conversazione: '',
    id_spazio_ai: '',
    id_task: '',
    conversazione_completa: '',
    riassunto_generato_ai: ''
  })

  useEffect(() => {
    caricaDati()
  }, [])

  const caricaDati = async () => {
    try {
      const [contestiRes, spaziRes, tasksRes] = await Promise.all([
        (supabase as any)
          .from('Contesti_Conversazione')
          .select('*')
          .order('data_ultimo_aggiornamento', { ascending: false }),
        (supabase as any)
          .from('Spazi_AI')
          .select('*'),
        (supabase as any)
          .from('Task')
          .select('*')
      ])

      if (contestiRes.error) throw contestiRes.error
      if (spaziRes.error) throw spaziRes.error
      if (tasksRes.error) throw tasksRes.error

      setContesti(contestiRes.data || [])
      setSpaziAI(spaziRes.data || [])
      setTasks(tasksRes.data || [])
    } catch (error) {
      console.error('Errore caricamento dati:', error)
    } finally {
      setLoading(false)
    }
  }

  const salvaContesto = async () => {
    try {
      let conversazione_array: Array<{role: string, content: string}> = []
      
      if (formData.conversazione_completa) {
        try {
          conversazione_array = JSON.parse(formData.conversazione_completa)
        } catch {
          // Se non è JSON valido, crea una conversazione semplice
          conversazione_array = [
            { role: 'user', content: formData.conversazione_completa }
          ]
        }
      }

      const contestoData: Record<string, unknown> = {
        titolo_conversazione: formData.titolo_conversazione,
        id_spazio_ai: formData.id_spazio_ai || null,
        id_task: formData.id_task || null,
        conversazione_completa: conversazione_array,
        riassunto_generato_ai: formData.riassunto_generato_ai || null
      }

      if (editingContesto) {
        const { error } = await (supabase as any)
          .from('Contesti_Conversazione')
          .update(contestoData)
          .eq('id', editingContesto.id)
        
        if (error) throw error
      } else {
        const { error } = await (supabase as any)
          .from('Contesti_Conversazione')
          .insert([contestoData])
        
        if (error) throw error
      }

      resetForm()
      caricaDati()
    } catch (error) {
      console.error('Errore salvataggio contesto:', error)
      alert('Errore nel salvataggio del contesto')
    }
  }

  const eliminaContesto = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo contesto di conversazione?')) return

    try {
      const { error } = await (supabase as any)
        .from('Contesti_Conversazione')
        .delete()
        .eq('id', id)

      if (error) throw error
      caricaDati()
    } catch (error) {
      console.error('Errore eliminazione contesto:', error)
      alert('Errore nell&apos;eliminazione del contesto')
    }
  }

  const modificaContesto = (contesto: ContestoConversazione) => {
    setEditingContesto(contesto)
    setFormData({
      titolo_conversazione: contesto.titolo_conversazione || '',
      id_spazio_ai: contesto.id_spazio_ai || '',
      id_task: contesto.id_task || '',
      conversazione_completa: JSON.stringify(contesto.conversazione_completa || [], null, 2),
      riassunto_generato_ai: contesto.riassunto_generato_ai || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      titolo_conversazione: '',
      id_spazio_ai: '',
      id_task: '',
      conversazione_completa: '',
      riassunto_generato_ai: ''
    })
    setEditingContesto(null)
    setShowForm(false)
  }

  const getSpazioNome = (id: string | undefined) => {
    if (!id) return 'Nessuno spazio'
    const spazio = spaziAI.find(s => s.id === id)
    return spazio ? spazio.nome_spazio : 'Spazio sconosciuto'
  }

  const getTaskNome = (id: string | undefined) => {
    if (!id) return 'Nessun task'
    const task = tasks.find(t => t.id === id)
    return task ? task.descrizione_task : 'Task sconosciuto'
  }

  // Filtraggio dei contesti
  const contestiFiltrati = contesti.filter(contesto => {
    const matchSearch = !searchTerm || 
      contesto.titolo_conversazione?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contesto.riassunto_generato_ai?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchSpazio = !filtroSpazio || contesto.id_spazio_ai === filtroSpazio
    
    return matchSearch && matchSpazio
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Caricamento contesti...</p>
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
                Contesti di Conversazione
              </h1>
              <p className="text-gray-600">
                Gestisci e trasferisci i tuoi contesti di conversazione tra diverse AI
              </p>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Nuovo Contesto
            </button>
          </div>
        </div>

        {/* Filtri e ricerca */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cerca nei titoli e riassunti..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filtroSpazio}
                  onChange={(e) => setFiltroSpazio(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">Tutti gli spazi AI</option>
                  {spaziAI.map(spazio => (
                    <option key={spazio.id} value={spazio.id}>
                      {spazio.nome_spazio}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span>Trovati {contestiFiltrati.length} contesti</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-800"
              >
                Cancella ricerca
              </button>
            )}
            {filtroSpazio && (
              <button
                onClick={() => setFiltroSpazio('')}
                className="text-blue-600 hover:text-blue-800"
              >
                Rimuovi filtro
              </button>
            )}
          </div>
        </div>

        {/* Form per nuovo/modifica contesto */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editingContesto ? 'Modifica Contesto' : 'Nuovo Contesto'}
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titolo Conversazione *
                </label>
                <input
                  type="text"
                  value={formData.titolo_conversazione}
                  onChange={(e) => setFormData({...formData, titolo_conversazione: e.target.value})}
                  placeholder="es. Analisi mercato Q3 2024"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spazio AI (opzionale)
                  </label>
                  <select
                    value={formData.id_spazio_ai}
                    onChange={(e) => setFormData({...formData, id_spazio_ai: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Nessuno spazio specifico</option>
                    {spaziAI.map(spazio => (
                      <option key={spazio.id} value={spazio.id}>
                        {spazio.nome_spazio} ({spazio.piattaforma})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Collegato (opzionale)
                  </label>
                  <select
                    value={formData.id_task}
                    onChange={(e) => setFormData({...formData, id_task: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Nessun task specifico</option>
                    {tasks.slice(0, 20).map(task => (
                      <option key={task.id} value={task.id}>
                        {task.descrizione_task.slice(0, 50)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conversazione (JSON)
                </label>
                <textarea
                  value={formData.conversazione_completa}
                  onChange={(e) => setFormData({...formData, conversazione_completa: e.target.value})}
                  placeholder='[{"role": "user", "content": "Ciao"}, {"role": "assistant", "content": "Ciao! Come posso aiutarti?"}]'
                  rows={8}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Inserisci la conversazione in formato JSON o testo semplice
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Riassunto (opzionale)
                </label>
                <textarea
                  value={formData.riassunto_generato_ai}
                  onChange={(e) => setFormData({...formData, riassunto_generato_ai: e.target.value})}
                  placeholder="Riassunto automatico o manuale della conversazione..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={salvaContesto}
                disabled={!formData.titolo_conversazione}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingContesto ? 'Aggiorna' : 'Salva'} Contesto
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

        {/* Lista contesti */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-semibold text-gray-900">
              Contesti Salvati ({contestiFiltrati.length})
            </h2>
          </div>

          {contestiFiltrati.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {contesti.length === 0 ? 'Nessun contesto salvato' : 'Nessun risultato'}
              </h3>
              <p className="text-gray-500 mb-6">
                {contesti.length === 0 
                  ? 'Inizia salvando il tuo primo contesto di conversazione'
                  : 'Prova a modificare i filtri di ricerca'
                }
              </p>
              {contesti.length === 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                  Salva Primo Contesto
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {contestiFiltrati.map((contesto) => (
                <div key={contesto.id} className="relative">
                  <ConversazioneSalvata
                    titolo={contesto.titolo_conversazione || 'Conversazione senza titolo'}
                    conversazione={contesto.conversazione_completa || []}
                    dataAggiornamento={contesto.data_ultimo_aggiornamento}
                    spazioAI={getSpazioNome(contesto.id_spazio_ai)}
                  />
                  
                  {/* Pulsanti di azione */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => modificaContesto(contesto)}
                      className="p-2 text-gray-500 hover:text-blue-600 bg-white rounded-lg shadow-sm"
                      title="Modifica"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => eliminaContesto(contesto.id)}
                      className="p-2 text-gray-500 hover:text-red-600 bg-white rounded-lg shadow-sm"
                      title="Elimina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Metadati aggiuntivi */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-500">
                    {contesto.id_task && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>Task: {getTaskNome(contesto.id_task).slice(0, 30)}...</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Aggiornato il {new Date(contesto.data_ultimo_aggiornamento).toLocaleDateString('it-IT')}
                      </span>
                    </div>
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
