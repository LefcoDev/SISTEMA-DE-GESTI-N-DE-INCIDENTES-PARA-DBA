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
  incident_date?: string;
  server?: {
    id: number;
    name: string;
    ip_address: string;
  };
  creator?: {
    id: number;
    full_name: string;
    email: string;
  };
  assignee?: {
    id: number;
    full_name: string;
    email: string;
  };
  tags?: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  attachments?: Array<{
    id: number;
    filename: string;
    file_path: string;
    file_size: number;
  }>;
  solutions?: Array<{
    id: number;
    description: string;
    created_at: string;
    creator?: {
      full_name: string;
    };
  }>;
  status_history?: Array<{
    status: string;
    timestamp: string;
    user?: {
      full_name: string;
    };
  }>;
  similar_incidents?: Array<{
    id: number;
    title: string;
    similarity: number;
  }>;
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
