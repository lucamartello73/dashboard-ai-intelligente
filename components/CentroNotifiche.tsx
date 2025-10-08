'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  X, 
  Check, 
  Trash2, 
  Filter,
  Search,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  Activity,
  Star,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone
} from 'lucide-react';
import { NotificationManager, Notification, NotificationSettings } from '../lib/notificationSystem';

interface CentroNotificheProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CentroNotifiche({ isOpen, onClose }: CentroNotificheProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(NotificationManager.getDefaultSettings());
  const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'urgent'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadSettings();
    }
  }, [isOpen]);

  useEffect(() => {
    // Listener per aggiornamenti real-time
    const handleNotificationUpdate = (updatedNotifications: Notification[]) => {
      setNotifications(updatedNotifications);
    };

    NotificationManager.addListener(handleNotificationUpdate);
    return () => NotificationManager.removeListener(handleNotificationUpdate);
  }, []);

  const loadNotifications = () => {
    const allNotifications = NotificationManager.getNotifications();
    setNotifications(allNotifications);
  };

  const loadSettings = () => {
    const currentSettings = NotificationManager.getSettings();
    setSettings(currentSettings);
  };

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    NotificationManager.saveSettings(newSettings);
  };

  const markAsRead = (notificationId: string) => {
    NotificationManager.markAsRead(notificationId);
    loadNotifications();
  };

  const markAllAsRead = () => {
    NotificationManager.markAllAsRead();
    loadNotifications();
  };

  const deleteNotification = (notificationId: string) => {
    NotificationManager.deleteNotification(notificationId);
    loadNotifications();
  };

  const clearAll = () => {
    NotificationManager.clearAll();
    loadNotifications();
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Filtro per stato
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(n => !n.read);
        break;
      case 'high':
        filtered = filtered.filter(n => n.priority === 'high');
        break;
      case 'urgent':
        filtered = filtered.filter(n => n.priority === 'urgent');
        break;
    }

    // Filtro per categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }

    // Filtro per ricerca
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getNotificationIcon = (notification: Notification) => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'agent':
        return <Activity className="w-5 h-5 text-blue-500" />;
      case 'performance':
        return <Star className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const renderNotifications = () => {
    const filteredNotifications = getFilteredNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
      <div className="space-y-4">
        {/* Header con statistiche */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifiche ({filteredNotifications.length})
            </h3>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                {unreadCount} non lette
              </span>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Segna tutte come lette
              </button>
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Cancella tutto
            </button>
          </div>
        </div>

        {/* Filtri */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca notifiche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Tutte le categorie</option>
              <option value="app">App</option>
              <option value="agent">Agenti</option>
              <option value="performance">Performance</option>
              <option value="system">Sistema</option>
              <option value="recommendation">Suggerimenti</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {[
              { id: 'all', label: 'Tutte' },
              { id: 'unread', label: 'Non lette' },
              { id: 'high', label: 'Alta priorità' },
              { id: 'urgent', label: 'Urgenti' }
            ].map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filter === filterOption.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista notifiche */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-l-4 p-4 rounded-lg ${getPriorityColor(notification.priority)} ${
                !notification.read ? 'ring-2 ring-blue-200' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getNotificationIcon(notification)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {notification.timestamp.toLocaleString()}
                      </span>
                      <span className="capitalize">{notification.category}</span>
                      <span className="capitalize">{notification.priority}</span>
                    </div>
                      <a
                        className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                      </a>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 text-gray-400 hover:text-green-600"
                      title="Segna come letta"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Elimina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nessuna notifica trovata</p>
              <p className="text-sm">Le notifiche appariranno qui quando disponibili</p>
            </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Impostazioni Notifiche</h3>

        {/* Abilitazione generale */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Abilita Notifiche</h4>
              <p className="text-sm text-gray-600">Ricevi notifiche dall'applicazione</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => saveSettings({ ...settings, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Categorie */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Categorie</h4>
          {Object.entries(settings.categories).map(([category, enabled]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 capitalize">{category}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => saveSettings({
                    ...settings,
                    categories: { ...settings.categories, [category]: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>

        {/* Priorità */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Priorità</h4>
          {Object.entries(settings.priority).map(([priority, enabled]) => (
            <div key={priority} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 capitalize">{priority}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => saveSettings({
                    ...settings,
                    priority: { ...settings.priority, [priority]: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>

        {/* Modalità di consegna */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Modalità di Consegna</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Notifiche Browser</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.delivery.browser}
                  onChange={(e) => saveSettings({
                    ...settings,
                    delivery: { ...settings.delivery, browser: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {settings.delivery.sound ? (
                  <Volume2 className="w-4 h-4 text-gray-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Suoni</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.delivery.sound}
                  onChange={(e) => saveSettings({
                    ...settings,
                    delivery: { ...settings.delivery, sound: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Notifiche Desktop</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.delivery.desktop}
                  onChange={(e) => saveSettings({
                    ...settings,
                    delivery: { ...settings.delivery, desktop: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Frequenza */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Frequenza</h4>
          <select
            value={settings.frequency}
            onChange={(e) => saveSettings({ ...settings, frequency: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="immediate">Immediata</option>
            <option value="hourly">Ogni ora</option>
            <option value="daily">Giornaliera</option>
            <option value="weekly">Settimanale</option>
          </select>
        </div>

        {/* Ore di silenzio */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Ore di Silenzio</h4>
              <p className="text-sm text-gray-600">Non ricevere notifiche durante queste ore</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.quietHours.enabled}
                onChange={(e) => saveSettings({
                  ...settings,
                  quietHours: { ...settings.quietHours, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inizio</label>
                <input
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => saveSettings({
                    ...settings,
                    quietHours: { ...settings.quietHours, start: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fine</label>
                <input
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => saveSettings({
                    ...settings,
                    quietHours: { ...settings.quietHours, end: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Centro Notifiche</h2>
              {NotificationManager.getUnreadCount() > 0 && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                  {NotificationManager.getUnreadCount()}
                </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'notifications', label: 'Notifiche', icon: Bell },
              { id: 'settings', label: 'Impostazioni', icon: Settings }
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
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
}
