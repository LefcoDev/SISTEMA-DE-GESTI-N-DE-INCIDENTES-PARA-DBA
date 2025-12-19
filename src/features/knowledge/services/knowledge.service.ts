import api from '../../../lib/axios';
import { KnowledgeNugget, CreateNuggetDTO, UpdateNuggetDTO, NuggetFilters } from '../types/knowledge.types';

export const knowledgeService = {
  getAll: async (filters?: NuggetFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.technology) params.append('technology', filters.technology);
      if (filters.complexity_level) params.append('complexity_level', filters.complexity_level);
    }
    const response = await api.get<KnowledgeNugget[]>(`/knowledge?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<KnowledgeNugget>(`/knowledge/${id}`);
    return response.data;
  },

  create: async (data: CreateNuggetDTO) => {
    const response = await api.post<KnowledgeNugget>('/knowledge', data);
    return response.data;
  },

  update: async (id: number, data: UpdateNuggetDTO) => {
    const response = await api.put<KnowledgeNugget>(`/knowledge/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/knowledge/${id}`);
  },

  verify: async (id: number) => {
    const response = await api.patch<KnowledgeNugget>(`/knowledge/${id}/verify`);
    return response.data;
  },

  markHelpful: async (id: number) => {
    const response = await api.post<KnowledgeNugget>(`/knowledge/${id}/helpful`);
    return response.data;
  },

  rate: async (id: number, rating: number) => {
    const response = await api.post<KnowledgeNugget>(`/knowledge/${id}/rate`, { rating });
    return response.data;
  }
};
