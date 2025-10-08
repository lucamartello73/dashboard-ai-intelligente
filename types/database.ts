export interface Progetto {
  id: string
  nome_progetto: string
  obiettivo_generale: string
  stato: string
  data_creazione: string
}

export interface SpazioAI {
  id: string
  nome_spazio: string
  piattaforma: string
}

export interface ContestoConversazione {
  id: string
  titolo_conversazione: string
  spazio_ai_origine: string
  data_ultimo_aggiornamento: string
}
