import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { richiesta } = await request.json()

    if (!richiesta || !richiesta.trim()) {
      return NextResponse.json(
        { error: 'Richiesta mancante' },
        { status: 400 }
      )
    }

    // Analisi semplificata senza dipendenze esterne
    const suggerimento = analizzaRichiestaLocale(richiesta)

    return NextResponse.json(suggerimento)
  } catch (error) {
    console.error('Errore API orchestrator:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

function analizzaRichiestaLocale(richiesta: string) {
  const lower = richiesta.toLowerCase()
  
  // Determina il tipo di task
  let tipo_task = 'generico'
  let spazio_ai_suggerito = 'ChatGPT-4 - Versatile per progetti generali'
  let computer_suggerito = 'Manager Operativo'
  let motivazione = 'Approccio generale per progetti versatili'
  let passi_successivi = [
    'Definire obiettivi specifici',
    'Creare piano di lavoro',
    'Identificare risorse necessarie',
    'Iniziare implementazione'
  ]

  if (lower.includes('marketing') || lower.includes('campagna') || lower.includes('pubblicità')) {
    tipo_task = 'marketing'
    spazio_ai_suggerito = 'Claude (Anthropic) - Ottimo per strategie marketing'
    motivazione = 'Un progetto di marketing richiede creatività e strategia. Claude eccelle nella creazione di contenuti persuasivi e piani marketing strutturati.'
    passi_successivi = [
      'Analizzare target audience e mercato',
      'Definire key messaging e value proposition',
      'Scegliere canali di comunicazione ottimali',
      'Creare calendario editoriale dettagliato',
      'Impostare metriche di performance (KPI)'
    ]
  } else if (lower.includes('analisi') || lower.includes('dati') || lower.includes('report')) {
    tipo_task = 'analisi'
    computer_suggerito = 'Analista Senior'
    motivazione = 'L\'analisi dati richiede precisione e capacità di elaborazione. L\'Analista Senior ha gli strumenti per gestire dataset complessi.'
    passi_successivi = [
      'Definire domande di ricerca specifiche',
      'Identificare e raccogliere fonti dati',
      'Pulire e preparare i dataset',
      'Applicare metodologie di analisi appropriate',
      'Creare visualizzazioni e report finali'
    ]
  } else if (lower.includes('sviluppo') || lower.includes('app') || lower.includes('sito') || lower.includes('codice')) {
    tipo_task = 'sviluppo'
    spazio_ai_suggerito = 'GitHub Copilot - Specializzato in programmazione'
    motivazione = 'I progetti di sviluppo beneficiano di assistenza specializzata nel coding. GitHub Copilot accelera la scrittura di codice di qualità.'
    passi_successivi = [
      'Definire requisiti tecnici e funzionali',
      'Scegliere stack tecnologico appropriato',
      'Progettare architettura del sistema',
      'Impostare ambiente di sviluppo',
      'Implementare con approccio iterativo'
    ]
  } else if (lower.includes('contenuto') || lower.includes('articolo') || lower.includes('blog') || lower.includes('scrittura')) {
    tipo_task = 'creativo'
    spazio_ai_suggerito = 'Claude (Anthropic) - Eccellente per contenuti creativi'
    motivazione = 'La creazione di contenuti richiede creatività e padronanza linguistica. Claude produce testi di alta qualità e coinvolgenti.'
    passi_successivi = [
      'Definire tone of voice e stile',
      'Ricercare argomenti e fonti',
      'Creare outline dettagliato',
      'Scrivere bozza iniziale',
      'Rivedere e ottimizzare per SEO'
    ]
  }

  // Genera prompt ottimizzato
  const prompt_ottimizzato = generaPromptOttimizzato(richiesta, tipo_task)

  return {
    tipo_task,
    spazio_ai_suggerito,
    computer_suggerito,
    prompt_ottimizzato,
    motivazione,
    passi_successivi
  }
}

function generaPromptOttimizzato(richiesta: string, tipo_task: string): string {
  const basePrompt = `# Progetto: ${richiesta}

## Contesto
Questo è un progetto di tipo "${tipo_task}" che richiede un approccio strutturato e metodico.

## Obiettivi Principali
- Definire chiaramente i deliverable finali
- Stabilire timeline realistiche e milestone
- Identificare tutte le risorse necessarie
- Garantire qualità e coerenza del risultato

## Approccio Metodologico`

  switch (tipo_task) {
    case 'marketing':
      return `${basePrompt}
1. **Ricerca di Mercato**: Analisi competitor, target audience, trend
2. **Strategia**: Definizione positioning, messaging, canali
3. **Creazione**: Sviluppo contenuti, creatività, materiali
4. **Lancio**: Implementazione campagna, monitoraggio
5. **Ottimizzazione**: Analisi performance, A/B testing, miglioramenti

## Deliverable Attesi
- Piano marketing strategico
- Materiali creativi (copy, visual, video)
- Calendario editoriale
- Dashboard di monitoraggio KPI
- Report di performance periodici`

    case 'analisi':
      return `${basePrompt}
1. **Definizione Scope**: Domande di ricerca, ipotesi, obiettivi
2. **Raccolta Dati**: Identificazione fonti, estrazione, validazione
3. **Elaborazione**: Pulizia, trasformazione, aggregazione
4. **Analisi**: Applicazione metodologie statistiche/analitiche
5. **Reporting**: Visualizzazioni, insights, raccomandazioni

## Deliverable Attesi
- Dataset puliti e strutturati
- Dashboard interattivi
- Report di analisi dettagliato
- Presentazione executive summary
- Raccomandazioni actionable`

    case 'sviluppo':
      return `${basePrompt}
1. **Requirements**: Analisi funzionale, tecnica, UX/UI
2. **Design**: Architettura sistema, database, API
3. **Sviluppo**: Implementazione iterativa, testing
4. **Deploy**: Configurazione produzione, CI/CD
5. **Manutenzione**: Monitoring, bug fixing, updates

## Deliverable Attesi
- Documentazione tecnica completa
- Codice sorgente versionato
- Applicazione funzionante
- Test suite automatizzati
- Guida utente e deployment`

    case 'creativo':
      return `${basePrompt}
1. **Briefing**: Obiettivi, target, tone of voice, vincoli
2. **Ricerca**: Trend, riferimenti, best practices
3. **Concept**: Ideazione, brainstorming, concept development
4. **Produzione**: Creazione contenuti, revisioni
5. **Finalizzazione**: Ottimizzazione, adattamenti, delivery

## Deliverable Attesi
- Strategia creativa e concept
- Contenuti finali (testi, immagini, video)
- Guidelines di brand/stile
- Varianti per diversi canali
- Piano di distribuzione`

    default:
      return `${basePrompt}
1. **Pianificazione**: Definizione scope, timeline, risorse
2. **Ricerca**: Analisi contesto, best practices, benchmark
3. **Sviluppo**: Implementazione graduale, iterazioni
4. **Validazione**: Testing, feedback, miglioramenti
5. **Consegna**: Finalizzazione, documentazione, handover

## Deliverable Attesi
- Piano di progetto dettagliato
- Risultati intermedi e finali
- Documentazione completa
- Report di lessons learned
- Raccomandazioni future`
  }
}
