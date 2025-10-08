'use client'

import React, { useState, useEffect } from 'react';
import { X, Bell, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { NotificationManager, Notification } from '../lib/notificationSystem';

interface CentroNotificheProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CentroNotifiche({ isOpen, onClose }: CentroNotificheProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'app' | 'agenti' | 'performance' | 'sistema'>('all');

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = () => {
    const allNotifications = NotificationManager.getNotifications();
    setNotifications(allNotifications);
  };

  const markAsRead = (id: string) => {
    NotificationManager.markAsRead(id);
    loadNotifications();
  };

  const markAllAsRead = () => {
    NotificationManager.markAllAsRead();
    loadNotifications();
  };

  const deleteNotification = (id: string) => {
    NotificationManager.deleteNotification(id);
    loadNotifications();
  };

  const clearAll = () => {
    NotificationManager.clearAll();
    loadNotifications();
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;
    
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter !== 'all') {
      filtered = filtered.filter(n => n.category === filter);
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
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
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  if (!isOpen) return null;

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Centro Notifiche</h3>
              <p className="text-sm text-gray-500">
                {unreadCount > 0 ? `${unreadCount} non lette` : 'Tutte lette'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Segna tutte come lette
              </button>
            )}
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Cancella tutto
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filtri */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Tutte' },
              { key: 'unread', label: 'Non lette' },
              { key: 'app', label: 'App' },
              { key: 'agenti', label: 'Agenti' },
              { key: 'performance', label: 'Performance' },
              { key: 'sistema', label: 'Sistema' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista Notifiche */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nessuna notifica trovata</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-l-4 rounded-lg p-4 transition-all ${
                    getPriorityColor(notification.priority)
                  } ${!notification.read ? 'shadow-md' : 'opacity-75'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getIconForType(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {notification.priority}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                              {notification.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Segna come letta
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-600 hover:text-red-800 ml-2"
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
