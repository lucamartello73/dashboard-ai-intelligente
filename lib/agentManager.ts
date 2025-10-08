// Sistema di gestione e supervisione agenti autonomi
export interface Agent {
  id: string;
  name: string;
  type: 'chatgpt_agent' | 'agent_comet' | 'genspark' | 'custom';
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  description: string;
  capabilities: string[];
  currentTask?: AgentTask;
  lastActivity: Date;
  totalTasks: number;
  successRate: number;
  averageTaskTime: number; // in minuti
  config: AgentConfig;
  logs: AgentLog[];
}

export interface AgentTask {
  id: string;
  agentId: string;
  title: string;
  description: string;
  type: 'web_research' | 'data_collection' | 'automation' | 'monitoring' | 'analysis';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  progress: number; // 0-100
  result?: any;
  error?: string;
  steps: TaskStep[];
  notifications: boolean;
}

export interface TaskStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: Date;
  details?: string;
  url?: string;
  screenshot?: string;
}

export interface AgentConfig {
  autoStart: boolean;
  maxConcurrentTasks: number;
  timeout: number; // in minuti
  retryAttempts: number;
  notifications: {
    onStart: boolean;
    onComplete: boolean;
    onError: boolean;
    onProgress: boolean;
  };
  webAccess: {
    allowedDomains: string[];
    blockedDomains: string[];
    useProxy: boolean;
    respectRobots: boolean;
  };
  dataCollection: {
    saveScreenshots: boolean;
    savePageContent: boolean;
    maxFileSize: number; // in MB
  };
}

export interface AgentLog {
  id: string;
  agentId: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: any;
  taskId?: string;
}

export interface AgentMetrics {
  agentId: string;
  period: 'day' | 'week' | 'month';
  tasksCompleted: number;
  tasksSuccessful: number;
  averageTaskTime: number;
  totalUptime: number;
  errorRate: number;
  performanceScore: number;
  trends: {
    tasksPerDay: number[];
    successRateHistory: number[];
    performanceHistory: number[];
  };
}

export class AgentManager {
  private static STORAGE_KEY = 'agent_manager_data';
  private static activePolling: { [agentId: string]: NodeJS.Timeout } = {};

  // Crea nuovo agente
  static createAgent(
    name: string,
    type: Agent['type'],
    description: string,
    capabilities: string[]
  ): Agent {
    const agent: Agent = {
      id: Date.now().toString(),
      name,
      type,
      status: 'idle',
      description,
      capabilities,
      lastActivity: new Date(),
      totalTasks: 0,
      successRate: 0,
      averageTaskTime: 0,
      config: this.getDefaultConfig(),
      logs: []
    };

    this.saveAgent(agent);
    this.addLog(agent.id, 'info', `Agente ${name} creato con successo`);
    return agent;
  }

  // Configura agente
  static updateAgentConfig(agentId: string, config: Partial<AgentConfig>): void {
    const agent = this.getAgent(agentId);
    if (agent) {
      agent.config = { ...agent.config, ...config };
      this.saveAgent(agent);
      this.addLog(agentId, 'info', 'Configurazione agente aggiornata');
    }
  }

  // Crea nuovo task
  static createTask(
    agentId: string,
    title: string,
    description: string,
    type: AgentTask['type'],
    priority: AgentTask['priority'] = 'medium'
  ): AgentTask {
    const task: AgentTask = {
      id: Date.now().toString(),
      agentId,
      title,
      description,
      type,
      priority,
      status: 'pending',
      progress: 0,
      steps: [],
      notifications: true
    };

    this.saveTask(task);
    this.addLog(agentId, 'info', `Nuovo task creato: ${title}`);
    
    // Auto-start se configurato
    const agent = this.getAgent(agentId);
    if (agent?.config.autoStart) {
      this.startTask(task.id);
    }

    return task;
  }

