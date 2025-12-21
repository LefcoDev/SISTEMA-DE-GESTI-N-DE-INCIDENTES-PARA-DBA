import { useEffect, useState, useCallback } from 'react';
import api from '../lib/axios';

export interface Notification {
  id: number;
  user_id: number;
  type: 'reminder' | 'mention' | 'comment' | 'share' | 'suggestion' | 'server_down' | 'database_error' | 'incident_created' | 'incident_assigned' | 'monitoring_alert';
  title: string;
  message?: string;
  entity_type?: string;
  entity_id?: number;
  action_url?: string;
  status: 'pending' | 'sent' | 'read' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<Notification[]>('/notifications');
      const newNotifications = response.data;
      
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => n.status === 'pending' || n.status === 'sent').length);

      // Show desktop notifications for new high-priority notifications
      const highPriorityNotifications = newNotifications.filter(
        n => (n.status === 'pending' || n.status === 'sent') && (n.priority === 'high' || n.priority === 'critical')
      );

      for (const notification of highPriorityNotifications) {
        await showDesktopNotification(notification);
        // Mark as sent after showing
        await api.patch(`/notifications/${notification.id}/read`);
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

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const dismissNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(notifications.map(n => api.patch(`/notifications/${n.id}/read`)));
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    dismissNotification,
    markAllAsRead
  };
};
