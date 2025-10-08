// Sistema di gestione configurazione computer

export interface Computer {
  id: string;
  nome: string;
  sistemaOperativo: 'Windows 11' | 'macOS' | 'Linux';
  numeroSchermi: number;
  livelloPotenza: 'base' | 'standard' | 'potente' | 'workstation';
  specifiche: {
    cpu?: string;
    ram?: string;
    gpu?: string;
    storage?: string;
  };
  configurazione: {
    risoluzione?: string;
    disposizioneSchermi?: string;
    note?: string;
  };
  utilizzoPreferito: string[];
  attivo: boolean;
  ultimoUtilizzo?: Date;
}

export interface ComputerRecommendation {
  computerId: string;
  nomeComputer: string;
  motivazione: string;
  vantaggi: string[];
  configurazioneSuggerita: string;
  score: number;
}

export class ComputerManager {
  private static readonly STORAGE_KEY = 'computer_configuration';

  static getDefaultComputers(): Computer[] {
    return [
      {
        id: 'computer-1',
        nome: 'Workstation Principale',
        sistemaOperativo: 'Windows 11',
        numeroSchermi: 4,
        livelloPotenza: 'potente',
        specifiche: {
          cpu: 'Non specificato',
          ram: 'Non specificato',
          gpu: 'Non specificato',
          storage: 'Non specificato'
        },
        configurazione: {
          risoluzione: 'Multi-monitor 4K',
          disposizioneSchermi: '2x2 grid',
          note: 'Setup ideale per multitasking intensivo'
        },
        utilizzoPreferito: ['sviluppo', 'design', 'analisi dati', 'video editing'],
        attivo: true
      },
      {
        id: 'computer-2',
        nome: 'Computer Secondario',
        sistemaOperativo: 'Windows 11',
        numeroSchermi: 3,
        livelloPotenza: 'standard',
        specifiche: {
          cpu: 'Non specificato',
          ram: 'Non specificato',
          gpu: 'Non specificato',
          storage: 'Non specificato'
        },
        configurazione: {
          risoluzione: 'Triple monitor setup',
          disposizioneSchermi: 'Orizzontale esteso',
          note: 'Buono per produttività e multitasking'
        },
        utilizzoPreferito: ['ufficio', 'ricerca', 'comunicazione', 'gestione progetti'],
        attivo: true
      },
      {
        id: 'computer-3',
        nome: 'Computer Portatile',
        sistemaOperativo: 'Windows 11',
        numeroSchermi: 1,
        livelloPotenza: 'base',
        specifiche: {
          cpu: 'Non specificato',
          ram: 'Non specificato',
          gpu: 'Non specificato',
          storage: 'Non specificato'
        },
        configurazione: {
          risoluzione: 'Single screen',
          disposizioneSchermi: 'Monitor singolo',
          note: 'Ideale per mobilità e task semplici'
        },
        utilizzoPreferito: ['scrittura', 'email', 'navigazione', 'presentazioni'],
        attivo: true
      }
    ];
  }

  static getComputers(): Computer[] {
    if (typeof window === 'undefined') return this.getDefaultComputers();
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        const defaultComputers = this.getDefaultComputers();
        this.saveComputers(defaultComputers);
        return defaultComputers;
      }
      
