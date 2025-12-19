import api from '../../../lib/axios';
import { Reminder, CreateReminderDTO, UpdateReminderDTO, ReminderFilters } from '../types/reminder.types';

export const remindersService = {
  getAll: async (filters?: ReminderFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);
    }
    const response = await api.get<Reminder[]>(`/reminders?${params.toString()}`);
    return response.data;
  },

  create: async (data: CreateReminderDTO) => {
    const response = await api.post<Reminder>('/reminders', data);
    return response.data;
  },

  update: async (id: number, data: UpdateReminderDTO) => {
    const response = await api.put<Reminder>(`/reminders/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/reminders/${id}`);
  },

  complete: async (id: number) => {
    const response = await api.patch<Reminder>(`/reminders/${id}/complete`);
    return response.data;
  },

  snooze: async (id: number, snoozeUntil: string) => {
    const response = await api.patch<Reminder>(`/reminders/${id}/snooze`, { snooze_until: snoozeUntil });
    return response.data;
  }
};
