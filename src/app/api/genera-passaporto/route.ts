import { NextRequest, NextResponse } from 'next/server'
import { OrchestratoreAI } from '@/lib/orchestrator'

export async function POST(request: NextRequest) {
  try {
    const { conversazione, obiettivo, titolo } = await request.json()
    
    if (!conversazione || !Array.isArray(conversazione)) {
      return NextResponse.json(
        { error: 'Conversazione mancante o non valida' },
        { status: 400 }
      )
    }

    const orchestratore = new OrchestratoreAI()
    const passaporto = await orchestratore.generaPassaportoContesto(
      conversazione, 
      obiettivo || 'Continua il lavoro'
    )

    // Aggiungi header e footer al passaporto per renderlo più strutturato
    const passaportoCompleto = `== TRASFERIMENTO CONTESTO ==

**Progetto:** ${titolo || 'Conversazione'}
**Obiettivo:** ${obiettivo || 'Continua il lavoro'}

${passaporto}

== FINE CONTESTO ==

Incolla questo testo nella tua AI di destinazione per trasferire tutto il contesto della conversazione precedente.`

    return NextResponse.json({ passaporto: passaportoCompleto })
  } catch (error) {
    console.error('Errore generazione passaporto:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
