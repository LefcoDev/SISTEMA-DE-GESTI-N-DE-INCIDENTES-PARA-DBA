import api from '../../../lib/axios';
import { JournalEntry, CreateJournalEntryDTO, JournalFilters } from '../types/journal.types';

export const journalService = {
  getAll: async (filters?: JournalFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);
    }
    const response = await api.get<JournalEntry[]>(`/journal?${params.toString()}`);
    return response.data;
  },

  getByDate: async (date: string) => {
    const response = await api.get<JournalEntry>(`/journal/${date}`);
    return response.data;
  },

  createOrUpdate: async (data: CreateJournalEntryDTO) => {
    const response = await api.post<JournalEntry>('/journal', data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/journal/${id}`);
    return response.data;
  }
};
