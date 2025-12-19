import api from '../lib/axios';

export interface DashboardStats {
  activeIncidents: number;
  resolvedThisMonth: number;
  avgResolutionTime: number;
  criticalOpen: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface IncidentByMonth {
  month: string;
  count: number;
}

export const dashboardService = {
  getStats: async () => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  getIncidentsByMonth: async () => {
    const response = await api.get<IncidentByMonth[]>('/dashboard/incidents-by-month');
    return response.data;
  },

  getIncidentsBySeverity: async () => {
    const response = await api.get<{ severity: string; count: number }[]>('/dashboard/incidents-by-severity');
    return response.data;
  },

  getIncidentsByType: async () => {
    const response = await api.get<{ type: string; count: number }[]>('/dashboard/incidents-by-type');
    return response.data;
  },

  getTopServers: async () => {
    const response = await api.get<{ server_name: string; count: number }[]>('/dashboard/top-servers');
    return response.data;
  },

  getRecentIncidents: async () => {
    const response = await api.get<any[]>('/dashboard/recent-incidents');
    return response.data;
  },

  getMonitoringStats: async () => {
    const response = await api.get('/monitoring/dashboard');
    return response.data;
  }
};
