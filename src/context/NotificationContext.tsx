import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/axios';

export interface Notification {
  id: number | string;
  user_id?: number;
  type: 'reminder' | 'mention' | 'comment' | 'share' | 'suggestion' | 'server_down' | 'database_error' | 'incident_created' | 'incident_assigned' | 'monitoring_alert' | 'system_update';
  title: string;
  message?: string;
  entity_type?: string;
  entity_id?: number;
  action_url?: string;
  status: 'pending' | 'sent' | 'read' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  isLocal?: boolean;
  onAction?: () => void;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: number | string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (id: number | string) => Promise<void>;
  addSystemNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'status' | 'user_id'>) => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<Notification[]>('/notifications');
      // Keep local notifications that are not dismissed
      setNotifications(prev => {
        const local = prev.filter(n => n.isLocal);
        return [...local, ...response.data];
      });

      // Show desktop notifications for new high-priority notifications
      const highPriorityNotifications = response.data.filter(
        n => (n.status === 'pending' || n.status === 'sent') && (n.priority === 'high' || n.priority === 'critical')
      );

      for (const notification of highPriorityNotifications) {
        await showDesktopNotification(notification);
        // Mark as sent after showing (optional, depending on backend logic)
        // await api.patch(`/notifications/${notification.id}/read`); 
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const showDesktopNotification = async (notification: Notification) => {
    const urgency = notification.priority === 'critical' ? 'critical' : notification.priority === 'high' ? 'normal' : 'low';
    
    // Try Electron notification first
    if (window.electron?.showNotification) {
      try {
        await window.electron.showNotification({
          title: notification.title,
          body: notification.message || 'You have a new notification',
          urgency
        });
        return;
      } catch (error) {
        console.error('Electron notification failed:', error);
      }
    }

    // Fallback to browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message || 'You have a new notification',
        icon: '/icon.png',
        tag: `notification-${notification.id}`,
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message || 'You have a new notification',
          icon: '/icon.png',
          tag: `notification-${notification.id}`,
        });
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const addSystemNotification = useCallback((notification: Omit<Notification, 'id' | 'created_at' | 'status' | 'user_id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'pending',
      isLocal: true,
    };
    
    setNotifications(prev => {
      // Avoid duplicates if needed, or just prepend
      return [newNotification, ...prev];
    });
  }, []);

  const markAsRead = async (id: number | string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, status: 'read' } : n))
    );

    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.isLocal) {
      try {
        await api.patch(`/notifications/${id}/read`);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, status: 'read' }))
    );

    try {
      await api.patch('/notifications/read-all');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const dismissNotification = async (id: number | string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.isLocal) {
      // Assuming there's an endpoint for this or just ignore
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'pending' || n.status === 'sent').length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        addSystemNotification,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
