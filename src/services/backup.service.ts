import api from '../lib/axios';

export interface Backup {
  filename: string;
  size: number;
  createdAt: string;
}

export const backupService = {
  getAll: async () => {
    const response = await api.get<Backup[]>('/backups');
    return response.data;
  },

  create: async () => {
    const response = await api.post<{ message: string; filename: string }>('/backups');
    return response.data;
  },

  restore: async (filename: string) => {
    const response = await api.post('/backups/restore', { filename });
    return response.data;
  },

  delete: async (filename: string) => {
    await api.delete(`/backups/${filename}`);
  }
};
