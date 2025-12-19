import api from '../lib/axios';

export interface TrendAnalysis {
  period: { start: string; end: string };
  previousPeriod: { start: string; end: string };
  currentStats: {
    total: number;
    byType: { type: string; count: number }[];
    byServer: { server_id: number; count: number; server: { name: string } }[];
  };
  previousStats: {
    total: number;
    byType: { type: string; count: number }[];
    byServer: { server_id: number; count: number; server: { name: string } }[];
  };
  recurrentIncidents: {
    server_id: number;
    type: string;
    count: number;
    server: { name: string };
  }[];
  peakHours: { hour: number; count: number }[];
}

export const reportService = {
  generateReport: async (filters: any) => {
    const response = await api.post('/reports/generate', filters);
    return response.data;
  },

  getTrendAnalysis: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get<TrendAnalysis>(`/reports/trends?${params.toString()}`);
    return response.data;
  }
};
