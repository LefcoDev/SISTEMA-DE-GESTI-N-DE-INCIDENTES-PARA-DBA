import api from '../lib/axios';

export interface Incident {
  id: number;
  title: string;
  description: string;
  server_id: number;
  type: string;
  severity: string;
  status: string;
  impact?: string;
  reported_by?: string;
  assigned_to?: number;
  detected_at: string;
  started_work_at?: string;
  resolved_at?: string;
  closed_at?: string;
  resolution_time_minutes?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  server?: {
    name: string;
    ip_address: string;
  };
  creator?: {
    full_name: string;
    email: string;
  };
  assignee?: {
    full_name: string;
    email: string;
  };
}

export const incidentService = {
  getAll: async (params?: any) => {
    const response = await api.get<Incident[]>('/incidents', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Incident>(`/incidents/${id}`);
    return response.data;
  },

  create: async (data: Partial<Incident>) => {
    const response = await api.post<Incident>('/incidents', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Incident>) => {
    const response = await api.put<Incident>(`/incidents/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/incidents/${id}`);
  }
};
