'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Types for real-time events
interface RealtimeEvent<T = any> {
  table: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  data: T;
  old_data?: T;
  timestamp: string;
}

interface NotificationEvent {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  userId?: string;
  read: boolean;
}

interface RealtimeContextType {
  isConnected: boolean;
  notifications: NotificationEvent[];
  addNotification: (notification: Omit<NotificationEvent, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  subscribe: <T>(
    table: string,
    filter?: string,
    callback?: (event: RealtimeEvent<T>) => void
  ) => () => void;
  unreadCount: number;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

interface RealtimeProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ 
  children, 
  userId 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [channels, setChannels] = useState<Map<string, RealtimeChannel>>(new Map());

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Add notification
  const addNotification = useCallback((notification: Omit<NotificationEvent, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: NotificationEvent = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only latest 50

    // Auto-remove info notifications after 5 seconds
    if (notification.type === 'info') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    }
  }, []);

  // Mark notification as read
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Subscribe to table changes
  const subscribe = useCallback(
    (table: string, filter?: string, callback?: (event: any) => void) => {
      const channelName = `${table}_${filter || 'all'}`;
      
      // Check if already subscribed
      if (channels.has(channelName)) {
        return () => {}; // Return empty unsubscribe function
      }

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            ...(filter && { filter }),
          },
          (payload: any) => {
            const event = {
              table,
              type: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              data: payload.new,
              old_data: payload.old,
              timestamp: new Date().toISOString(),
            };

            // Call custom callback if provided
            if (callback) {
              callback(event);
            }

            // Add system notifications for certain events
            if (table === 'analyses' && payload.eventType === 'INSERT') {
              addNotification({
                type: 'success',
                title: 'New Analysis Complete',
                message: 'Your soil/leaf analysis has been processed and is ready to view.',
                userId,
              });
            }

            if (table === 'user_feedback' && payload.eventType === 'INSERT') {
              addNotification({
                type: 'info',
                title: 'Feedback Received',
                message: 'Thank you for your feedback. We will review it shortly.',
                userId,
              });
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            console.log(`Subscribed to ${channelName}`);
          } else if (status === 'CLOSED') {
            setIsConnected(false);
            console.log(`Unsubscribed from ${channelName}`);
          }
        });

      // Store channel reference
      setChannels(prev => new Map(prev).set(channelName, channel));

      // Return unsubscribe function
      return () => {
        channel.unsubscribe();
        setChannels(prev => {
          const newChannels = new Map(prev);
          newChannels.delete(channelName);
          return newChannels;
        });
      };
    }, [supabase, channels, addNotification, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      channels.forEach(channel => channel.unsubscribe());
    };
  }, [channels]);

  // Subscribe to user-specific notifications if userId is provided
  useEffect(() => {
    if (!userId) return;

    const unsubscribeAnalyses = subscribe('analyses', `user_id=eq.${userId}`);
    const unsubscribeModules = subscribe('modules'); // Global module changes
    
    return () => {
      unsubscribeAnalyses();
      unsubscribeModules();
    };
  }, [userId, subscribe]);

  // Connection status monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if (channels.size === 0) {
        setIsConnected(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [channels.size]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: RealtimeContextType = {
    isConnected,
    notifications,
    addNotification,
    markNotificationRead,
    clearNotifications,
    subscribe,
    unreadCount,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

// Hook for subscribing to specific table changes
export const useTableSubscription = (
  table: string,
  filter?: string,
  enabled: boolean = true
) => {
  const { subscribe } = useRealtime();
  const [data, setData] = useState<any[]>([]);
  const [lastEvent, setLastEvent] = useState<any | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribe(table, filter, (event) => {
      setData(prev => [event, ...prev].slice(0, 100)); // Keep latest 100 events
      setLastEvent(event);
    });

    return unsubscribe;
  }, [table, filter, enabled, subscribe]);

  return { data, lastEvent };
};

// Hook for real-time notifications
export const useNotifications = () => {
  const { notifications, markNotificationRead, clearNotifications, unreadCount } = useRealtime();

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  const getNotificationsByType = useCallback((type: NotificationEvent['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  return {
    notifications,
    unreadNotifications: getUnreadNotifications(),
    unreadCount,
    markAsRead: markNotificationRead,
    clearAll: clearNotifications,
    getByType: getNotificationsByType,
  };
};

// Connection status indicator component
export const ConnectionStatus: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isConnected } = useRealtime();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
};

// Notification toast component
export const NotificationToast: React.FC<{
  notification: NotificationEvent;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  const iconColors = {
    info: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };

  const bgColors = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`p-4 rounded-lg border ${bgColors[notification.type]} animate-slide-down`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${iconColors[notification.type]}`}>
          {/* You can add icons here based on type */}
          <div className="w-5 h-5 bg-current rounded-full" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{notification.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </div>
  );
}; 