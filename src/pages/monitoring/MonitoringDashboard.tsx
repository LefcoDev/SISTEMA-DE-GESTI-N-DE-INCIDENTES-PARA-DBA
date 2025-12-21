import { useState, useEffect } from 'react';
import { 
  ServerIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import api from '../../lib/axios';
import clsx from 'clsx';

interface ServerHealth {
  id: number;
  is_online: boolean;
  response_time_ms: number;
  checked_at: string;
  error_message?: string;
}

interface ServerWithHealth {
  id: number;
  name: string;
  host: string;
  port: number;
  engine_type: string;
  healthChecks: ServerHealth[];
}

interface DashboardStats {
  total: number;
  online: number;
  offline: number;
  avgResponseTime: number;
}

export default function MonitoringDashboard() {
  const [servers, setServers] = useState<ServerWithHealth[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use a Set to track multiple servers refreshing at once
  const [refreshingServerIds, setRefreshingServerIds] = useState<Set<number>>(new Set());

  const fetchData = async () => {
    try {
      const response = await api.get(`/monitoring/dashboard?t=${new Date().getTime()}`);
      setServers(response.data.servers);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleRunSingleCheck = async (serverId: number) => {
    // Add serverId to the set
    setRefreshingServerIds(prev => new Set(prev).add(serverId));
    
    try {
      await api.post(`/monitoring/run/${serverId}`);
    } catch (error) {
      console.error('Error running check for server:', error);
    } finally {
      // Force a delay to ensure backend has committed the transaction/update
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchData();
      // Remove serverId from the set
      setRefreshingServerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(serverId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Monitoreo de Servidores</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total Servidores</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats?.total || 0}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Online</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-600">{stats?.online || 0}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Offline</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-red-600">{stats?.offline || 0}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Tiempo Promedio</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats?.avgResponseTime || 0} ms</dd>
        </div>
      </div>

      {/* Server Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {servers.map((server) => {
          const lastCheck = server.healthChecks?.[0];
          const isOnline = lastCheck?.is_online;
          
          return (
            <div key={server.id} className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-3">
                    <ServerIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <h3 className="text-base font-semibold leading-6 text-gray-900">{server.name}</h3>
                      <p className="text-sm text-gray-500">{server.host}:{server.port}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <button
                      onClick={() => handleRunSingleCheck(server.id)}
                      disabled={refreshingServerIds.has(server.id)}
                      className="rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                      title="Verificar este servidor"
                    >
                      <ArrowPathIcon 
                        className={clsx("h-5 w-5", refreshingServerIds.has(server.id) && "animate-spin")} 
                      />
                    </button>
                    <div className={clsx(
                      "flex-none rounded-full p-1",
                      isOnline ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    )}>
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Estado:</span>
                    <span className={clsx(
                      "font-medium",
                      isOnline ? "text-green-600" : "text-red-600"
                    )}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Latencia:</span>
                    <span className="font-medium text-gray-900">
                      {lastCheck ? `${lastCheck.response_time_ms} ms` : 'N/A'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Última verificación:</span>
                    <span className="font-medium text-gray-900">
                      {lastCheck ? new Date(lastCheck.checked_at).toLocaleTimeString() : 'Nunca'}
                    </span>
                  </div>
                  {!isOnline && lastCheck?.error_message && (
                    <div className="mt-3 rounded-md bg-red-50 p-2 text-xs text-red-700">
                      {lastCheck.error_message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
