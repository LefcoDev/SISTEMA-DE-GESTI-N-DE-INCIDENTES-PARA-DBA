import { useNotificationContext } from '../context/NotificationContext';
export type { Notification } from '../context/NotificationContext';

export const useNotifications = () => {
  return useNotificationContext();
};