  // Avvia task
  static startTask(taskId: string): boolean {
    const task = this.getTask(taskId);
    if (!task) return false;

    const agent = this.getAgent(task.agentId);
    if (!agent) return false;

    // Controlla se l'agente può eseguire il task
    if (agent.status === 'running' && agent.config.maxConcurrentTasks <= 1) {
      this.addLog(agent.id, 'warning', `Impossibile avviare task ${task.title}: agente occupato`);
      return false;
    }

    task.status = 'running';
    task.startTime = new Date();
    task.progress = 0;
    
    agent.status = 'running';
    agent.currentTask = task;
    agent.lastActivity = new Date();

    this.saveTask(task);
    this.saveAgent(agent);
    
    this.addLog(agent.id, 'success', `Task avviato: ${task.title}`);
    this.addTaskStep(taskId, 'Task avviato', 'running');

    // Simula esecuzione task (in un'app reale, qui ci sarebbe l'integrazione con gli agenti)
    this.simulateTaskExecution(taskId);

    return true;
  }

  // Pausa task
  static pauseTask(taskId: string): boolean {
    const task = this.getTask(taskId);
    if (!task || task.status !== 'running') return false;

    task.status = 'pending';
    const agent = this.getAgent(task.agentId);
    if (agent) {
      agent.status = 'paused';
      this.saveAgent(agent);
    }

    this.saveTask(task);
    this.addLog(task.agentId, 'info', `Task messo in pausa: ${task.title}`);
    
    // Ferma polling se attivo
    if (this.activePolling[task.agentId]) {
      clearInterval(this.activePolling[task.agentId]);
      delete this.activePolling[task.agentId];
    }

    return true;
  }

  // Ferma task
  static stopTask(taskId: string): boolean {
    const task = this.getTask(taskId);
    if (!task) return false;

    task.status = 'cancelled';
    task.endTime = new Date();
    if (task.startTime) {
      task.duration = Math.round((task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60));
    }

    const agent = this.getAgent(task.agentId);
    if (agent) {
      agent.status = 'idle';
      agent.currentTask = undefined;
      this.saveAgent(agent);
    }

    this.saveTask(task);
    this.addLog(task.agentId, 'warning', `Task fermato: ${task.title}`);
    this.addTaskStep(taskId, 'Task fermato dall\'utente', 'failed');

    // Ferma polling se attivo
    if (this.activePolling[task.agentId]) {
      clearInterval(this.activePolling[task.agentId]);
      delete this.activePolling[task.agentId];
    }

    return true;
  }

  // Simula esecuzione task (da sostituire con integrazione reale)
  private static simulateTaskExecution(taskId: string): void {
    const task = this.getTask(taskId);
    if (!task) return;

    const steps = [
      'Inizializzazione agente',
      'Navigazione web',
      'Raccolta dati',
      'Elaborazione informazioni',
      'Completamento task'
    ];

    let currentStep = 0;
    const stepInterval = 2000; // 2 secondi per step

    const executeStep = () => {
      if (currentStep < steps.length) {
        const stepTitle = steps[currentStep];
        this.addTaskStep(taskId, stepTitle, 'running');
        
        task.progress = Math.round(((currentStep + 1) / steps.length) * 100);
        this.saveTask(task);

        setTimeout(() => {
          this.updateTaskStep(taskId, stepTitle, 'completed');
          currentStep++;
          
          if (currentStep < steps.length) {
            executeStep();
          } else {
            this.completeTask(taskId, { data: 'Task completato con successo' });
          }
        }, stepInterval);
      }
    };

    executeStep();
  }

  // Completa task
  private static completeTask(taskId: string, result: any): void {
    const task = this.getTask(taskId);
    if (!task) return;

    task.status = 'completed';
    task.endTime = new Date();
    task.progress = 100;
    task.result = result;
    
    if (task.startTime) {
      task.duration = Math.round((task.endTime.getTime() - task.startTime.getTime()) / (1000 * 60));
    }

    const agent = this.getAgent(task.agentId);
    if (agent) {
      agent.status = 'idle';
      agent.currentTask = undefined;
      agent.totalTasks++;
      agent.lastActivity = new Date();
      
      // Aggiorna metriche
      this.updateAgentMetrics(agent.id);
      this.saveAgent(agent);
    }

    this.saveTask(task);
    this.addLog(task.agentId, 'success', `Task completato: ${task.title}`);
  }

