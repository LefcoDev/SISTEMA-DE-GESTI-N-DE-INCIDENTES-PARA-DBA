import api from '../lib/axios';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'senior_dba' | 'junior_dba';
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export const userService = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data.data;
  },

  create: async (data: any) => {
    const response = await api.post('/users', data);
    return response.data.data;
  },

  toggleStatus: async (id: number) => {
    const response = await api.put(`/users/${id}/status`);
    return response.data.data;
  },

  delete: async (id: number) => {
    await api.delete(`/users/${id}`);
  }
};
