import api from '../../../lib/axios';
import { Note, CreateNoteDTO, UpdateNoteDTO, NoteFilters } from '../types/note.types';

export const notesService = {
  getAll: async (filters?: NoteFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.type) params.append('type', filters.type);
      if (filters.server_id) params.append('server_id', filters.server_id.toString());
      if (filters.incident_id) params.append('incident_id', filters.incident_id.toString());
      if (filters.script_id) params.append('script_id', filters.script_id.toString());
      if (filters.is_archived !== undefined) params.append('is_archived', filters.is_archived.toString());
      if (filters.search) params.append('search', filters.search);
    }
    const response = await api.get<Note[]>(`/notes?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Note>(`/notes/${id}`);
    return response.data;
  },

  create: async (data: CreateNoteDTO) => {
    const response = await api.post<Note>('/notes', data);
    return response.data;
  },

  update: async (id: number, data: UpdateNoteDTO) => {
    const response = await api.put<Note>(`/notes/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/notes/${id}`);
  },

  togglePin: async (id: number) => {
    const response = await api.patch<Note>(`/notes/${id}/pin`);
    return response.data;
  },

  toggleArchive: async (id: number) => {
    const response = await api.patch<Note>(`/notes/${id}/archive`);
    return response.data;
  },

  updateKanbanPosition: async (id: number, column: string, position: number) => {
    const response = await api.patch<Note>(`/notes/${id}/kanban`, { 
      kanban_column: column, 
      kanban_position: position 
    });
    return response.data;
  },

  duplicate: async (id: number) => {
    const response = await api.post<Note>(`/notes/${id}/duplicate`);
    return response.data;
  }
};
