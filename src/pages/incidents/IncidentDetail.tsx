import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../../lib/axios';
import { 
  ClockIcon, 
  ChatBubbleLeftRightIcon, 
  PaperClipIcon, 
  TagIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface IncidentDetail {
  id: number;
  title: string;
  description: string;
  status: string;
  severity: string;
  type: string;
  detected_at: string;
  closed_at?: string;
  server?: {
    name: string;
    ip_address: string;
  };
  creator?: {
    full_name: string;
  };
  assignee?: {
    full_name: string;
  };
  Tags?: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  IncidentHistories?: Array<{
    id: number;
    field_changed: string;
    old_value?: string;
    new_value?: string;
    changed_at: string;
    User?: {
      full_name: string;
    };
  }>;
  Solutions?: Array<{
    id: number;
    title: string;
    description: string;
    is_effective: boolean;
    created_at: string;
  }>;
  Attachments?: Array<{
    id: number;
    filename: string;
    file_path: string;
    created_at: string;
  }>;
}

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchIncident = async () => {
    try {
      const response = await api.get(`/incidents/${id}`);
      setIncident(response.data);
    } catch (error) {
      console.error('Error fetching incident details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchIncident();
    }
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await api.post(`/incidents/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchIncident();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir el archivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = (filename: string, originalName: string) => {
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');
    const url = `${baseUrl}/uploads/attachments/${filename}`;
    window.open(url, '_blank');
  };

  const formatHistoryAction = (event: any) => {
    const field = event.field_changed;
    const oldVal = event.old_value;
    const newVal = event.new_value;
    
    if (field === 'status') return `Estado cambiado de ${oldVal} a ${newVal}`;
    if (field === 'severity') return `Severidad cambiada de ${oldVal} a ${newVal}`;
    if (field === 'assignee') return `Asignado a ${newVal}`;
    return `Campo ${field} modificado`;
  };

  if (loading) return <div>Cargando...</div>;
  if (!incident) return <div>Incidente no encontrado</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/incidents')}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Volver a Incidentes
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {incident.title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {incident.description}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
            incident.status === 'open' ? 'bg-red-50 text-red-700 ring-red-600/10' : 
            incident.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/10' : 
            'bg-green-50 text-green-700 ring-green-600/10'
          }`}>
            {incident.status === 'open' ? 'Abierto' : 
             incident.status === 'in_progress' ? 'En Progreso' : 'Cerrado'}
          </span>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Servidor</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {incident.server ? `${incident.server.name} (${incident.server.ip_address || 'Sin IP'})` : 'Servidor no encontrado'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Severidad</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{incident.severity}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Asignado a</dt>
              <dd className="mt-1 text-sm text-gray-900">{incident.assignee?.full_name || 'Sin asignar'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Detectado</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(new Date(incident.detected_at), 'PPpp', { locale: es })}
              </dd>
            </div>
            
            {/* Tags Section */}
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <TagIcon className="h-4 w-4 mr-1" />
                Etiquetas
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="flex flex-wrap gap-2">
                  {incident.Tags && incident.Tags.length > 0 ? (
                    incident.Tags.map(tag => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color, ringColor: `${tag.color}40` }}
                      >
                        {tag.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">Sin etiquetas</span>
                  )}
                </div>
              </dd>
            </div>

            {/* Attachments Section */}
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <PaperClipIcon className="h-4 w-4 mr-1" />
                  Archivos Adjuntos
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  {uploading ? 'Subiendo...' : 'Adjuntar'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </dt>
              <dd className="text-sm text-gray-900">
                <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                  {incident.Attachments && incident.Attachments.length > 0 ? (
                    incident.Attachments.map((attachment) => (
                      <li key={attachment.id} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                        <div className="flex w-0 flex-1 items-center">
                          <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                          <div className="ml-4 flex min-w-0 flex-1 gap-2 flex-col">
                            <span className="truncate font-medium">{attachment.filename}</span>
                            <span className="text-gray-500 text-xs">
                              {format(new Date(attachment.created_at), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            onClick={() => handleDownload(attachment.file_path, attachment.filename)}
                            className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                            Descargar
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-3 pl-3 pr-4 text-sm text-gray-500 italic">No hay archivos adjuntos</li>
                  )}
                </ul>
              </dd>
            </div>

            {/* Solutions Section */}
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 flex items-center mb-2">
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                Soluciones Propuestas
              </dt>
              <dd className="text-sm text-gray-900">
                <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                  {incident.Solutions && incident.Solutions.length > 0 ? (
                    incident.Solutions.map((solution) => (
                      <li key={solution.id} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                        <div className="flex w-0 flex-1 items-center">
                          <div className="ml-4 flex min-w-0 flex-1 gap-2 flex-col">
                            <span className="truncate font-medium">{solution.title}</span>
                            <span className="text-gray-500">{solution.description}</span>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          {solution.is_effective ? (
                            <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded-full">Efectiva</span>
                          ) : (
                            <span className="text-gray-500 text-xs">Pendiente</span>
                          )}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-3 pl-3 pr-4 text-sm text-gray-500 italic">No hay soluciones registradas</li>
                  )}
                </ul>
              </dd>
            </div>

            {/* History Section */}
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500 flex items-center mb-2">
                <ClockIcon className="h-4 w-4 mr-1" />
                Historial de Cambios
              </dt>
              <dd className="text-sm text-gray-900">
                <div className="flow-root">
                  <ul role="list" className="-mb-8">
                    {incident.IncidentHistories && incident.IncidentHistories.map((event, eventIdx) => (
                      <li key={event.id}>
                        <div className="relative pb-8">
                          {eventIdx !== incident.IncidentHistories!.length - 1 ? (
                            <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                                <ClockIcon className="h-5 w-5 text-white" aria-hidden="true" />
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {formatHistoryAction(event)} <span className="font-medium text-gray-900">por {event.User?.full_name}</span>
                                </p>
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                <time dateTime={event.changed_at}>
                                  {format(new Date(event.changed_at), 'MMM d, HH:mm', { locale: es })}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
