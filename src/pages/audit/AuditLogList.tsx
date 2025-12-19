import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useModal } from '../../context/ModalContext';

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

export default function AuditLogList() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
    user_id: ''
  });
  const { showModal } = useModal();

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.entity_type) params.append('entity_type', filters.entity_type);
      if (filters.user_id) params.append('user_id', filters.user_id);

      const response = await api.get(`/audit?${params.toString()}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };
handleDelete = async (id: number) => {
    showModal({
      type: 'confirm',
      title: 'Eliminar Registro',
      message: '¿Estás seguro de eliminar este registro de auditoría? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await api.delete(`/audit/${id}`);
          loadLogs();
          showModal({ type: 'success', title: 'Éxito', message: 'Registro eliminado correctamente' });
        } catch (error) {
          console.error('Error deleting log:', error);
          showModal({ type: 'error', title: 'Error', message: 'No se pudo eliminar el registro' });
        }
      }
    });
  };

  const formatValue = (value?: string) => {
    if (!value) return '-';
    try {
      const parsed = JSON.parse(value);
      return (
        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto max-w-xs">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch (e) {
      return value;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Auditoría</h1>
          <p className="mt-2 text-sm text-gray-700">
            Registro de actividades y cambios en el sistema.
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-4">
        <select
          value={filters.entity_type}
          onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
          className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option value="">Todas las Entidades</option>
          <option value="USER">Usuarios</option>
          <option value="SERVER">Servidores</option>
          <option value="INCIDENT">Incidentes</option>
          <option value="SOLUTION">Soluciones</option>
          <option value="SCRIPT">Scripts</option>
          <option value="AUTH">Autenticación</option>
        </select>

        <select
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option value="">Todas las Acciones</option>
          <option value="CREATE">Creación</option>
          <option value="UPDATE">Actualización</option>
          <option value="DELETE">Eliminación</option>
          <option value="LOGIN">Login</option>
          <option value="REGISTER">Registro</option>
        </select>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Fecha</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Usuario</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Acción</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Entidad</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cambios</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">IP</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4">Cargando registros...</td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4">No se encontraron registros</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                          {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {log.user?.full_name || 'Sistema'}
                          <div className="text-xs text-gray-400">{log.user?.email}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            log.action === 'DELETE' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                            log.action === 'CREATE' ? 'bg-green-50 text-green-700 ring-green-600/10' :
                            log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                            'bg-gray-50 text-gray-600 ring-gray-500/10'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {log.entity_type} #{log.entity_id}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {log.action === 'UPDATE' ? (
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <span className="text-xs font-bold text-red-500">Antes:</span>
                                {formatValue(log.old_value)}
                              </div>
                              <div className="flex-1">
                                <span className="text-xs font-bold text-green-500">Después:</span>
                                {formatValue(log.new_value)}
                              </div>
                            </div>
                          ) : (
                            formatValue(log.new_value || log.old_value)
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {log.ip_address}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                            <span className="sr-only">Eliminar</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
