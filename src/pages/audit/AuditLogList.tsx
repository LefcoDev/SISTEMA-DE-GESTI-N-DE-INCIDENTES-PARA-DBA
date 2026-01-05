import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../lib/axios';
import { formatDate } from '../../lib/dateUtils';
import { TrashIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';

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
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
    user_id: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const { showModal } = useModal();
  const { user } = useAuth();

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

  const handleDelete = async (id: number) => {
    showModal({
      type: 'confirm',
      title: t('common.delete'),
      message: t('audit.deleteConfirm'),
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

  // Filtrado y paginación
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">{t('audit.title')}</h1>
          <p className="mt-2 text-sm text-gray-700">
            {t('audit.description')}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder={t('audit.searchPlaceholder')}
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>

        <select
          value={filters.entity_type}
          onChange={(e) => { setFilters({ ...filters, entity_type: e.target.value }); setCurrentPage(1); }}
          className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option value="">{t('audit.allEntities')}</option>
          <option value="USER">{t('audit.entities.USER')}</option>
          <option value="SERVER">{t('audit.entities.SERVER')}</option>
          <option value="INCIDENT">{t('audit.entities.INCIDENT')}</option>
          <option value="SOLUTION">{t('audit.entities.SOLUTION')}</option>
          <option value="SCRIPT">{t('audit.entities.SCRIPT')}</option>
          <option value="AUTH">{t('audit.entities.AUTH')}</option>
        </select>

        <select
          value={filters.action}
          onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setCurrentPage(1); }}
          className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option value="">{t('audit.allActions')}</option>
          <option value="CREATE">{t('audit.actions.CREATE')}</option>
          <option value="UPDATE">{t('audit.actions.UPDATE')}</option>
          <option value="DELETE">{t('audit.actions.DELETE')}</option>
          <option value="LOGIN">{t('audit.actions.LOGIN')}</option>
          <option value="REGISTER">{t('audit.actions.REGISTER')}</option>
        </select>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">{t('audit.fields.date')}</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('audit.fields.user')}</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('audit.fields.action')}</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('audit.fields.entity')}</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('audit.fields.changes')}</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('audit.fields.ip')}</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                      {t('audit.fields.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4">{t('audit.loading')}</td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4">{t('audit.noRecords')}</td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                          {formatDate(new Date(log.created_at), 'datetime')}
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
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                            <span className="text-xs">{t('audit.viewDetails')}</span>
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {log.ip_address}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(log.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar"
                            >
                              <TrashIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="sr-only">Eliminar</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {filteredLogs.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                      <span className="font-medium">{Math.min(endIndex, filteredLogs.length)}</span> de{' '}
                      <span className="font-medium">{filteredLogs.length}</span> registros
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Anterior</span>
                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            page === currentPage
                              ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Siguiente</span>
                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para ver detalles de cambios */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedLog(null)}></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                        {t('audit.detailsTitle')}
                      </h3>
                      <button
                        onClick={() => setSelectedLog(null)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-semibold">{t('audit.fields.date')}:</span>
                          <p>{formatDate(new Date(selectedLog.created_at), 'datetime')}</p>
                        </div>
                        <div>
                          <span className="font-semibold">{t('audit.fields.user')}:</span>
                          <p>{selectedLog.user?.full_name || 'Sistema'}</p>
                          <p className="text-xs text-gray-500">{selectedLog.user?.email}</p>
                        </div>
                        <div>
                          <span className="font-semibold">{t('audit.fields.action')}:</span>
                          <p>
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              selectedLog.action === 'DELETE' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                              selectedLog.action === 'CREATE' ? 'bg-green-50 text-green-700 ring-green-600/10' :
                              selectedLog.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                              'bg-gray-50 text-gray-600 ring-gray-500/10'
                            }`}>
                              {selectedLog.action}
                            </span>
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold">{t('audit.fields.entity')}:</span>
                          <p>{selectedLog.entity_type} #{selectedLog.entity_id}</p>
                        </div>
                        <div>
                          <span className="font-semibold">{t('audit.fields.ip')}:</span>
                          <p>{selectedLog.ip_address}</p>
                        </div>
                      </div>

                      {selectedLog.action === 'UPDATE' && (
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div>
                            <h4 className="font-semibold text-red-600 mb-2">{t('audit.fields.oldValue')}:</h4>
                            <pre className="text-xs bg-red-50 p-3 rounded overflow-x-auto max-h-96 border border-red-200">
                              {selectedLog.old_value ? JSON.stringify(JSON.parse(selectedLog.old_value), null, 2) : '-'}
                            </pre>
                          </div>
                          <div>
                            <h4 className="font-semibold text-green-600 mb-2">{t('audit.fields.newValue')}:</h4>
                            <pre className="text-xs bg-green-50 p-3 rounded overflow-x-auto max-h-96 border border-green-200">
                              {selectedLog.new_value ? JSON.stringify(JSON.parse(selectedLog.new_value), null, 2) : '-'}
                            </pre>
                          </div>
                        </div>
                      )}

                      {selectedLog.action !== 'UPDATE' && (
                        <div className="mt-6">
                          <h4 className="font-semibold mb-2">{t('audit.fields.data')}:</h4>
                          <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-96 border border-gray-200">
                            {(selectedLog.new_value || selectedLog.old_value) 
                              ? JSON.stringify(JSON.parse(selectedLog.new_value || selectedLog.old_value || '{}'), null, 2) 
                              : '-'}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
