// Sistema di notifiche semplificato

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'agent' | 'performance';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'app' | 'agent' | 'performance' | 'system' | 'recommendation';
}

export interface NotificationSettings {
  enabled: boolean;
  categories: {
    app: boolean;
    agent: boolean;
    performance: boolean;
    system: boolean;
    recommendation: boolean;
  };
  priority: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
  delivery: {
    browser: boolean;
    sound: boolean;
    desktop: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export class NotificationManager {
  private static readonly STORAGE_KEY = 'dashboard_notifications';
  private static readonly SETTINGS_KEY = 'notification_settings';
  private static listeners: ((notifications: Notification[]) => void)[] = [];

  static getDefaultSettings(): NotificationSettings {
    return {
      enabled: true,
      categories: {
        app: true,
        agent: true,
        performance: true,
        system: true,
        recommendation: true
      },
      priority: {
        low: true,
        medium: true,
        high: true,
        urgent: true
      },
      delivery: {
        browser: true,
        sound: true,
        desktop: false
      },
      frequency: 'immediate',
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };
  }

  static addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    const notifications = this.getNotifications();
    notifications.unshift(newNotification);
    
    // Mantieni solo le ultime 100 notifiche
    if (notifications.length > 100) {
      notifications.splice(100);
    }

    this.saveNotifications(notifications);
    this.notifyListeners(notifications);
  }

  static getNotifications(): Notification[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const notifications = JSON.parse(stored);
      return notifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    } catch {
      return [];
    }
  }

  static getUnreadCount(): number {
    return this.getNotifications().filter(n => !n.read).length;
  }

  static markAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications(notifications);
      this.notifyListeners(notifications);
    }
  }

  static markAllAsRead(): void {
    const notifications = this.getNotifications();
    notifications.forEach(n => n.read = true);
    this.saveNotifications(notifications);
    this.notifyListeners(notifications);
  }

  static deleteNotification(notificationId: string): void {
    const notifications = this.getNotifications().filter(n => n.id !== notificationId);
    this.saveNotifications(notifications);
    this.notifyListeners(notifications);
  }

  static clearAll(): void {
    this.saveNotifications([]);
    this.notifyListeners([]);
  }

  static getSettings(): NotificationSettings {
    if (typeof window === 'undefined') return this.getDefaultSettings();
    
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultSettings();
    } catch {
      return this.getDefaultSettings();
    }
  }

  static saveSettings(settings: NotificationSettings): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Errore salvataggio impostazioni notifiche:', error);
    }
  }

  static addListener(listener: (notifications: Notification[]) => void): void {
    this.listeners.push(listener);
  }

  static removeListener(listener: (notifications: Notification[]) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private static saveNotifications(notifications: Notification[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.warn('Errore salvataggio notifiche:', error);
    }
  }

  private static notifyListeners(notifications: Notification[]): void {
    this.listeners.forEach(listener => {
      try {
        listener(notifications);
      } catch (error) {
        console.warn('Errore notifica listener:', error);
      }
    });
  }
}
