import React from 'react';
import { Reminder, ReminderPriority } from '../types/reminder.types';
import { BellIcon, CheckCircleIcon, ClockIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { formatDate, isPast } from '../../../lib/dateUtils';
import clsx from 'clsx';

interface ReminderItemProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: number) => void;
  onComplete: (id: number) => void;
  onSnooze: (id: number) => void;
}

const priorityColors: Record<ReminderPriority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export const ReminderItem: React.FC<ReminderItemProps> = ({ reminder, onEdit, onDelete, onComplete, onSnooze }) => {
  const isOverdue = reminder.scheduled_at && isPast(new Date(reminder.scheduled_at)) && reminder.status === 'pending';

  return (
    <div className={clsx(
      "flex items-center justify-between p-4 bg-white rounded-lg shadow border-l-4 transition-all hover:shadow-md",
      reminder.status === 'completed' ? 'border-green-500 opacity-75' : 
      isOverdue ? 'border-red-500' : 'border-indigo-500'
    )}>
      <div className="flex items-start space-x-4">
        <div className={clsx("p-2 rounded-full", isOverdue ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-600")}>
          <BellIcon className="h-6 w-6" />
        </div>
        
        <div>
          <div className="flex items-center space-x-2">
            <h3 className={clsx("font-medium text-gray-900", reminder.status === 'completed' && "line-through")}>
              {reminder.title}
            </h3>
            <span className={clsx("px-2 py-0.5 rounded text-xs font-medium uppercase", priorityColors[reminder.priority])}>
              {reminder.priority}
            </span>
            {isOverdue && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                Overdue
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mt-1">{reminder.description}</p>
          
          <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4 flex-wrap gap-y-1">
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {reminder.scheduled_at ? formatDate(new Date(reminder.scheduled_at), 'time') : 'No date'}
            </div>
            {reminder.type === 'recurring' && (
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                ↻ {reminder.recurrence_pattern}
              </span>
            )}
            {reminder.notification_channels && reminder.notification_channels.length > 0 && (
              <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200" title="Notification Channels">
                🔔 {reminder.notification_channels.join(', ')}
              </span>
            )}
            {reminder.server_id && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Server #{reminder.server_id}</span>}
            {reminder.incident_id && <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded">Incident #{reminder.incident_id}</span>}
            {reminder.script_id && <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">Script #{reminder.script_id}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {reminder.status !== 'completed' && (
          <>
            <button
              onClick={() => onComplete(reminder.id)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
              title="Mark as Complete"
            >
              <CheckCircleIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onSnooze(reminder.id)}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
              title="Snooze"
            >
              <ClockIcon className="h-5 w-5" />
            </button>
          </>
        )}
        
        <button
          onClick={() => onEdit(reminder)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          title="Edit"
        >
          <PencilSquareIcon className="h-5 w-5" />
        </button>
        
        <button
          onClick={() => onDelete(reminder.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Delete"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
