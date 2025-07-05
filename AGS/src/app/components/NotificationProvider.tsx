'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary';
  }>;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

function NotificationItem({ notification, onRemove }: { 
  notification: Notification; 
  onRemove: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);

    // Auto remove after duration
    if (notification.duration) {
      const timer = setTimeout(() => {
        setIsRemoving(true);
        setTimeout(() => {
          onRemove(notification.id);
        }, 300);
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.id, onRemove]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const colorClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const progressColorClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible && !isRemoving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`relative max-w-sm w-full ${colorClasses[notification.type]} border rounded-lg shadow-lg p-4 mb-3`}>
        {/* Progress bar for auto-dismiss */}
        {notification.duration && (
          <div
            className={`absolute bottom-0 left-0 h-1 ${progressColorClasses[notification.type]} rounded-b-lg transition-all ease-linear`}
            style={{
              width: isRemoving ? '0%' : '100%',
              transition: `width ${notification.duration}ms linear`,
            }}
          />
        )}

        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-lg">{icons[notification.type]}</span>
          </div>
          
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium">{notification.title}</h3>
            {notification.message && (
              <p className="mt-1 text-sm opacity-90">{notification.message}</p>
            )}
            
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.action();
                      handleRemove();
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                      action.style === 'primary'
                        ? 'bg-white/20 hover:bg-white/30'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleRemove}
            className="flex-shrink-0 ml-3 text-lg hover:opacity-70 transition-opacity duration-200"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationContainer({ notifications, onRemove }: {
  notifications: Notification[];
  onRemove: (id: string) => void;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>,
    document.body
  );
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000, // Default 5 seconds
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll,
    }}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </NotificationContext.Provider>
  );
}
