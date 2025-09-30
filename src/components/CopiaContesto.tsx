'use client'

import { useState } from 'react'
import { Copy, Check, MessageSquare } from 'lucide-react'

interface CopiaContestoProps {
  conversazione: Array<{role: string, content: string}>
  titolo?: string
  obiettivo?: string
  className?: string
}

export default function CopiaContesto({ 
  conversazione, 
  titolo = "Conversazione", 
  obiettivo = "Continua il lavoro",
  className = ""
}: CopiaContestoProps) {
  const [copiato, setCopiato] = useState(false)
  const [loading, setLoading] = useState(false)

  const generaPassaportoContesto = async () => {
    setLoading(true)
    
    try {
      // Genera il passaporto del contesto
      const response = await fetch('/api/genera-passaporto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversazione, 
          obiettivo,
          titolo 
        })
      })

      if (!response.ok) {
        throw new Error('Errore nella generazione del passaporto')
      }

      const { passaporto } = await response.json()
      
      // Copia negli appunti
      await navigator.clipboard.writeText(passaporto)
      
      setCopiato(true)
      setTimeout(() => setCopiato(false), 3000)
      
    } catch (error) {
      console.error('Errore copia contesto:', error)
      
      // Fallback: crea un passaporto semplice
      const passaportoSemplice = `== TRASFERIMENTO CONTESTO ==

**Progetto:** ${titolo}
**Obiettivo:** ${obiettivo}

**Conversazione Precedente:**
${conversazione.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}

**Istruzioni:**
Continua questa conversazione mantenendo il contesto e le informazioni precedenti. Procedi con ${obiettivo.toLowerCase()}.

== FINE CONTESTO ==`

      await navigator.clipboard.writeText(passaportoSemplice)
      setCopiato(true)
      setTimeout(() => setCopiato(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={generaPassaportoContesto}
      disabled={loading || conversazione.length === 0}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        copiato 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
      } ${className}`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          Generando...
        </>
      ) : copiato ? (
        <>
          <Check className="w-4 h-4" />
          Copiato!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Copia Contesto
        </>
      )}
    </button>
  )
}

// Componente per visualizzare una conversazione salvata
interface ConversazioneSalvataProps {
  id: string
  titolo: string
  conversazione: Array<{role: string, content: string}>
  dataAggiornamento: string
  spazioAI?: string
  onCopiaContesto?: () => void
}

export function ConversazioneSalvata({
  titolo,
  conversazione,
  dataAggiornamento,
  spazioAI
}: Omit<ConversazioneSalvataProps, 'id' | 'onCopiaContesto'>) {
  const [espansa, setEspansa] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{titolo}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>
              {new Date(dataAggiornamento).toLocaleDateString('it-IT')}
            </span>
            {spazioAI && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {spazioAI}
              </span>
            )}
            <span>{conversazione.length} messaggi</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <CopiaContesto 
            conversazione={conversazione}
            titolo={titolo}
            className="text-sm px-3 py-1"
          />
          
          <button
            onClick={() => setEspansa(!espansa)}
            className="p-2 text-gray-500 hover:text-blue-600"
            title={espansa ? "Comprimi" : "Espandi"}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {espansa && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {conversazione.map((messaggio, index) => (
              <div key={index} className={`p-3 rounded-lg ${
                messaggio.role === 'user' 
                  ? 'bg-blue-50 border-l-4 border-blue-400' 
                  : 'bg-gray-50 border-l-4 border-gray-400'
              }`}>
                <div className="text-xs font-medium text-gray-600 mb-1 uppercase">
                  {messaggio.role === 'user' ? 'Utente' : 'AI'}
                </div>
                <div className="text-sm text-gray-900">
                  {messaggio.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