  // Aggiunge step al task
  static addTaskStep(taskId: string, title: string, status: TaskStep['status'], details?: string): void {
    const task = this.getTask(taskId);
    if (!task) return;

    const step: TaskStep = {
      id: Date.now().toString(),
      title,
      status,
      timestamp: new Date(),
      details
    };

    task.steps.push(step);
    this.saveTask(task);
  }

  // Aggiorna step del task
  static updateTaskStep(taskId: string, stepTitle: string, status: TaskStep['status']): void {
    const task = this.getTask(taskId);
    if (!task) return;

    const step = task.steps.find(s => s.title === stepTitle);
    if (step) {
      step.status = status;
      step.timestamp = new Date();
      this.saveTask(task);
    }
  }

  // Aggiunge log
  static addLog(agentId: string, level: AgentLog['level'], message: string, details?: any, taskId?: string): void {
    const log: AgentLog = {
      id: Date.now().toString(),
      agentId,
      timestamp: new Date(),
      level,
      message,
      details,
      taskId
    };

    const data = this.getData();
    data.logs.push(log);
    
    // Mantieni solo gli ultimi 1000 log
    if (data.logs.length > 1000) {
      data.logs = data.logs.slice(-1000);
    }
    
    this.saveData(data);
  }

  // Ottieni agente
  static getAgent(agentId: string): Agent | null {
    const data = this.getData();
    return data.agents.find(a => a.id === agentId) || null;
  }

  // Ottieni tutti gli agenti
  static getAllAgents(): Agent[] {
    return this.getData().agents;
  }

  // Ottieni task
  static getTask(taskId: string): AgentTask | null {
    const data = this.getData();
    return data.tasks.find(t => t.id === taskId) || null;
  }

  // Ottieni task per agente
  static getAgentTasks(agentId: string): AgentTask[] {
    return this.getData().tasks.filter(t => t.agentId === agentId);
  }

