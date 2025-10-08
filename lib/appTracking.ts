// Sistema di tracking avanzato per app utilizzate
export interface AppUsage {
  id: string;
  appName: string;
  taskType: string;
  projectId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minuti
  rating?: number; // 1-5 stelle
  notes?: string;
  success: boolean;
  difficulty: 'facile' | 'medio' | 'difficile';
  satisfaction: number; // 1-5
  wouldUseAgain: boolean;
}

export interface AppPerformance {
  appName: string;
  taskType: string;
  totalUsages: number;
  averageRating: number;
  averageDuration: number;
  successRate: number;
  averageSatisfaction: number;
  recommendationScore: number;
  lastUsed: Date;
  trends: {
    week: number;
    month: number;
    quarter: number;
  };
}

export interface TaskAnalytics {
  taskType: string;
  totalProjects: number;
  bestPerformingApps: AppPerformance[];
  averageCompletionTime: number;
  successRate: number;
  mostUsedApps: string[];
  recommendations: string[];
}

export class AppTrackingManager {
  private static STORAGE_KEY = 'app_tracking_data';
  
  // Salva utilizzo app
  static saveAppUsage(usage: AppUsage): void {
    const data = this.getTrackingData();
    data.usages.push(usage);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }
  
  // Inizia tracking di una sessione
  static startTracking(appName: string, taskType: string, projectId: string): string {
    const usage: AppUsage = {
      id: Date.now().toString(),
      appName,
      taskType,
      projectId,
      startTime: new Date(),
      success: false,
      difficulty: 'medio',
      satisfaction: 3,
      wouldUseAgain: true
    };
    
    this.saveAppUsage(usage);
    return usage.id;
  }
  
  // Termina tracking di una sessione
  static endTracking(
    usageId: string, 
    rating: number, 
    notes: string, 
    success: boolean,
    difficulty: 'facile' | 'medio' | 'difficile',
    satisfaction: number,
    wouldUseAgain: boolean
  ): void {
    const data = this.getTrackingData();
    const usage = data.usages.find(u => u.id === usageId);
    
    if (usage) {
      usage.endTime = new Date();
      usage.duration = Math.round((usage.endTime.getTime() - usage.startTime.getTime()) / (1000 * 60));
      usage.rating = rating;
      usage.notes = notes;
      usage.success = success;
      usage.difficulty = difficulty;
      usage.satisfaction = satisfaction;
      usage.wouldUseAgain = wouldUseAgain;
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }
  }
  
  // Ottieni performance di un'app per tipo di task
  static getAppPerformance(appName: string, taskType?: string): AppPerformance | null {
    const data = this.getTrackingData();
    let usages = data.usages.filter(u => u.appName === appName && u.endTime);
    
    if (taskType) {
      usages = usages.filter(u => u.taskType === taskType);
    }
    
    if (usages.length === 0) return null;
    
    const totalUsages = usages.length;
    const averageRating = usages.reduce((sum, u) => sum + (u.rating || 0), 0) / totalUsages;
    const averageDuration = usages.reduce((sum, u) => sum + (u.duration || 0), 0) / totalUsages;
    const successRate = (usages.filter(u => u.success).length / totalUsages) * 100;
    const averageSatisfaction = usages.reduce((sum, u) => sum + u.satisfaction, 0) / totalUsages;
    const wouldUseAgainRate = (usages.filter(u => u.wouldUseAgain).length / totalUsages) * 100;
    
    // Calcola recommendation score basato su rating, successo, soddisfazione
    const recommendationScore = (averageRating * 0.3 + (successRate / 20) + averageSatisfaction * 0.3 + (wouldUseAgainRate / 20)) / 4 * 5;
    
    return {
      appName,
      taskType: taskType || 'tutti',
      totalUsages,
      averageRating,
      averageDuration,
      successRate,
      averageSatisfaction,
      recommendationScore,
      lastUsed: new Date(Math.max(...usages.map(u => u.endTime!.getTime()))),
      trends: this.calculateTrends(usages)
    };
  }
  
  // Ottieni analytics per tipo di task
  static getTaskAnalytics(taskType: string): TaskAnalytics {
    const data = this.getTrackingData();
    const taskUsages = data.usages.filter(u => u.taskType === taskType && u.endTime);
    
    const appNames = [...new Set(taskUsages.map(u => u.appName))];
    const bestPerformingApps = appNames
      .map(app => this.getAppPerformance(app, taskType))
      .filter(Boolean)
      .sort((a, b) => b!.recommendationScore - a!.recommendationScore)
      .slice(0, 5) as AppPerformance[];
    
    const totalProjects = new Set(taskUsages.map(u => u.projectId)).size;
    const averageCompletionTime = taskUsages.reduce((sum, u) => sum + (u.duration || 0), 0) / taskUsages.length;
    const successRate = (taskUsages.filter(u => u.success).length / taskUsages.length) * 100;
    
    const appUsageCount = appNames.map(app => ({
      app,
      count: taskUsages.filter(u => u.appName === app).length
    })).sort((a, b) => b.count - a.count);
    
    const mostUsedApps = appUsageCount.slice(0, 3).map(item => item.app);
    
    const recommendations = this.generateRecommendations(bestPerformingApps, taskType);
    
    return {
      taskType,
      totalProjects,
      bestPerformingApps,
      averageCompletionTime,
      successRate,
      mostUsedApps,
      recommendations
    };
  }
  
