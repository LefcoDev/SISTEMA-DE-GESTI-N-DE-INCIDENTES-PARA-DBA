import api from '../../../lib/axios';
import { KnowledgeTopic, CreateTopicDto, UpdateTopicDto } from '../types/knowledge.types';

export const topicsService = {
  getAll: async () => {
    const response = await api.get<KnowledgeTopic[]>('/topics');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<KnowledgeTopic>(`/topics/${id}`);
    return response.data;
  },

  create: async (data: CreateTopicDto) => {
    const response = await api.post<KnowledgeTopic>('/topics', data);
    return response.data;
  },

  update: async (id: number, data: UpdateTopicDto) => {
    const response = await api.put<KnowledgeTopic>(`/topics/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/topics/${id}`);
    return response.data;
  }
};
