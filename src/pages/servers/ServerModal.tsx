import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import PasswordInput from '../../components/PasswordInput';

interface Server {
  id?: number;
  name: string;
  host: string;
  port: number;
  engine_type: string;
  engine_version: string;
  environment: string;
  description: string;
  status: string;
  monitoring_enabled?: boolean;
  monitoring_user?: string;
  monitoring_password?: string;
  service_name?: string;
  manual_tns?: string;
}

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (server: Server) => Promise<void>;
  server?: Server | null;
  type: 'SERVER' | 'DATABASE';
}

const initialServer: Server = {
  name: '',
  host: '',
  port: 3306,
  engine_type: 'mysql',
  engine_version: '',
  environment: 'development',
  description: '',
  status: 'active',
  monitoring_enabled: true,
  monitoring_user: '',
  monitoring_password: '',
  service_name: '',
  manual_tns: '',
};

export default function ServerModal({ isOpen, onClose, onSave, server, type }: ServerModalProps) {
  const [formData, setFormData] = useState<Server>(initialServer);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (server) {
      setFormData(server);
    } else {
      setFormData({
        ...initialServer,
        engine_type: type === 'SERVER' ? 'ubuntu' : 'mysql',
        port: type === 'SERVER' ? 22 : 3306
      });
    }
  }, [server, isOpen, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving server:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      {server 
                        ? (type === 'SERVER' ? 'Editar Servidor' : 'Editar Base de Datos') 
                        : (type === 'SERVER' ? 'Nuevo Servidor' : 'Nueva Base de Datos')}
                    </Dialog.Title>
                    <div className="mt-2">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="host" className="block text-sm font-medium text-gray-700">Host/IP</label>
                            <input
                              type="text"
                              name="host"
                              id="host"
                              required
                              value={formData.host}
                              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                          </div>
                          <div>
                            <label htmlFor="port" className="block text-sm font-medium text-gray-700">Puerto</label>
                            <input
                              type="number"
                              name="port"
                              id="port"
                              required
                              value={formData.port}
                              onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="engine_type" className="block text-sm font-medium text-gray-700">
                              {type === 'SERVER' ? 'Sistema Operativo' : 'Motor de Base de Datos'}
                            </label>
                            <select
                              name="engine_type"
                              id="engine_type"
                              value={formData.engine_type}
                              onChange={(e) => setFormData({ ...formData, engine_type: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                              {type === 'SERVER' ? (
                                <>
                                  <option value="ubuntu">Ubuntu</option>
                                  <option value="debian">Debian</option>
                                  <option value="centos">CentOS</option>
                                  <option value="redhat">Red Hat Enterprise Linux</option>
                                  <option value="windows">Windows Server</option>
                                  <option value="other">Otro Linux</option>
                                </>
                              ) : (
                                <>
                                  <option value="mysql">MySQL</option>
                                  <option value="postgresql">PostgreSQL</option>
                                  <option value="sqlserver">SQL Server</option>
                                  <option value="oracle">Oracle</option>
                                  <option value="mongodb">MongoDB</option>
                                </>
                              )}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="engine_version" className="block text-sm font-medium text-gray-700">Versión</label>
                            <input
                              type="text"
                              name="engine_version"
                              id="engine_version"
                              value={formData.engine_version}
                              onChange={(e) => setFormData({ ...formData, engine_version: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="environment" className="block text-sm font-medium text-gray-700">Ambiente</label>
                            <select
                              name="environment"
                              id="environment"
                              value={formData.environment}
                              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                              <option value="development">Desarrollo</option>
                              <option value="qa">QA</option>
                              <option value="staging">Staging</option>
                              <option value="production">Producción</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                            <select
                              name="status"
                              id="status"
                              value={formData.status}
                              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                              <option value="active">Activo</option>
                              <option value="inactive">Inactivo</option>
                              <option value="maintenance">Mantenimiento</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                          <textarea
                            name="description"
                            id="description"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          />
                        </div>
                        <div className="relative flex items-start">
                          <div className="flex h-5 items-center">
                            <input
                              id="monitoring_enabled"
                              name="monitoring_enabled"
                              type="checkbox"
                              checked={formData.monitoring_enabled !== false}
                              onChange={(e) => setFormData({ ...formData, monitoring_enabled: e.target.checked })}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="monitoring_enabled" className="font-medium text-gray-700">Habilitar Monitoreo</label>
                            <p className="text-gray-500">El sistema verificará periódicamente el estado de este servidor.</p>
                          </div>
                        </div>

                        {formData.monitoring_enabled !== false && (
                          <div className="rounded-md bg-gray-50 p-4 border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Credenciales de Monitoreo (Opcional)</h4>
                            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                              <div>
                                <label htmlFor="monitoring_user" className="block text-sm font-medium text-gray-700">Usuario</label>
                                <input
                                  type="text"
                                  name="monitoring_user"
                                  id="monitoring_user"
                                  value={formData.monitoring_user || ''}
                                  onChange={(e) => setFormData({ ...formData, monitoring_user: e.target.value })}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                  placeholder="monitor_user"
                                />
                              </div>
                              <div>
                                <label htmlFor="monitoring_password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                                <div className="mt-1">
                                  <PasswordInput
                                    id="monitoring_password"
                                    name="monitoring_password"
                                    value={formData.monitoring_password || ''}
                                    onChange={(e) => setFormData({ ...formData, monitoring_password: e.target.value })}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className="border p-2"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {formData.engine_type === 'oracle' && (
                              <div className="mt-4 space-y-4">
                                <div>
                                  <label htmlFor="service_name" className="block text-sm font-medium text-gray-700">Service Name (Oracle)</label>
                                  <input
                                    type="text"
                                    name="service_name"
                                    id="service_name"
                                    value={formData.service_name || ''}
                                    onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                    placeholder="e.g. ORCL"
                                  />
                                  <p className="mt-1 text-xs text-gray-500">Requerido para TNS Ping específico.</p>
                                </div>

                                <div>
                                  <label htmlFor="manual_tns" className="block text-sm font-medium text-gray-700">TNS Descriptor Manual (Opcional)</label>
                                  <textarea
                                    name="manual_tns"
                                    id="manual_tns"
                                    rows={3}
                                    value={formData.manual_tns || ''}
                                    onChange={(e) => setFormData({ ...formData, manual_tns: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 font-mono text-xs"
                                    placeholder="(DESCRIPTION=(ADDRESS=...)(CONNECT_DATA=...))"
                                  />
                                  <p className="mt-1 text-xs text-gray-500">Si se especifica, anula el Service Name y Host/Port para la conexión.</p>
                                </div>
                              </div>
                            )}

                            <p className="mt-2 text-xs text-gray-500">
                              Si se proporcionan, el sistema intentará realizar una conexión real a la base de datos para verificar su estado operativo (Nivel 3).
                            </p>
                          </div>
                        )}

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                          >
                            {loading ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={onClose}
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
