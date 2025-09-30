import { NextRequest, NextResponse } from 'next/server'
import { OrchestratoreAI } from '@/lib/orchestrator'

export async function POST(request: NextRequest) {
  try {
    const { richiesta } = await request.json()
    
    if (!richiesta) {
      return NextResponse.json(
        { error: 'Richiesta mancante' },
        { status: 400 }
      )
    }

    const orchestratore = new OrchestratoreAI()
    const risultato = await orchestratore.analizzaRichiesta(richiesta)

    return NextResponse.json(risultato)
  } catch (error) {
    console.error('Errore API orchestratore:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
