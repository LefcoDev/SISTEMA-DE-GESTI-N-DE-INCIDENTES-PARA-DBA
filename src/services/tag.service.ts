import api from '../lib/axios';

export interface Tag {
  id: number;
  name: string;
  color: string;
  usage_count: number;
  created_at: string;
}

export const tagService = {
  getAll: async () => {
    const response = await api.get<Tag[]>('/tags');
    return response.data;
  },

  create: async (data: { name: string; color: string }) => {
    const response = await api.post<Tag>('/tags', data);
    return response.data;
  },

  update: async (id: number, data: { name: string; color: string }) => {
    const response = await api.put<Tag>(`/tags/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/tags/${id}`);
  }
};
