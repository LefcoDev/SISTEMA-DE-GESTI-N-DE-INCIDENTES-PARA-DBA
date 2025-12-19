import api from '../lib/axios';

export interface Server {
  id: number;
  name: string;
  host: string;
  port: number;
  engine_type: string;
  engine_version: string;
  environment: string;
  description: string;
  status: string;
  monitoring_enabled?: boolean;
}

export const serverService = {
  getAll: async () => {
    const response = await api.get<Server[]>('/servers');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Server>(`/servers/${id}`);
    return response.data;
  },

  create: async (data: Partial<Server>) => {
    const response = await api.post<Server>('/servers', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Server>) => {
    const response = await api.put<Server>(`/servers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/servers/${id}`);
  }
};
