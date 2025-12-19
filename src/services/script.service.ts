import api from '../lib/axios';

export interface Script {
  id: number;
  name: string;
  description: string;
  language: 'sql' | 'bash' | 'powershell' | 'python';
  code: string;
  category: 'maintenance' | 'monitoring' | 'backup' | 'performance' | 'administration';
  engine_compatible?: string;
  parameters_description?: string;
  usage_count: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: {
    full_name: string;
    email: string;
  };
  tags?: { id: number; name: string }[];
}

export const scriptService = {
  getAll: async (params?: any) => {
    const response = await api.get<Script[]>('/scripts', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Script>(`/scripts/${id}`);
    return response.data;
  },

  create: async (data: Partial<Script>) => {
    const response = await api.post<Script>('/scripts', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Script>) => {
    const response = await api.put<Script>(`/scripts/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/scripts/${id}`);
  }
};
