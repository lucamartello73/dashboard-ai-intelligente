import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { richiesta, userProfile } = await request.json()

    if (!richiesta || !richiesta.trim()) {
      return NextResponse.json(
        { error: 'Richiesta mancante' },
        { status: 400 }
      )
    }

    // Analisi personalizzata basata sul profilo utente
    const suggerimento = analizzaRichiestaPersonalizzata(richiesta, userProfile)

    return NextResponse.json(suggerimento)
  } catch (error) {
    console.error('Errore API orchestrator:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

function analizzaRichiestaPersonalizzata(richiesta: string, userProfile?: any) {
  const lower = richiesta.toLowerCase()
  
  // Determina il tipo di task
  let tipo_task = 'generico'
  let spazio_ai_suggerito = getPreferredAI(userProfile, 'generico') || 'ChatGPT-4 - Versatile per progetti generali'
  let computer_suggerito = getComputerRecommendation(tipo_task, richiesta)
  let motivazione = getUserSpecificMotivation(userProfile, 'generico') || 'Approccio generale per progetti versatili'
  let passi_successivi = [
    'Definire obiettivi specifici',
    'Creare piano di lavoro',
    'Identificare risorse necessarie',
    'Iniziare implementazione'
  ]

  if (lower.includes('marketing') || lower.includes('campagna') || lower.includes('pubblicità')) {
    tipo_task = 'marketing'
    spazio_ai_suggerito = getPreferredAI(userProfile, 'marketing') || 'Claude (Anthropic) - Ottimo per strategie marketing'
    computer_suggerito = getComputerRecommendation('marketing', richiesta)
    motivazione = getUserSpecificMotivation(userProfile, 'marketing') || 'Un progetto di marketing richiede creatività e strategia. Claude eccelle nella creazione di contenuti persuasivi e piani marketing strutturati.'
    passi_successivi = [
      'Analizzare target audience e mercato',
      'Definire key messaging e value proposition',
      'Scegliere canali di comunicazione ottimali',
      'Creare calendario editoriale dettagliato',
      'Impostare metriche di performance (KPI)'
    ]
  } else if (lower.includes('analisi') || lower.includes('dati') || lower.includes('report')) {
    tipo_task = 'analisi'
    spazio_ai_suggerito = getPreferredAI(userProfile, 'analisi') || 'ChatGPT-4 - Eccellente per analisi dati'
    computer_suggerito = getComputerRecommendation('analisi', richiesta)
    motivazione = getUserSpecificMotivation(userProfile, 'analisi') || 'L\'analisi dati richiede precisione e capacità di elaborazione. Il computer con più schermi ti permetterà di visualizzare dataset, grafici e documentazione simultaneamente.'
    passi_successivi = [
      'Definire domande di ricerca specifiche',
      'Identificare e raccogliere fonti dati',
      'Pulire e preparare i dataset',
      'Applicare metodologie di analisi appropriate',
      'Creare visualizzazioni e report finali'
    ]
  } else if (lower.includes('sviluppo') || lower.includes('app') || lower.includes('sito') || lower.includes('codice')) {
    tipo_task = 'sviluppo'
    spazio_ai_suggerito = getPreferredAI(userProfile, 'sviluppo') || 'GitHub Copilot - Specializzato in programmazione'
    computer_suggerito = getComputerRecommendation('sviluppo', richiesta)
    motivazione = getUserSpecificMotivation(userProfile, 'sviluppo') || 'I progetti di sviluppo beneficiano di assistenza specializzata nel coding. Il setup multi-monitor è ideale per IDE, browser di test, documentazione e terminal.'
    passi_successivi = [
      'Definire requisiti tecnici e funzionali',
      'Scegliere stack tecnologico appropriato',
      'Progettare architettura del sistema',
      'Impostare ambiente di sviluppo',
      'Implementare con approccio iterativo'
    ]
  } else if (lower.includes('contenuto') || lower.includes('articolo') || lower.includes('blog') || lower.includes('scrittura')) {
    tipo_task = 'creativo'
    spazio_ai_suggerito = getPreferredAI(userProfile, 'creativo') || 'Claude (Anthropic) - Eccellente per contenuti creativi'
    computer_suggerito = getComputerRecommendation('creativo', richiesta)
    motivazione = getUserSpecificMotivation(userProfile, 'creativo') || 'La creazione di contenuti richiede creatività e padronanza linguistica. Un ambiente con meno distrazioni può favorire la concentrazione nella scrittura.'
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


// Funzioni helper per personalizzazione
function getPreferredAI(userProfile: any, tipoTask: string): string | null {
  if (!userProfile || !userProfile.preferences || !userProfile.preferences.aiPreferito) {
    return null
  }
  
  const preferredAI = userProfile.preferences.aiPreferito[tipoTask]
  if (!preferredAI) return null
  
  // Controlla se l'utente ha effettivamente questo AI configurato e attivo
  const hasActiveAI = userProfile.aiTools?.some((tool: any) => 
    tool.nome === preferredAI && tool.attivo
  )
  
  if (hasActiveAI) {
    return `${preferredAI} - Il tuo AI preferito per ${tipoTask}`
  }
  
  return preferredAI
}

function getUserSpecificMotivation(userProfile: any, tipoTask: string): string | null {
  if (!userProfile || !userProfile.cronologia) {
    return null
  }
  
  // Analizza la cronologia per progetti simili
  const progettiSimili = userProfile.cronologia.filter((item: any) => 
    item.tipoTask === tipoTask && item.suggerimentoSeguito && (item.valutazione || 0) >= 4
  )
  
  if (progettiSimili.length > 0) {
    const aiUsatiConSuccesso = progettiSimili
      .map((item: any) => item.aiUsato)
      .filter((ai: string) => ai)
    
    if (aiUsatiConSuccesso.length > 0) {
      const aiPiuUsato = aiUsatiConSuccesso.reduce((acc: any, ai: string) => {
        acc[ai] = (acc[ai] || 0) + 1
        return acc
      }, {})
      
      const aiMigliore = Object.entries(aiPiuUsato).sort(([,a], [,b]) => (b as number) - (a as number))[0][0]
      
      return `Basandomi sui tuoi progetti precedenti di ${tipoTask}, ${aiMigliore} ha dato ottimi risultati. Hai completato con successo ${progettiSimili.length} progetti simili.`
    }
  }
  
  return null
}

function getPersonalizedSteps(userProfile: any, tipoTask: string, defaultSteps: string[]): string[] {
  if (!userProfile || !userProfile.cronologia) {
    return defaultSteps
  }
  
  // Analizza i progetti completati con successo per suggerire passi personalizzati
  const progettiRiusciti = userProfile.cronologia.filter((item: any) => 
    item.tipoTask === tipoTask && item.suggerimentoSeguito && (item.valutazione || 0) >= 4
  )
  
  if (progettiRiusciti.length >= 2) {
    // Aggiungi un passo personalizzato basato sull'esperienza
    const personalizedSteps = [...defaultSteps]
    personalizedSteps.unshift(`Rivedi i tuoi ${progettiRiusciti.length} progetti di ${tipoTask} completati con successo per identificare pattern vincenti`)
    return personalizedSteps
  }
  
  return defaultSteps
}

function addLearningInsights(userProfile: any, tipoTask: string): string {
  if (!userProfile || !userProfile.cronologia) {
    return ''
  }
  
  const cronologiaTipo = userProfile.cronologia.filter((item: any) => item.tipoTask === tipoTask)
  
  if (cronologiaTipo.length === 0) {
    return '\n\n💡 **Primo progetto di questo tipo**: Prendi nota dei risultati per migliorare i futuri suggerimenti!'
  }
  
  const mediaValutazione = cronologiaTipo.reduce((sum: number, item: any) => sum + (item.valutazione || 0), 0) / cronologiaTipo.length
  const tassoSuccesso = cronologiaTipo.filter((item: any) => item.suggerimentoSeguito).length / cronologiaTipo.length * 100
  
  let insights = `\n\n📊 **I tuoi dati per progetti ${tipoTask}**:\n`
  insights += `- Progetti completati: ${cronologiaTipo.length}\n`
  insights += `- Valutazione media: ${mediaValutazione.toFixed(1)}/5\n`
  insights += `- Tasso di successo: ${tassoSuccesso.toFixed(0)}%\n`
  
  if (mediaValutazione >= 4) {
    insights += `\n🎯 **Ottimo lavoro!** I tuoi progetti ${tipoTask} hanno performance eccellenti.`
  } else if (mediaValutazione >= 3) {
    insights += `\n💪 **Buon progresso!** Continua a sperimentare per migliorare ulteriormente.`
  } else {
    insights += `\n🔄 **Opportunità di crescita**: Prova a essere più specifico nelle richieste per ottenere suggerimenti migliori.`
  }
  
  return insights
}

function getComputerRecommendation(taskType: string, taskDescription: string): string {
  // Simulazione della logica di raccomandazione computer
  // In un'implementazione reale, questo dovrebbe interfacciarsi con ComputerManager
  
  const taskLower = taskDescription.toLowerCase()
  
  // Computer 1: Workstation Principale (4 schermi, più potente)
  // Computer 2: Computer Secondario (3 schermi, standard)  
  // Computer 3: Computer Portatile (1 schermo, base)
  
  if (taskType === 'sviluppo' || taskLower.includes('codice') || taskLower.includes('programmazione')) {
    return 'Workstation Principale (4 schermi) - Ideale per sviluppo con IDE, browser, documentazione e terminal su schermi separati'
  }
  
  if (taskType === 'analisi' || taskLower.includes('dati') || taskLower.includes('grafici')) {
    return 'Workstation Principale (4 schermi) - Perfetto per visualizzare dataset, grafici, dashboard e documentazione simultaneamente'
  }
  
  if (taskType === 'design' || taskLower.includes('grafica') || taskLower.includes('creatività')) {
    return 'Computer Secondario (3 schermi) - Ottimo per design con software principale, riferimenti e palette colori'
  }
  
  if (taskType === 'marketing' || taskLower.includes('campagna') || taskLower.includes('social')) {
    return 'Computer Secondario (3 schermi) - Ideale per gestire contenuti, social media e analytics'
  }
  
  if (taskType === 'creativo' || taskLower.includes('scrittura') || taskLower.includes('articolo')) {
    return 'Computer Portatile (1 schermo) - Perfetto per concentrarsi sulla scrittura senza distrazioni'
  }
  
  if (taskLower.includes('presentazione') || taskLower.includes('meeting')) {
    return 'Computer Portatile (1 schermo) - Ideale per mobilità e presentazioni'
  }
  
  if (taskLower.includes('ricerca') || taskLower.includes('studio')) {
    return 'Computer Secondario (3 schermi) - Ottimo per ricerca con browser, note e documenti aperti'
  }
  
  // Default per task generici
  return 'Computer Secondario (3 schermi) - Configurazione bilanciata per la maggior parte dei task'
}
