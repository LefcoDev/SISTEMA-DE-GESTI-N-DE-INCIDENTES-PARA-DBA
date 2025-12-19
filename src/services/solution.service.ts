import api from '../lib/axios';

export interface Solution {
  id: number;
  incident_id?: number;
  description: string;
  sql_scripts?: string;
  system_commands?: string;
  external_references?: string;
  time_spent_minutes?: number;
  result_obtained?: string;
  is_template: boolean;
  template_name?: string;
  template_category?: string;
  applied_by: number;
  applied_at: string;
  created_at: string;
  updated_at: string;
  incident?: {
    title: string;
    status: string;
  };
  applicator?: {
    full_name: string;
    email: string;
  };
}

export const solutionService = {
  getAll: async (params?: any) => {
    const response = await api.get<Solution[]>('/solutions', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Solution>(`/solutions/${id}`);
    return response.data;
  },

  create: async (data: Partial<Solution>) => {
    const response = await api.post<Solution>('/solutions', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Solution>) => {
    const response = await api.put<Solution>(`/solutions/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/solutions/${id}`);
  },

  getTemplates: async () => {
    const response = await api.get<Solution[]>('/solutions/templates');
    return response.data;
  }
};
