'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Settings, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Eye,
  BarChart3,
  Zap,
  Globe,
  Monitor,
  RefreshCw
} from 'lucide-react';
import { AgentManager, Agent, AgentTask, AgentLog } from '../lib/agentManager';

interface SupervisioneAgentiProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupervisioneAgenti({ isOpen, onClose }: SupervisioneAgentiProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'logs' | 'config'>('overview');
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Form states
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentType, setNewAgentType] = useState<Agent['type']>('chatgpt_agent');
  const [newAgentDescription, setNewAgentDescription] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskType, setNewTaskType] = useState<AgentTask['type']>('web_research');
  const [newTaskPriority, setNewTaskPriority] = useState<AgentTask['priority']>('medium');

  useEffect(() => {
    if (isOpen) {
      loadAgents();
      // Auto-refresh ogni 5 secondi
      const interval = setInterval(loadAgents, 5000);
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isOpen]);

  const loadAgents = () => {
    const allAgents = AgentManager.getAllAgents();
    setAgents(allAgents);
    
    // Aggiorna agente selezionato se esiste
    if (selectedAgent) {
      const updated = allAgents.find(a => a.id === selectedAgent.id);
      if (updated) {
        setSelectedAgent(updated);
      }
    }
  };

  const handleCreateAgent = () => {
    if (!newAgentName.trim()) return;

    const capabilities = getCapabilitiesByType(newAgentType);
    const agent = AgentManager.createAgent(
      newAgentName,
      newAgentType,
      newAgentDescription,
      capabilities
    );

    setAgents(prev => [...prev, agent]);
    setNewAgentName('');
    setNewAgentDescription('');
    setShowCreateAgent(false);
  };

  const handleCreateTask = () => {
    if (!selectedAgent || !newTaskTitle.trim()) return;

    const task = AgentManager.createTask(
      selectedAgent.id,
      newTaskTitle,
      newTaskDescription,
      newTaskType,
      newTaskPriority
    );

    setNewTaskTitle('');
    setNewTaskDescription('');
    setShowCreateTask(false);
    loadAgents(); // Refresh per aggiornare i task
  };

  const handleStartTask = (taskId: string) => {
    AgentManager.startTask(taskId);
    loadAgents();
  };

  const handlePauseTask = (taskId: string) => {
    AgentManager.pauseTask(taskId);
    loadAgents();
  };

  const handleStopTask = (taskId: string) => {
    AgentManager.stopTask(taskId);
    loadAgents();
  };

  const getCapabilitiesByType = (type: Agent['type']): string[] => {
    switch (type) {
      case 'chatgpt_agent':
        return ['Conversazione', 'Analisi testo', 'Generazione contenuti', 'Ricerca web'];
      case 'agent_comet':
        return ['Automazione web', 'Data scraping', 'Form filling', 'Monitoring'];
      case 'genspark':
        return ['Ricerca avanzata', 'Analisi dati', 'Report generation', 'Insights'];
      case 'custom':
        return ['Personalizzabile', 'Multi-task', 'Integrazione API'];
      default:
        return [];
    }
  };

  const getStatusColor = (status: Agent['status'] | AgentTask['status']) => {
    switch (status) {
      case 'idle': return 'text-gray-500 bg-gray-100';
      case 'running': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'error': case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Agent['status'] | AgentTask['status']) => {
    switch (status) {
      case 'idle': return <Clock className="w-4 h-4" />;
      case 'running': return <Activity className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'error': case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const renderAgentOverview = () => {
    if (!selectedAgent) return null;

    const tasks = AgentManager.getAgentTasks(selectedAgent.id);
    const runningTasks = tasks.filter(t => t.status === 'running');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const recentLogs = AgentManager.getAgentLogs(selectedAgent.id, 5);

    return (
      <div className="space-y-6">
        {/* Statistiche rapide */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Task Totali</p>
                <p className="text-2xl font-bold text-blue-900">{selectedAgent.totalTasks}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Tasso Successo</p>
                <p className="text-2xl font-bold text-green-900">{selectedAgent.successRate.toFixed(0)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Tempo Medio</p>
                <p className="text-2xl font-bold text-purple-900">{selectedAgent.averageTaskTime.toFixed(0)}m</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">In Esecuzione</p>
                <p className="text-2xl font-bold text-orange-900">{runningTasks.length}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Task corrente */}
        {selectedAgent.currentTask && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Task in Esecuzione
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{selectedAgent.currentTask.title}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAgent.currentTask.status)}`}>
                  {selectedAgent.currentTask.status}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${selectedAgent.currentTask.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{selectedAgent.currentTask.progress}% completato</p>
            </div>
          </div>
        )}

        {/* Log recenti */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Monitor className="w-5 h-5 mr-2 text-gray-600" />
            Log Recenti
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 text-sm">
                <span className="text-gray-400 text-xs mt-1">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  log.level === 'error' ? 'bg-red-100 text-red-800' :
                  log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  log.level === 'success' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {log.level}
                </span>
                <span className="text-gray-700 flex-1">{log.message}</span>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <p className="text-gray-500 text-sm">Nessun log disponibile</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAgentTasks = () => {
    if (!selectedAgent) return null;

    const tasks = AgentManager.getAgentTasks(selectedAgent.id);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Task dell'Agente</h3>
          <button
            onClick={() => setShowCreateTask(true)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Task
          </button>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`p-1 rounded ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                  </span>
                  <div>
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleStartTask(task.id)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded"
                      title="Avvia"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  {task.status === 'running' && (
                    <>
                      <button
                        onClick={() => handlePauseTask(task.id)}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded"
                        title="Pausa"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStopTask(task.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                        title="Ferma"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {task.status === 'running' && (
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progresso</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Tipo: {task.type}</span>
                <span>Priorità: {task.priority}</span>
                {task.duration && <span>Durata: {task.duration}m</span>}
              </div>

              {task.steps.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Passi:</p>
                  <div className="space-y-1">
                    {task.steps.slice(-3).map((step) => (
                      <div key={step.id} className="flex items-center space-x-2 text-sm">
                        <span className={`p-1 rounded ${getStatusColor(step.status)}`}>
                          {getStatusIcon(step.status)}
                        </span>
                        <span className="text-gray-700">{step.title}</span>
                        <span className="text-gray-400 text-xs">
                          {step.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nessun task configurato per questo agente</p>
              <button
                onClick={() => setShowCreateTask(true)}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Crea il primo task
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Sidebar agenti */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Bot className="w-6 h-6 mr-2 text-blue-600" />
                Agenti Autonomi
              </h2>
              <button
                onClick={() => setShowCreateAgent(true)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                title="Nuovo Agente"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{agents.length} agenti</span>
              <button
                onClick={loadAgents}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Aggiorna"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedAgent?.id === agent.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{agent.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{agent.type}</span>
                  <span>{agent.totalTasks} task</span>
                </div>
              </div>
            ))}

            {agents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nessun agente configurato</p>
                <button
                  onClick={() => setShowCreateAgent(true)}
                  className="mt-2 text-blue-600 hover:text-blue-700"
                >
                  Crea il primo agente
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contenuto principale */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              {selectedAgent ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedAgent.name}</h3>
                  <p className="text-sm text-gray-600">{selectedAgent.description}</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Seleziona un Agente</h3>
                  <p className="text-sm text-gray-600">Scegli un agente dalla lista per visualizzare i dettagli</p>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {selectedAgent && (
            <>
              {/* Tab navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-4">
                  {[
                    { id: 'overview', label: 'Panoramica', icon: Eye },
                    { id: 'tasks', label: 'Task', icon: Activity },
                    { id: 'logs', label: 'Log', icon: Monitor },
                    { id: 'config', label: 'Configurazione', icon: Settings }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'overview' && renderAgentOverview()}
                {activeTab === 'tasks' && renderAgentTasks()}
                {activeTab === 'logs' && (
                  <div className="text-center py-8 text-gray-500">
                    <Monitor className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Visualizzazione log in sviluppo</p>
                  </div>
                )}
                {activeTab === 'config' && (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Configurazione agente in sviluppo</p>
                  </div>
                )}
              </div>
            </>
          )}

          {!selectedAgent && (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Seleziona un agente per iniziare</p>
                <p className="text-sm">Visualizza dettagli, task e configurazioni</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crea Agente */}
      {showCreateAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Crea Nuovo Agente</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="es. Assistente Marketing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={newAgentType}
                    onChange={(e) => setNewAgentType(e.target.value as Agent['type'])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="chatgpt_agent">ChatGPT Agent</option>
                    <option value="agent_comet">Agent Comet</option>
                    <option value="genspark">Genspark</option>
                    <option value="custom">Personalizzato</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                  <textarea
                    value={newAgentDescription}
                    onChange={(e) => setNewAgentDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Descrivi le funzionalità dell'agente..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateAgent(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateAgent}
                  disabled={!newAgentName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Crea Agente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crea Task */}
      {showCreateTask && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Crea Task per {selectedAgent.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="es. Ricerca competitor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as AgentTask['type'])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="web_research">Ricerca Web</option>
                    <option value="data_collection">Raccolta Dati</option>
                    <option value="automation">Automazione</option>
                    <option value="monitoring">Monitoraggio</option>
                    <option value="analysis">Analisi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorità</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as AgentTask['priority'])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Bassa</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                  <textarea
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Descrivi cosa deve fare l'agente..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateTask(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTaskTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Crea Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
