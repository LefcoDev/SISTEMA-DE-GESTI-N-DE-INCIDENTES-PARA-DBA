import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import api from '../../lib/axios';

interface Incident {
  id?: number;
  title: string;
  description: string;
  server_id: number;
  type: string;
  severity: string;
  status: string;
  detected_at: string;
  solutions?: any[];
}

interface Server {
  id: number;
  name: string;
}

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (incident: Incident) => Promise<void>;
  incident?: Incident | null;
}

const initialIncident: Incident = {
  title: '',
  description: '',
  server_id: 0,
  type: 'performance',
  severity: 'medium',
  status: 'new',
  detected_at: new Date().toISOString().slice(0, 16), // Format for datetime-local
};

export default function IncidentModal({ isOpen, onClose, onSave, incident }: IncidentModalProps) {
  const [formData, setFormData] = useState<Incident>(initialIncident);
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Incident[]>([]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await api.get('/servers');
        setServers(response.data);
        if (response.data.length > 0 && !incident && formData.server_id === 0) {
          setFormData(prev => ({ ...prev, server_id: response.data[0].id }));
        }
      } catch (error) {
        console.error('Error fetching servers:', error);
      }
    };
    fetchServers();
  }, []);

  useEffect(() => {
    if (incident) {
      setFormData({
        ...incident,
        detected_at: new Date(incident.detected_at).toISOString().slice(0, 16),
      });
      setSuggestions([]);
    } else {
      setFormData({
        ...initialIncident,
        detected_at: new Date().toISOString().slice(0, 16),
        server_id: servers.length > 0 ? servers[0].id : 0,
      });
      setSuggestions([]);
    }
  }, [incident, isOpen, servers]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      // Only fetch if it's a new incident (no ID) and we have a title
      if (incident?.id || !formData.title || formData.title.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await api.get('/incidents/similar', {
          params: {
            title: formData.title,
            type: formData.type,
            serverId: formData.server_id
          }
        });
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.title, formData.type, formData.server_id, incident?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...formData,
        server_id: Number(formData.server_id),
      });
      onClose();
    } catch (error) {
      console.error('Error saving incident:', error);
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
                      {incident ? 'Editar Incidente' : 'Nuevo Incidente'}
                    </Dialog.Title>
                    <div className="mt-2">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          />
                          {suggestions.length > 0 && (
                            <div className="mt-2 rounded-md bg-blue-50 p-3">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3 flex-1">
                                  <h3 className="text-sm font-medium text-blue-800">Incidentes similares encontrados</h3>
                                  <div className="mt-2 text-sm text-blue-700 max-h-32 overflow-y-auto">
                                    <ul role="list" className="space-y-2">
                                      {suggestions.map((suggestion) => (
                                        <li key={suggestion.id} className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                                          <div className="flex-1 min-w-0 mr-2">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                              {suggestion.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              {new Date(suggestion.detected_at).toLocaleDateString()} - {suggestion.type}
                                            </p>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            {suggestion.solutions && suggestion.solutions.length > 0 && (
                                              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                Con Solución
                                              </span>
                                            )}
                                            <a
                                              href={`/incidents/${suggestion.id}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-indigo-600 hover:text-indigo-900 font-medium"
                                            >
                                              Ver
                                            </a>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label htmlFor="server_id" className="block text-sm font-medium text-gray-700">Servidor</label>
                          <select
                            name="server_id"
                            id="server_id"
                            required
                            value={formData.server_id}
                            onChange={(e) => setFormData({ ...formData, server_id: Number(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          >
                            {servers.map((server) => (
                              <option key={server.id} value={server.id}>
                                {server.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
                            <select
                              name="type"
                              id="type"
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                              <option value="performance">Rendimiento</option>
                              <option value="availability">Disponibilidad</option>
                              <option value="data_corruption">Corrupción de Datos</option>
                              <option value="backup_restore">Backup/Restore</option>
                              <option value="replication">Replicación</option>
                              <option value="security">Seguridad</option>
                              <option value="capacity">Capacidad</option>
                              <option value="slow_query">Consultas Lentas</option>
                              <option value="deadlock">Deadlock</option>
                              <option value="other">Otro</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="severity" className="block text-sm font-medium text-gray-700">Severidad</label>
                            <select
                              name="severity"
                              id="severity"
                              value={formData.severity}
                              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                              <option value="critical">Crítica</option>
                              <option value="high">Alta</option>
                              <option value="medium">Media</option>
                              <option value="low">Baja</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                            <select
                              name="status"
                              id="status"
                              value={formData.status}
                              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            >
                              <option value="new">Nuevo</option>
                              <option value="in_progress">En Progreso</option>
                              <option value="waiting">En Espera</option>
                              <option value="resolved">Resuelto</option>
                              <option value="closed">Cerrado</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="detected_at" className="block text-sm font-medium text-gray-700">Fecha Detección</label>
                            <input
                              type="datetime-local"
                              name="detected_at"
                              id="detected_at"
                              required
                              value={formData.detected_at}
                              onChange={(e) => setFormData({ ...formData, detected_at: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                          <textarea
                            name="description"
                            id="description"
                            rows={3}
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          />
                        </div>
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
