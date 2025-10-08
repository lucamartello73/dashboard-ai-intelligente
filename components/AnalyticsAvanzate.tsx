'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Zap,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Star,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { AppTrackingManager, AppPerformance, TaskAnalytics } from '../lib/appTracking';
import { AgentManager } from '../lib/agentManager';

interface AnalyticsAvanzateProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalyticsAvanzate({ isOpen, onClose }: AnalyticsAvanzateProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'apps' | 'tasks' | 'agents' | 'trends'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('all');
  const [generalStats, setGeneralStats] = useState<any>(null);
  const [taskTypes, setTaskTypes] = useState<string[]>([]);
  const [appPerformances, setAppPerformances] = useState<AppPerformance[]>([]);
  const [taskAnalytics, setTaskAnalytics] = useState<{ [key: string]: TaskAnalytics }>({});

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen, timeRange, selectedTaskType]);

  const loadAnalytics = () => {
    // Carica statistiche generali
    const stats = AppTrackingManager.getGeneralStats();
    setGeneralStats(stats);

    // Carica tipi di task unici
    const trackingData = AppTrackingManager.getTrackingData();
    const uniqueTaskTypes = [...new Set(trackingData.usages.map(u => u.taskType))];
    setTaskTypes(uniqueTaskTypes);

    // Carica performance delle app
    const apps = [...new Set(trackingData.usages.map(u => u.appName))];
    const performances = apps
      .map(app => AppTrackingManager.getAppPerformance(app))
      .filter(Boolean) as AppPerformance[];
    setAppPerformances(performances.sort((a, b) => b.recommendationScore - a.recommendationScore));

    // Carica analytics per tipo di task
    const analytics: { [key: string]: TaskAnalytics } = {};
    uniqueTaskTypes.forEach(taskType => {
      analytics[taskType] = AppTrackingManager.getTaskAnalytics(taskType);
    });
    setTaskAnalytics(analytics);
  };

  const renderOverview = () => {
    if (!generalStats) return null;

    const agents = AgentManager.getAllAgents();
    const activeAgents = agents.filter(a => a.status === 'running').length;
    const totalAgents = agents.length;

    return (
      <div className="space-y-6">
        {/* Metriche principali */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Progetti Totali</p>
                <p className="text-3xl font-bold">{generalStats.totalProjects}</p>
                <p className="text-blue-100 text-xs mt-1">+12% questo mese</p>
              </div>
              <Target className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Tasso Successo</p>
                <p className="text-3xl font-bold">{generalStats.successRate.toFixed(0)}%</p>
                <p className="text-green-100 text-xs mt-1">+5% vs scorso mese</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Ore Lavorate</p>
                <p className="text-3xl font-bold">{generalStats.totalHours.toFixed(0)}h</p>
                <p className="text-purple-100 text-xs mt-1">Media: {(generalStats.totalHours / Math.max(generalStats.totalProjects, 1)).toFixed(1)}h/progetto</p>
              </div>
              <Clock className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Agenti Attivi</p>
                <p className="text-3xl font-bold">{activeAgents}/{totalAgents}</p>
                <p className="text-orange-100 text-xs mt-1">Supervisione autonoma</p>
              </div>
              <Activity className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Top performer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              App Più Performante
            </h3>
            {generalStats.bestRatedApp !== 'Nessuno' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{generalStats.bestRatedApp}</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-semibold">{generalStats.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• Rating medio più alto tra tutte le app</p>
                  <p>• Utilizzata in {generalStats.totalProjects} progetti</p>
                  <p>• Tasso di successo: {generalStats.successRate.toFixed(0)}%</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Nessun dato disponibile</p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-500" />
              App Più Utilizzata
            </h3>
            {generalStats.mostUsedApp !== 'Nessuno' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{generalStats.mostUsedApp}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    Top Choice
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• App utilizzata più frequentemente</p>
                  <p>• Preferita per la maggior parte dei task</p>
                  <p>• Tempo medio per progetto: {(generalStats.totalHours / Math.max(generalStats.totalProjects, 1)).toFixed(1)}h</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Nessun dato disponibile</p>
            )}
          </div>
        </div>

        {/* Suggerimenti intelligenti */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="font-semibold text-indigo-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Suggerimenti Intelligenti
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-indigo-800">Ottimizzazioni</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                {generalStats.successRate < 80 && (
                  <li>• Considera di migliorare il processo per aumentare il tasso di successo</li>
                )}
                {generalStats.averageRating < 4 && (
                  <li>• Valuta l'utilizzo di app alternative con rating più alti</li>
                )}
                {generalStats.totalHours / Math.max(generalStats.totalProjects, 1) > 5 && (
                  <li>• Cerca strumenti più efficienti per ridurre il tempo per progetto</li>
                )}
                <li>• Continua a tracciare l'uso delle app per migliorare i suggerimenti</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-indigo-800">Opportunità</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Sperimenta con nuove app per diversificare il toolkit</li>
                <li>• Configura agenti autonomi per task ripetitivi</li>
                <li>• Analizza i pattern di utilizzo per identificare inefficienze</li>
                <li>• Imposta notifiche per monitorare le performance in tempo reale</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAppAnalytics = () => {
    return (
      <div className="space-y-6">
        {/* Filtri */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Performance delle App</h3>
          <div className="flex items-center space-x-3">
            <select
              value={selectedTaskType}
              onChange={(e) => setSelectedTaskType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Tutti i task</option>
              {taskTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <button
              onClick={loadAnalytics}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Aggiorna"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lista app con performance */}
        <div className="space-y-4">
          {appPerformances.map((app, index) => (
            <div key={app.appName} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{app.appName}</h4>
                    <p className="text-sm text-gray-600">
                      {selectedTaskType === 'all' ? 'Tutti i task' : selectedTaskType}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-semibold">{app.recommendationScore.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm ml-1">/5</span>
                  </div>
                  <p className="text-xs text-gray-500">Score complessivo</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{app.totalUsages}</p>
                  <p className="text-xs text-gray-500">Utilizzi</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{app.successRate.toFixed(0)}%</p>
                  <p className="text-xs text-gray-500">Successo</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{app.averageDuration.toFixed(0)}m</p>
                  <p className="text-xs text-gray-500">Tempo medio</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{app.averageRating.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Rating medio</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">{app.averageSatisfaction.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Soddisfazione</p>
                </div>
              </div>

              {/* Trends */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Utilizzi recenti:</span>
                  <div className="flex items-center space-x-4">
                    <span>Settimana: <strong>{app.trends.week}</strong></span>
                    <span>Mese: <strong>{app.trends.month}</strong></span>
                    <span>Trimestre: <strong>{app.trends.quarter}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {appPerformances.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nessun dato di performance disponibile</p>
              <p className="text-sm">Inizia a utilizzare l'app per vedere le analytics</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTaskAnalytics = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Analytics per Tipo di Task</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(taskAnalytics).map(([taskType, analytics]) => (
            <div key={taskType} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 capitalize">{taskType}</h4>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {analytics.totalProjects} progetti
                </span>
              </div>

              <div className="space-y-4">
                {/* Metriche principali */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">{analytics.successRate.toFixed(0)}%</p>
                    <p className="text-xs text-gray-500">Tasso successo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-purple-600">{analytics.averageCompletionTime.toFixed(0)}m</p>
                    <p className="text-xs text-gray-500">Tempo medio</p>
                  </div>
                </div>

                {/* App più performanti */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Top App:</p>
                  <div className="space-y-1">
                    {analytics.bestPerformingApps.slice(0, 3).map((app, index) => (
                      <div key={app.appName} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {index + 1}. {app.appName}
                        </span>
                        <span className="font-medium text-blue-600">
                          {app.recommendationScore.toFixed(1)}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raccomandazioni */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Suggerimenti:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {analytics.recommendations.slice(0, 2).map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(taskAnalytics).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nessun dato di task disponibile</p>
            <p className="text-sm">Completa alcuni progetti per vedere le analytics</p>
          </div>
        )}
      </div>
    );
  };

  const renderAgentAnalytics = () => {
    const agents = AgentManager.getAllAgents();
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Performance Agenti Autonomi</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const tasks = AgentManager.getAgentTasks(agent.id);
            const completedTasks = tasks.filter(t => t.status === 'completed');
            const runningTasks = tasks.filter(t => t.status === 'running');

            return (
              <div key={agent.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    agent.status === 'running' ? 'bg-green-100 text-green-800' :
                    agent.status === 'idle' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600">{agent.totalTasks}</p>
                      <p className="text-xs text-gray-500">Task totali</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{agent.successRate.toFixed(0)}%</p>
                      <p className="text-xs text-gray-500">Successo</p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>• Tipo: {agent.type}</p>
                    <p>• In esecuzione: {runningTasks.length}</p>
                    <p>• Completati: {completedTasks.length}</p>
                    <p>• Tempo medio: {agent.averageTaskTime.toFixed(0)}m</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Ultima attività: {agent.lastActivity.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {agents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nessun agente configurato</p>
            <p className="text-sm">Crea agenti autonomi per vedere le loro performance</p>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                Analytics Avanzate
              </h2>
              <p className="text-gray-600 mt-1">
                Analisi dettagliate delle performance e suggerimenti intelligenti
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="week">Ultima settimana</option>
                <option value="month">Ultimo mese</option>
                <option value="quarter">Ultimo trimestre</option>
              </select>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Panoramica', icon: BarChart3 },
              { id: 'apps', label: 'Performance App', icon: Award },
              { id: 'tasks', label: 'Analytics Task', icon: Target },
              { id: 'agents', label: 'Agenti', icon: Activity },
              { id: 'trends', label: 'Trends', icon: TrendingUp }
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
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'apps' && renderAppAnalytics()}
          {activeTab === 'tasks' && renderTaskAnalytics()}
          {activeTab === 'agents' && renderAgentAnalytics()}
          {activeTab === 'trends' && (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Analisi trends in sviluppo</p>
              <p className="text-sm">Grafici e previsioni saranno disponibili presto</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Ultimo aggiornamento: {new Date().toLocaleString()}</span>
            <div className="flex items-center space-x-4">
              <button className="flex items-center text-blue-600 hover:text-blue-700">
                <Download className="w-4 h-4 mr-1" />
                Esporta Report
              </button>
              <button 
                onClick={loadAnalytics}
                className="flex items-center text-gray-600 hover:text-gray-700"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Aggiorna
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
