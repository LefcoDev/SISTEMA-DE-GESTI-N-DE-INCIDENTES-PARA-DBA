import api from '../lib/axios';
import { Incident } from './incident.service';
import { Server } from './server.service';
import { Script } from './script.service';
import { Solution } from './solution.service';

export interface SearchResults {
  incidents: Incident[];
  servers: Server[];
  scripts: Script[];
  solutions: Solution[];
}

export const searchService = {
  search: async (query: string) => {
    const response = await api.get<SearchResults>('/search', { params: { q: query } });
    return response.data;
  }
};
