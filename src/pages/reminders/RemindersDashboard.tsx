import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Reminder, CreateReminderDTO, ReminderPriority } from '../../features/reminders/types/reminder.types';
import { remindersService } from '../../features/reminders/services/reminders.service';
import { ReminderItem } from '../../features/reminders/components/ReminderItem';
import { ReminderForm } from '../../features/reminders/components/ReminderForm';
import { useModal } from '../../context/ModalContext';

export const RemindersDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { showModal } = useModal();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('pending');
  const [filterPriority, setFilterPriority] = useState<ReminderPriority | 'all'>('all');

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const data = await remindersService.getAll();
      setReminders(data);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  const handleCreate = async (data: CreateReminderDTO) => {
    try {
      const newReminder = await remindersService.create(data);
      setReminders([newReminder, ...reminders]);
    } catch (error) {
      console.error('Failed to create reminder:', error);
    }
  };

  const handleUpdate = async (data: CreateReminderDTO) => {
    if (!editingReminder) return;
    try {
      const updated = await remindersService.update(editingReminder.id, data);
      setReminders(reminders.map(r => r.id === updated.id ? updated : r));
      setEditingReminder(null);
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };

  const handleDelete = (id: number) => {
    showModal({
      title: 'Eliminar Recordatorio',
      message: '¿Estás seguro de que deseas eliminar este recordatorio?',
      type: 'confirm',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await remindersService.delete(id);
          setReminders(reminders.filter(r => r.id !== id));
        } catch (error) {
          console.error('Failed to delete reminder:', error);
        }
      }
    });
  };

  const handleComplete = async (id: number) => {
    try {
      const updated = await remindersService.complete(id);
      setReminders(reminders.map(r => r.id === updated.id ? updated : r));
    } catch (error) {
      console.error('Failed to complete reminder:', error);
    }
  };

  const handleSnooze = async (id: number) => {
    // Default snooze: 1 hour
    const date = new Date();
    date.setHours(date.getHours() + 1);
    try {
      const updated = await remindersService.snooze(id, date.toISOString());
      setReminders(reminders.map(r => r.id === updated.id ? updated : r));
    } catch (error) {
      console.error('Failed to snooze reminder:', error);
    }
  };

  const filteredReminders = reminders
    .filter(r => filterStatus === 'all' ? true : r.status === filterStatus)
    .filter(r => filterPriority === 'all' ? true : r.priority === filterPriority)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('reminders.title')}</h1>
          <p className="text-sm text-gray-500">{t('reminders.description')}</p>
        </div>
        <button
          onClick={() => {
            setEditingReminder(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          {t('reminders.newReminder')}
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
        <div className="flex items-center text-gray-500">
          <FunnelIcon className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">{t('reminders.filters')}:</span>
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="block w-40 rounded-md border-gray-300 py-1.5 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border p-2"
        >
          <option value="all">{t('reminders.allStatus')}</option>
          <option value="pending">{t('reminders.pending')}</option>
          <option value="completed">{t('reminders.completed')}</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as any)}
          className="block w-40 rounded-md border-gray-300 py-1.5 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border p-2"
        >
          <option value="all">{t('reminders.allPriorities')}</option>
          <option value="low">{t('reminders.priority.low')}</option>
          <option value="medium">{t('reminders.priority.medium')}</option>
          <option value="high">{t('reminders.priority.high')}</option>
          <option value="critical">{t('reminders.priority.critical')}</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">{t('reminders.noResults')}</p>
          </div>
        ) : (
          filteredReminders.map(reminder => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              onEdit={(r) => {
                setEditingReminder(r);
                setIsFormOpen(true);
              }}
              onDelete={handleDelete}
              onComplete={handleComplete}
              onSnooze={handleSnooze}
            />
          ))
        )}
      </div>

      <ReminderForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingReminder(null);
        }}
        onSubmit={editingReminder ? handleUpdate : handleCreate}
        initialData={editingReminder}
      />
    </div>
  );
};
