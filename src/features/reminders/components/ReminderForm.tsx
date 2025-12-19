import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CreateReminderDTO, Reminder, ReminderPriority, ReminderType, RecurrencePattern } from '../types/reminder.types';

interface ReminderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReminderDTO) => void;
  initialData?: Reminder | null;
}

const priorities: { value: ReminderPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const recurrences: { value: RecurrencePattern; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const notificationOptions = [
  { value: 'in_app', label: 'In-App Notification' },
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push Notification' },
];

const anticipationOptions = [
  { value: 0, label: 'At time of event' },
  { value: 15, label: '15 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
];

export const ReminderForm: React.FC<ReminderFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [priority, setPriority] = useState<ReminderPriority>('medium');
  const [type, setType] = useState<ReminderType>('one_time');
  const [recurrence, setRecurrence] = useState<RecurrencePattern | ''>('');
  const [notificationChannels, setNotificationChannels] = useState<string[]>(['in_app']);
  const [advanceNotice, setAdvanceNotice] = useState(15);
  
  // Related entities (simplified for now as text/number inputs, ideally would be selectors)
  const [serverId, setServerId] = useState<string>('');
  const [incidentId, setIncidentId] = useState<string>('');
  const [scriptId, setScriptId] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      
      const date = new Date(initialData.scheduled_at);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      setScheduledAt(date.toISOString().slice(0, 16));
      
      setPriority(initialData.priority);
      setType(initialData.type);
      setRecurrence((initialData.recurrence_pattern as RecurrencePattern) || '');
      setNotificationChannels(initialData.notification_channels || ['in_app']);
      setAdvanceNotice(initialData.advance_notice_minutes || 15);
      setServerId(initialData.server_id?.toString() || '');
      setIncidentId(initialData.incident_id?.toString() || '');
      setScriptId(initialData.script_id?.toString() || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setScheduledAt('');
    setPriority('medium');
    setType('one_time');
    setRecurrence('');
    setNotificationChannels(['in_app']);
    setAdvanceNotice(15);
    setServerId('');
    setIncidentId('');
    setScriptId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      scheduled_at: new Date(scheduledAt).toISOString(),
      priority,
      type,
      recurrence_pattern: type === 'recurring' ? (recurrence as RecurrencePattern) : undefined,
      notification_channels: notificationChannels,
      advance_notice_minutes: advanceNotice,
      server_id: serverId ? parseInt(serverId) : undefined,
      incident_id: incidentId ? parseInt(incidentId) : undefined,
      script_id: scriptId ? parseInt(scriptId) : undefined,
    });
    onClose();
  };

  const toggleChannel = (channel: string) => {
    if (notificationChannels.includes(channel)) {
      setNotificationChannels(notificationChannels.filter(c => c !== channel));
    } else {
      setNotificationChannels([...notificationChannels, channel]);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start w-full">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      {initialData ? 'Edit Reminder' : 'New Reminder'}
                    </Dialog.Title>
                    
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      {/* Title */}
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          type="text"
                          id="title"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          placeholder="Backup server DB..."
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          id="description"
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          placeholder="Additional details..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Date & Time */}
                        <div>
                          <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700">Date & Time</label>
                          <input
                            type="datetime-local"
                            id="scheduledAt"
                            required
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          />
                        </div>

                        {/* Priority */}
                        <div>
                          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                          <select
                            id="priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as ReminderPriority)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          >
                            {priorities.map(p => (
                              <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Type & Recurrence */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                          <select
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value as ReminderType)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          >
                            <option value="one_time">One-time</option>
                            <option value="recurring">Recurring</option>
                          </select>
                        </div>

                        {type === 'recurring' && (
                          <div>
                            <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700">Frequency</label>
                            <select
                              id="recurrence"
                              required
                              value={recurrence}
                              onChange={(e) => setRecurrence(e.target.value as RecurrencePattern)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                              <option value="">Select...</option>
                              {recurrences.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Notification Settings */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notification Channels</label>
                        <div className="flex space-x-4">
                          {notificationOptions.map(option => (
                            <div key={option.value} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`channel-${option.value}`}
                                checked={notificationChannels.includes(option.value)}
                                onChange={() => toggleChannel(option.value)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label htmlFor={`channel-${option.value}`} className="ml-2 text-sm text-gray-900">
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Anticipation */}
                      <div>
                        <label htmlFor="anticipation" className="block text-sm font-medium text-gray-700">Remind me</label>
                        <select
                          id="anticipation"
                          value={advanceNotice}
                          onChange={(e) => setAdvanceNotice(Number(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        >
                          {anticipationOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Related Entities (Collapsible or Simple Inputs) */}
                      <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Related To (Optional IDs)</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label htmlFor="serverId" className="block text-xs text-gray-500">Server ID</label>
                            <input
                              type="number"
                              id="serverId"
                              value={serverId}
                              onChange={(e) => setServerId(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs border p-1"
                            />
                          </div>
                          <div>
                            <label htmlFor="incidentId" className="block text-xs text-gray-500">Incident ID</label>
                            <input
                              type="number"
                              id="incidentId"
                              value={incidentId}
                              onChange={(e) => setIncidentId(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs border p-1"
                            />
                          </div>
                          <div>
                            <label htmlFor="scriptId" className="block text-xs text-gray-500">Script ID</label>
                            <input
                              type="number"
                              id="scriptId"
                              value={scriptId}
                              onChange={(e) => setScriptId(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs border p-1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                        >
                          {initialData ? 'Save Changes' : 'Create Reminder'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
