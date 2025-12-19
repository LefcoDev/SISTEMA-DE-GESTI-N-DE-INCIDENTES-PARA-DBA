import api from '../../../lib/axios';
import { KnowledgeResource, CreateResourceDto, UpdateResourceDto } from '../types/knowledge.types';

export const resourcesService = {
  getByTopic: async (topicId: number) => {
    const response = await api.get<KnowledgeResource[]>(`/resources/topic/${topicId}`);
    return response.data;
  },

  create: async (data: CreateResourceDto) => {
    const response = await api.post<KnowledgeResource>('/resources', data);
    return response.data;
  },

  update: async (id: number, data: UpdateResourceDto) => {
    const response = await api.put<KnowledgeResource>(`/resources/${id}`, data);
    return response.data;
  },

  toggleComplete: async (id: number) => {
    const response = await api.patch<KnowledgeResource>(`/resources/${id}/toggle-complete`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  }
};
