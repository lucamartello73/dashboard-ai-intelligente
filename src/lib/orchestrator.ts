import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { supabaseAdmin } from './supabase'
import { SpazioAI, Computer } from '@/types/database'

export class OrchestratoreAI {
  
  /**
   * Analizza una richiesta dell'utente e suggerisce il miglior approccio
   */
  async analizzaRichiesta(richiesta: string) {
    try {
      // Recupera spazi AI e computer disponibili
      const [spaziAI, computer] = await Promise.all([
        this.getSpazi(),
        this.getComputer()
      ])

      const prompt = `
Sei l'orchestratore AI di una dashboard intelligente. Analizza questa richiesta dell'utente e suggerisci il miglior approccio.

RICHIESTA UTENTE: "${richiesta}"

SPAZI AI DISPONIBILI:
${spaziAI.map(s => `- ${s.nome_spazio} (${s.piattaforma}): ${s.descrizione} - Keywords: ${s.contesto_utilizzo.join(', ')}`).join('\n')}

COMPUTER DISPONIBILI:
${computer.map(c => `- ${c.nome_computer} (${c.numero_schermi} schermi): ${c.descrizione_ruolo}`).join('\n')}

Rispondi in formato JSON con questa struttura:
{
  "tipo_task": "analisi|creativo|marketing|automazione|ricerca",
  "spazio_ai_suggerito": "id_spazio_ai o null",
  "computer_suggerito": "id_computer o null", 
  "prompt_ottimizzato": "prompt da usare nello spazio AI",
  "motivazione": "perché hai scelto questo approccio",
  "passi_successivi": ["passo 1", "passo 2", "..."]
}
`

      const result = await generateText({
        model: openai('gpt-4'),
        prompt,
        temperature: 0.3
      })

      return JSON.parse(result.text)
    } catch (error) {
      console.error('Errore orchestratore:', error)
      return {
        tipo_task: 'generico',
        spazio_ai_suggerito: null,
        computer_suggerito: null,
        prompt_ottimizzato: richiesta,
        motivazione: 'Errore nell\'analisi, procedo con approccio generico',
        passi_successivi: ['Esegui il task manualmente']
      }
    }
  }

  /**
   * Genera un "passaporto del contesto" per trasferire una conversazione
   */
  async generaPassaportoContesto(conversazione: any[], obiettivo: string) {
    try {
      const prompt = `
Analizza questa conversazione e crea un "passaporto del contesto" ottimizzato per trasferire la memoria a un'altra AI.

CONVERSAZIONE:
${conversazione.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')}

OBIETTIVO DEL TRASFERIMENTO: ${obiettivo}

Crea un prompt di sistema che:
1. Riassuma i punti chiave della conversazione
2. Mantenga le informazioni cruciali
3. Dia istruzioni chiare per continuare il lavoro
4. Sia ottimizzato per l'AI di destinazione

Rispondi solo con il prompt di sistema, senza spiegazioni aggiuntive.
`

      const result = await generateText({
        model: openai('gpt-4'),
        prompt,
        temperature: 0.2
      })

      return result.text
    } catch (error) {
      console.error('Errore generazione passaporto:', error)
      return `Continua questa conversazione: ${conversazione.map(m => m.content).join(' ')}`
    }
  }

  private async getSpazi(): Promise<SpazioAI[]> {
    const { data, error } = await supabaseAdmin
      .from('Spazi_AI')
      .select('*')
    
    if (error) {
      console.error('Errore recupero spazi AI:', error)
      return []
    }
    
    return data || []
  }

  private async getComputer(): Promise<Computer[]> {
    const { data, error } = await supabaseAdmin
      .from('Computer')
      .select('*')
    
    if (error) {
      console.error('Errore recupero computer:', error)
      return []
    }
    
    return data || []
  }
}