      const computers = JSON.parse(stored);
      return computers.map((c: any) => ({
        ...c,
        ultimoUtilizzo: c.ultimoUtilizzo ? new Date(c.ultimoUtilizzo) : undefined
      }));
    } catch {
      return this.getDefaultComputers();
    }
  }

  static saveComputers(computers: Computer[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(computers));
    } catch (error) {
      console.warn('Errore salvataggio configurazione computer:', error);
    }
  }

  static addComputer(computer: Omit<Computer, 'id'>): void {
    const computers = this.getComputers();
    const newComputer: Computer = {
      ...computer,
      id: `computer-${Date.now()}`
    };
    
    computers.push(newComputer);
    this.saveComputers(computers);
  }

  static updateComputer(id: string, updates: Partial<Computer>): void {
    const computers = this.getComputers();
    const index = computers.findIndex(c => c.id === id);
    
    if (index !== -1) {
      computers[index] = { ...computers[index], ...updates };
      this.saveComputers(computers);
    }
  }

  static deleteComputer(id: string): void {
    const computers = this.getComputers().filter(c => c.id !== id);
    this.saveComputers(computers);
  }

  static getComputerById(id: string): Computer | null {
    return this.getComputers().find(c => c.id === id) || null;
  }

  static getActiveComputers(): Computer[] {
    return this.getComputers().filter(c => c.attivo);
  }

  static markAsUsed(computerId: string): void {
    this.updateComputer(computerId, { ultimoUtilizzo: new Date() });
  }

  static getRecommendationForTask(taskType: string, taskDescription: string): ComputerRecommendation[] {
    const computers = this.getActiveComputers();
    const recommendations: ComputerRecommendation[] = [];

    computers.forEach(computer => {
      const score = this.calculateRecommendationScore(computer, taskType, taskDescription);
      const recommendation = this.generateRecommendation(computer, taskType, taskDescription, score);
      recommendations.push(recommendation);
    });

    // Ordina per score decrescente
    return recommendations.sort((a, b) => b.score - a.score);
  }

  private static calculateRecommendationScore(computer: Computer, taskType: string, taskDescription: string): number {
    let score = 0;

    // Punteggio base per potenza
    switch (computer.livelloPotenza) {
      case 'workstation': score += 40; break;
      case 'potente': score += 35; break;
      case 'standard': score += 25; break;
      case 'base': score += 15; break;
    }

    // Punteggio per numero di schermi
    score += computer.numeroSchermi * 8;

    // Punteggio per utilizzo preferito
    if (computer.utilizzoPreferito.some(uso => 
      taskType.toLowerCase().includes(uso) || 
      taskDescription.toLowerCase().includes(uso)
    )) {
      score += 20;
    }

    // Bonus per task specifici
    if (taskType === 'sviluppo' || taskDescription.includes('codice')) {
      if (computer.numeroSchermi >= 3) score += 15;
      if (computer.livelloPotenza === 'potente') score += 10;
    }

    if (taskType === 'design' || taskDescription.includes('grafica')) {
      if (computer.numeroSchermi >= 2) score += 12;
      if (computer.livelloPotenza === 'potente') score += 15;
    }

    if (taskType === 'analisi' || taskDescription.includes('dati')) {
      if (computer.numeroSchermi >= 3) score += 10;
      if (computer.livelloPotenza === 'potente') score += 12;
    }

    if (taskType === 'scrittura' || taskDescription.includes('documento')) {
      if (computer.numeroSchermi === 1) score += 5; // Meno distrazioni
    }

    return Math.min(score, 100); // Cap a 100
  }

  private static generateRecommendation(
    computer: Computer, 
    taskType: string, 
    taskDescription: string, 
    score: number
  ): ComputerRecommendation {
    const vantaggi: string[] = [];
    let configurazioneSuggerita = '';
    let motivazione = '';

    // Genera vantaggi specifici
    if (computer.numeroSchermi >= 4) {
      vantaggi.push('Multitasking estremo con 4+ schermi');
      configurazioneSuggerita = 'Usa tutti gli schermi per massimizzare la produttività';
    } else if (computer.numeroSchermi >= 3) {
      vantaggi.push('Ottimo multitasking con 3 schermi');
      configurazioneSuggerita = 'Schermo principale per il task, laterali per riferimenti';
    } else if (computer.numeroSchermi >= 2) {
      vantaggi.push('Dual monitor per efficienza');
      configurazioneSuggerita = 'Schermo principale + schermo di supporto';
    } else {
      vantaggi.push('Focus concentrato su singolo schermo');
      configurazioneSuggerita = 'Minimizza distrazioni, massimizza concentrazione';
    }

    if (computer.livelloPotenza === 'potente') {
      vantaggi.push('Potenza di calcolo elevata');
      vantaggi.push('Gestione fluida di applicazioni pesanti');
    }

    // Genera motivazione
    if (score >= 80) {
      motivazione = `${computer.nome} è la scelta ideale per questo task`;
    } else if (score >= 60) {
      motivazione = `${computer.nome} è una buona opzione per questo task`;
    } else if (score >= 40) {
      motivazione = `${computer.nome} può gestire questo task adeguatamente`;
    } else {
      motivazione = `${computer.nome} è utilizzabile ma non ottimale per questo task`;
    }

    return {
      computerId: computer.id,
      nomeComputer: computer.nome,
      motivazione,
      vantaggi,
      configurazioneSuggerita,
      score
    };
  }

  static getUsageStats(): {
    totalComputers: number;
    activeComputers: number;
    mostUsedComputer: Computer | null;
    averageScreens: number;
  } {
    const computers = this.getComputers();
    const activeComputers = computers.filter(c => c.attivo);
    
    const mostUsedComputer = computers
      .filter(c => c.ultimoUtilizzo)
      .sort((a, b) => (b.ultimoUtilizzo?.getTime() || 0) - (a.ultimoUtilizzo?.getTime() || 0))[0] || null;

    const averageScreens = activeComputers.length > 0 
      ? activeComputers.reduce((sum, c) => sum + c.numeroSchermi, 0) / activeComputers.length 
      : 0;

    return {
      totalComputers: computers.length,
      activeComputers: activeComputers.length,
      mostUsedComputer,
      averageScreens: Math.round(averageScreens * 10) / 10
    };
  }
}
