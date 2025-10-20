/**
 * 🔔 NOTIFICATION SYSTEM - ECOSYSTIA
 * Système de notifications toast pour feedback utilisateur
 */

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (type: NotificationType, message: string, duration = 5000) => {
    const id = Date.now().toString();
    const notification: Notification = { id, type, message, duration };
    
    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (message: string) => showNotification('success', message);
  const showError = (message: string) => showNotification('error', message);
  const showWarning = (message: string) => showNotification('warning', message);
  const showInfo = (message: string) => showNotification('info', message);

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2" style={{ maxWidth: '400px' }}>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          icon: 'fas fa-check-circle text-emerald-500',
          text: 'text-emerald-800',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'fas fa-exclamation-circle text-red-500',
          text: 'text-red-800',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'fas fa-exclamation-triangle text-yellow-500',
          text: 'text-yellow-800',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'fas fa-info-circle text-blue-500',
          text: 'text-blue-800',
        };
    }
  };

  const styles = getNotificationStyles();

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 transition-all duration-300 ${
        isExiting ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'
      }`}
    >
      <div className="flex items-start">
        <i className={`${styles.icon} text-xl mr-3 mt-0.5`}></i>
        <div className="flex-1">
          <p className={`${styles.text} text-sm font-medium`}>{notification.message}</p>
        </div>
        <button
          onClick={handleRemove}
          className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

