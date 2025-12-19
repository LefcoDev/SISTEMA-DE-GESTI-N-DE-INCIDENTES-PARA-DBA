import { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { incidentService, Incident } from '../../services/incident.service';
import { serverService, Server } from '../../services/server.service';
import { reportService, TrendAnalysis } from '../../services/report.service';
import { useModal } from '../../context/ModalContext';
import { DocumentArrowDownIcon, TableCellsIcon, ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import api from '../../lib/axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportStats {
  total: number;
  by_severity: Record<string, number>;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  mttr_minutes: number;
}

export default function Reports() {
  const { showModal } = useModal();
  const [activeTab, setActiveTab] = useState<'general' | 'trends'>('general');
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [trendData, setTrendData] = useState<TrendAnalysis | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    server_id: '',
    type: '',
    severity: '',
    status: ''
  });

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const data = await serverService.getAll();
        setServers(data);
      } catch (error) {
        console.error('Error fetching servers:', error);
      }
    };
    fetchServers();
  }, []);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const data = await reportService.getTrendAnalysis(filters.startDate, filters.endDate);
      setTrendData(data);
    } catch (error) {
      console.error('Error fetching trends:', error);
      showModal({
        title: 'Error',
        message: 'Error al obtener análisis de tendencias',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await api.post('/reports/generate', filters);
      setStats(response.data.statistics);
      return response.data.incidents;
    } catch (error) {
      console.error('Error generating report:', error);
      showModal({
        title: 'Error',
        message: 'Error al generar el reporte',
        type: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const incidents = await generateReport();
    if (incidents.length === 0) return;

    try {
      // Convert to CSV
      const headers = ['ID', 'Título', 'Servidor', 'Tipo', 'Severidad', 'Estado', 'Fecha Detección', 'Fecha Resolución', 'Tiempo (min)'];
      const csvContent = [
        headers.join(','),
        ...incidents.map((incident: Incident) => [
          incident.id,
          `"${incident.title.replace(/"/g, '""')}"`,
          incident.server?.name || '',
          incident.type,
          incident.severity,
          incident.status,
          incident.detected_at,
          incident.resolved_at || '',
          incident.resolution_time_minutes || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `reporte_incidentes_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const incidents = await generateReport();
      if (incidents.length === 0) return;
      
      // Prepare data for Excel
      const data = incidents.map((incident: Incident) => ({
        ID: incident.id,
        Título: incident.title,
        Servidor: incident.server?.name || '',
        Tipo: incident.type,
        Severidad: incident.severity,
        Estado: incident.status,
        'Fecha Detección': incident.detected_at,
        'Fecha Resolución': incident.resolved_at || '',
        'Tiempo (min)': incident.resolution_time_minutes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Incidentes");
      
      // Generate buffer
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      
      saveAs(blob, `reporte_incidentes_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting Excel report:', error);
      showModal({
        title: 'Error',
        message: 'Error al generar el reporte Excel',
        type: 'error'
      });
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="mt-2 text-sm text-gray-700">
            Genera reportes detallados y analiza tendencias de incidentes.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('general')}
            className={`${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Reporte General
          </button>
          <button
            onClick={() => {
              setActiveTab('trends');
              if (!trendData) fetchTrends();
            }}
            className={`${
              activeTab === 'trends'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
            Análisis de Tendencias
          </button>
        </nav>
      </div>

      {/* Filters Section (Common) */}
      <div className="bg-white shadow rounded-lg p-6 mt-6 mb-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          
          {activeTab === 'general' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Servidor</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={filters.server_id}
                  onChange={(e) => setFilters({ ...filters, server_id: e.target.value })}
                >
                  <option value="">Todos</option>
                  {servers.map((server) => (
                    <option key={server.id} value={server.id}>{server.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="performance">Performance</option>
                  <option value="availability">Disponibilidad</option>
                  <option value="data_corruption">Corrupción de Datos</option>
                  <option value="backup_restore">Backup/Restore</option>
                  <option value="security">Seguridad</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Severidad</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                >
                  <option value="">Todas</option>
                  <option value="critical">Crítica</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="new">Nuevo</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="resolved">Resuelto</option>
                  <option value="closed">Cerrado</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          {activeTab === 'general' ? (
            <>
              <button
                onClick={generateReport}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Generar Reporte
              </button>
              <button
                onClick={handleExport}
                disabled={loading || exportingExcel || !stats}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-gray-500" />
                CSV
              </button>
              <button
                onClick={handleExportExcel}
                disabled={loading || exportingExcel || !stats}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                <TableCellsIcon className="h-5 w-5 mr-2" />
                Excel
              </button>
            </>
          ) : (
            <button
              onClick={fetchTrends}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Actualizar Análisis
            </button>
          )}
        </div>
      </div>

      {activeTab === 'general' && stats && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen del Reporte</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Incidentes</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">MTTR Promedio</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.mttr_minutes} min</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Críticos</dt>
                      <dd className="text-lg font-medium text-red-600">{stats.by_severity['critical'] || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Resueltos</dt>
                      <dd className="text-lg font-medium text-green-600">{stats.by_status['resolved'] || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && trendData && (
        <div className="space-y-8">
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="bg-white overflow-hidden shadow rounded-lg p-5">
              <h3 className="text-lg font-medium text-gray-900">Comparativa de Período</h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Período Actual</p>
                  <p className="text-2xl font-bold text-indigo-600">{trendData.currentStats.total} Incidentes</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(trendData.period.start), 'dd/MM/yyyy')} - {format(new Date(trendData.period.end), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Período Anterior</p>
                  <p className="text-2xl font-bold text-gray-600">{trendData.previousStats.total} Incidentes</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(trendData.previousPeriod.start), 'dd/MM/yyyy')} - {format(new Date(trendData.previousPeriod.end), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-5">
              <h3 className="text-lg font-medium text-gray-900">Top Servidores Problemáticos</h3>
              <ul className="mt-4 space-y-2">
                {trendData.currentStats.byServer.map((item) => (
                  <li key={item.server_id} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{item.server.name}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {item.count} incidentes
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recurrent Incidents */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Incidentes Recurrentes</h3>
            <p className="text-sm text-gray-500 mb-4">Incidentes del mismo tipo en el mismo servidor durante este período.</p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servidor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trendData.recurrentIncidents.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.server.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.count}</td>
                    </tr>
                  ))}
                  {trendData.recurrentIncidents.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No se encontraron incidentes recurrentes.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Horarios de Mayor Incidencia</h3>
            <div className="h-64 flex items-end space-x-2">
              {Array.from({ length: 24 }).map((_, hour) => {
                const data = trendData.peakHours.find(h => h.hour === hour);
                const count = data ? data.count : 0;
                const maxCount = Math.max(...trendData.peakHours.map(h => h.count), 1);
                const height = (count / maxCount) * 100;
                
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center group relative">
                    <div 
                      className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-all"
                      style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1">{hour}h</span>
                    {count > 0 && (
                      <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 z-10">
                        {count} incidentes
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