  // Ottieni suggerimenti intelligenti per un tipo di task
  static getIntelligentSuggestions(taskType: string): string[] {
    const analytics = this.getTaskAnalytics(taskType);
    const suggestions: string[] = [];
    
    if (analytics.bestPerformingApps.length > 0) {
      const bestApp = analytics.bestPerformingApps[0];
      suggestions.push(`🏆 ${bestApp.appName} è la tua app più performante per ${taskType} (${bestApp.recommendationScore.toFixed(1)}/5)`);
      
      if (bestApp.averageDuration < 30) {
        suggestions.push(`⚡ ${bestApp.appName} ti fa completare ${taskType} in media in ${bestApp.averageDuration.toFixed(0)} minuti`);
      }
      
      if (bestApp.successRate > 80) {
        suggestions.push(`✅ ${bestApp.appName} ha un tasso di successo del ${bestApp.successRate.toFixed(0)}% per ${taskType}`);
      }
    }
    
    if (analytics.successRate < 70) {
      suggestions.push(`⚠️ Il tuo tasso di successo per ${taskType} è del ${analytics.successRate.toFixed(0)}%. Considera di provare nuove app o strategie.`);
    }
    
    return suggestions;
  }
  
  // Calcola trends
  private static calculateTrends(usages: AppUsage[]): { week: number; month: number; quarter: number } {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    
    return {
      week: usages.filter(u => u.endTime! >= weekAgo).length,
      month: usages.filter(u => u.endTime! >= monthAgo).length,
      quarter: usages.filter(u => u.endTime! >= quarterAgo).length
    };
  }
  
  // Genera raccomandazioni
  private static generateRecommendations(apps: AppPerformance[], taskType: string): string[] {
    const recommendations: string[] = [];
    
    if (apps.length === 0) {
      recommendations.push(`Inizia a tracciare l'uso delle app per ${taskType} per ricevere suggerimenti personalizzati`);
      return recommendations;
    }
    
    const bestApp = apps[0];
    recommendations.push(`Per ${taskType}, usa ${bestApp.appName} (performance: ${bestApp.recommendationScore.toFixed(1)}/5)`);
    
    if (apps.length > 1) {
      const secondBest = apps[1];
      recommendations.push(`Come alternativa, considera ${secondBest.appName} (performance: ${secondBest.recommendationScore.toFixed(1)}/5)`);
    }
    
    const fastestApp = apps.reduce((fastest, current) => 
      current.averageDuration < fastest.averageDuration ? current : fastest
    );
    
    if (fastestApp.averageDuration < bestApp.averageDuration) {
      recommendations.push(`Per velocità, ${fastestApp.appName} completa ${taskType} in ${fastestApp.averageDuration.toFixed(0)} min`);
    }
    
    return recommendations;
  }
  
  // Ottieni tutti i dati di tracking
  static getTrackingData(): { usages: AppUsage[] } {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Converti le date da string a Date objects
      data.usages = data.usages.map((usage: any) => ({
        ...usage,
        startTime: new Date(usage.startTime),
        endTime: usage.endTime ? new Date(usage.endTime) : undefined
      }));
      return data;
    }
    return { usages: [] };
  }
  
  // Ottieni statistiche generali
  static getGeneralStats(): {
    totalProjects: number;
    totalHours: number;
    mostUsedApp: string;
    bestRatedApp: string;
    averageRating: number;
    successRate: number;
  } {
    const data = this.getTrackingData();
    const completedUsages = data.usages.filter(u => u.endTime);
    
    if (completedUsages.length === 0) {
      return {
        totalProjects: 0,
        totalHours: 0,
        mostUsedApp: 'Nessuno',
        bestRatedApp: 'Nessuno',
        averageRating: 0,
        successRate: 0
      };
    }
    
    const totalProjects = new Set(completedUsages.map(u => u.projectId)).size;
    const totalHours = completedUsages.reduce((sum, u) => sum + (u.duration || 0), 0) / 60;
    
    const appUsageCount = completedUsages.reduce((acc, u) => {
      acc[u.appName] = (acc[u.appName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedApp = Object.entries(appUsageCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nessuno';
    
    const appRatings = completedUsages.reduce((acc, u) => {
      if (!acc[u.appName]) acc[u.appName] = [];
      if (u.rating) acc[u.appName].push(u.rating);
      return acc;
    }, {} as Record<string, number[]>);
    
    const appAverageRatings = Object.entries(appRatings).map(([app, ratings]) => ({
      app,
      avgRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    }));
    
    const bestRatedApp = appAverageRatings
      .sort((a, b) => b.avgRating - a.avgRating)[0]?.app || 'Nessuno';
    
    const averageRating = completedUsages
      .filter(u => u.rating)
      .reduce((sum, u) => sum + u.rating!, 0) / completedUsages.filter(u => u.rating).length;
    
    const successRate = (completedUsages.filter(u => u.success).length / completedUsages.length) * 100;
    
    return {
      totalProjects,
      totalHours,
      mostUsedApp,
      bestRatedApp,
      averageRating: averageRating || 0,
      successRate
    };
  }
  
  // Esporta dati per backup
  static exportData(): string {
    return JSON.stringify(this.getTrackingData(), null, 2);
  }
  
  // Importa dati da backup
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }
}