  // Ottieni log per agente
  static getAgentLogs(agentId: string, limit: number = 100): AgentLog[] {
    return this.getData().logs
      .filter(l => l.agentId === agentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Aggiorna metriche agente
  private static updateAgentMetrics(agentId: string): void {
    const agent = this.getAgent(agentId);
    if (!agent) return;

    const tasks = this.getAgentTasks(agentId).filter(t => t.status === 'completed');
    const successfulTasks = tasks.filter(t => t.status === 'completed' && !t.error);
    
    agent.successRate = tasks.length > 0 ? (successfulTasks.length / tasks.length) * 100 : 0;
    
    const totalTime = tasks.reduce((sum, t) => sum + (t.duration || 0), 0);
    agent.averageTaskTime = tasks.length > 0 ? totalTime / tasks.length : 0;
    
    this.saveAgent(agent);
  }

  // Ottieni metriche agente
  static getAgentMetrics(agentId: string, period: 'day' | 'week' | 'month'): AgentMetrics {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error('Agente non trovato');
    }

    const now = new Date();
    const periodStart = new Date();
    
    switch (period) {
      case 'day':
        periodStart.setDate(now.getDate() - 1);
        break;
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
    }

    const tasks = this.getAgentTasks(agentId).filter(t => 
      t.startTime && t.startTime >= periodStart
    );

    const completedTasks = tasks.filter(t => t.status === 'completed');
    const successfulTasks = completedTasks.filter(t => !t.error);

    return {
      agentId,
      period,
      tasksCompleted: completedTasks.length,
      tasksSuccessful: successfulTasks.length,
      averageTaskTime: agent.averageTaskTime,
      totalUptime: this.calculateUptime(agentId, periodStart),
      errorRate: completedTasks.length > 0 ? ((completedTasks.length - successfulTasks.length) / completedTasks.length) * 100 : 0,
      performanceScore: this.calculatePerformanceScore(agent),
      trends: this.calculateTrends(agentId, period)
    };
  }

  // Calcola uptime
  private static calculateUptime(agentId: string, since: Date): number {
    const logs = this.getAgentLogs(agentId, 1000);
    const activeLogs = logs.filter(l => l.timestamp >= since && l.level !== 'error');
    return activeLogs.length * 5; // Stima: 5 minuti per log attivo
  }

  // Calcola performance score
  private static calculatePerformanceScore(agent: Agent): number {
    const successWeight = 0.4;
    const speedWeight = 0.3;
    const reliabilityWeight = 0.3;

    const successScore = agent.successRate;
    const speedScore = agent.averageTaskTime > 0 ? Math.max(0, 100 - agent.averageTaskTime) : 50;
    const reliabilityScore = Math.max(0, 100 - (agent.logs.filter(l => l.level === 'error').length * 10));

    return (successScore * successWeight + speedScore * speedWeight + reliabilityScore * reliabilityWeight);
  }

  // Calcola trends
  private static calculateTrends(agentId: string, period: 'day' | 'week' | 'month'): AgentMetrics['trends'] {
    // Implementazione semplificata - in un'app reale, calcolerebbe trends storici
    return {
      tasksPerDay: [2, 3, 1, 4, 2, 3, 2],
      successRateHistory: [85, 90, 88, 92, 89, 91, 93],
      performanceHistory: [75, 78, 80, 82, 79, 83, 85]
    };
  }

  // Configurazione di default
  private static getDefaultConfig(): AgentConfig {
    return {
      autoStart: false,
      maxConcurrentTasks: 1,
      timeout: 30,
      retryAttempts: 3,
      notifications: {
        onStart: true,
        onComplete: true,
        onError: true,
        onProgress: false
      },
      webAccess: {
        allowedDomains: [],
        blockedDomains: [],
        useProxy: false,
        respectRobots: true
      },
      dataCollection: {
        saveScreenshots: true,
        savePageContent: true,
        maxFileSize: 10
      }
    };
  }

  // Salva agente
  private static saveAgent(agent: Agent): void {
    const data = this.getData();
    const index = data.agents.findIndex(a => a.id === agent.id);
    if (index >= 0) {
      data.agents[index] = agent;
    } else {
      data.agents.push(agent);
    }
    this.saveData(data);
  }

  // Salva task
  private static saveTask(task: AgentTask): void {
    const data = this.getData();
    const index = data.tasks.findIndex(t => t.id === task.id);
    if (index >= 0) {
      data.tasks[index] = task;
    } else {
      data.tasks.push(task);
    }
    this.saveData(data);
  }

  // Ottieni dati
  private static getData(): { agents: Agent[]; tasks: AgentTask[]; logs: AgentLog[] } {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Converti date da string a Date objects
      data.agents = data.agents.map((agent: any) => ({
        ...agent,
        lastActivity: new Date(agent.lastActivity)
      }));
      data.tasks = data.tasks.map((task: any) => ({
        ...task,
        startTime: task.startTime ? new Date(task.startTime) : undefined,
        endTime: task.endTime ? new Date(task.endTime) : undefined,
        steps: task.steps.map((step: any) => ({
          ...step,
          timestamp: new Date(step.timestamp)
        }))
      }));
      data.logs = data.logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
      return data;
    }
    return { agents: [], tasks: [], logs: [] };
  }

  // Salva dati
  private static saveData(data: { agents: Agent[]; tasks: AgentTask[]; logs: AgentLog[] }): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  // Esporta dati
  static exportData(): string {
    return JSON.stringify(this.getData(), null, 2);
  }

  // Importa dati
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.saveData(data);
      return true;
    } catch {
      return false;
    }
  }
}
