import { useEffect, useState } from 'react';
import { 
  CheckCircleIcon, ExclamationTriangleIcon, ServerIcon, CircleStackIcon 
} from '@heroicons/react/24/outline';
import { dashboardService, DashboardStats } from '../../services/dashboard.service';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monitoringData, setMonitoringData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, monitoring] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getMonitoringStats()
        ]);
        setStats(statsData);
        setMonitoringData(monitoring);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-6">Cargando dashboard...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">v1.0.9</span>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Incidentes Activos</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.activeIncidents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Resueltos (Mes)</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats?.resolvedThisMonth}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ServerIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Servidores Monitoreados</dt>
                  <dd className="text-lg font-medium text-gray-900">{monitoringData?.stats?.total || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CircleStackIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Servidores Online</dt>
                  <dd className="text-lg font-medium text-gray-900">{monitoringData?.stats?.online || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Server Status Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Estado de Servidores y Base de Datos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Servidor</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Host / IP</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Motor BD</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado Servidor (Ping)</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado BD (Puerto)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monitoringData?.servers?.map((server: any) => {
                const lastCheck = server.healthChecks?.[0];
                return (
                  <tr key={server.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{server.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{server.host}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{server.engine_type}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        lastCheck?.server_reachable 
                          ? 'bg-green-50 text-green-700 ring-green-600/20' 
                          : 'bg-red-50 text-red-700 ring-red-600/20'
                      }`}>
                        {lastCheck?.server_reachable ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        lastCheck?.is_online 
                          ? 'bg-green-50 text-green-700 ring-green-600/20' 
                          : 'bg-red-50 text-red-700 ring-red-600/20'
                      }`}>
                        {lastCheck?.is_online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {(!monitoringData?.servers || monitoringData.servers.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-sm text-gray-500">
                    No hay servidores registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
