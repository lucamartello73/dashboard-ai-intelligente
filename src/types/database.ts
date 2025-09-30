export interface Progetto {
  id: string
  nome_progetto: string
  obiettivo_generale?: string
  stato: 'Da Iniziare' | 'In Corso' | 'In Revisione' | 'Completato' | 'Pausa'
  data_creazione: string
  data_completamento?: string
  valutazione_finale?: number
}

export interface Task {
  id: string
  id_progetto: string
  descrizione_task: string
  stato: 'Da Fare' | 'In Esecuzione' | 'Fatto' | 'Bloccato'
  prompt_usato?: string
  note_feedback?: string
  valutazione_task?: number
  data_creazione: string
}

export interface SpazioAI {
  id: string
  nome_spazio: string
  piattaforma: string
  url_spazio?: string
  descrizione?: string
  contesto_utilizzo: string[]
  data_creazione: string
}

export interface ContestoConversazione {
  id: string
  id_task?: string
  id_spazio_ai?: string
  titolo_conversazione?: string
  riassunto_generato_ai?: string
  conversazione_completa?: any
  data_ultimo_aggiornamento: string
}

export interface Computer {
  id: string
  nome_computer: string
  numero_schermi: number
  descrizione_ruolo?: string
}

export interface Campagna {
  id: string
  id_progetto?: string
  nome_campagna: string
  piattaforma: string
  obiettivi?: string
  budget?: number
  data_inizio?: string
  data_fine?: string
}

export interface AutomazioneN8N {
  id: string
  nome_workflow: string
  descrizione?: string
  trigger_evento?: string
  azioni_workflow?: any
  stato: 'Suggerito' | 'Implementato' | 'Attivo' | 'Disattivato'
  id_workflow_n8n?: string
  tempo_risparmiato_stimato_min?: number
}

export interface SuggerimentoSistema {
  id: string
  id_progetto?: string
  tipo_suggerimento: string
  contenuto_suggerimento: string
  stato: 'Proposto' | 'Accettato' | 'Rifiutato'
  data_creazione: string
}
