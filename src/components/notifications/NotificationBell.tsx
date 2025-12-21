import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, dismissNotification, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification.id);
    
    if (notification.onAction) {
      notification.onAction();
      return;
    }

    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none">
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-96 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <BellIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <Menu.Item key={notification.id}>
                    {({ active }) => (
                      <div
                        className={clsx(
                          'relative rounded-lg p-3 transition-colors cursor-pointer',
                          active ? 'bg-gray-50' : 'bg-white',
                          'border border-gray-200 hover:border-gray-300'
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span
                            className={clsx(
                              'px-2 py-0.5 rounded text-xs font-medium uppercase',
                              priorityColors[notification.priority]
                            )}
                          >
                            {notification.priority}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1 hover:bg-green-50 rounded transition-colors"
                              title="Mark as read"
                            >
                              <CheckIcon className="h-4 w-4 text-green-600" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notification.id);
                              }}
                              className="p-1 hover:bg-red-50 rounded transition-colors"
                              title="Dismiss"
                            >
                              <XMarkIcon className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {notification.title}
                        </h4>
                        {notification.message && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </Menu.Item>
                ))
              )}
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
