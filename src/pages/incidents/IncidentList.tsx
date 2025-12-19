import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import api from '../../lib/axios';
import IncidentModal from './IncidentModal';
import { useModal } from '../../context/ModalContext';

interface Incident {
  id: number;
  title: string;
  description: string;
  server_id: number;
  type: string;
  severity: string;
  status: string;
  detected_at: string;
  server?: {
    name: string;
  };
  assignee?: {
    full_name: string;
  };
}

export default function IncidentList() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const { showModal } = useModal();

  const fetchIncidents = async () => {
    try {
      const response = await api.get('/incidents');
      setIncidents(response.data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      showModal({ type: 'error', title: 'Error', message: 'Error al cargar los incidentes' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleCreate = () => {
    setSelectedIncident(null);
    setIsModalOpen(true);
  };

  const handleEdit = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    showModal({
      type: 'confirm',
      title: 'Eliminar Incidente',
      message: '¿Estás seguro de eliminar este incidente? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await api.delete(`/incidents/${id}`);
          fetchIncidents();
          showModal({ type: 'success', title: 'Éxito', message: 'Incidente eliminado correctamente' });
        } catch (error) {
          console.error('Error deleting incident:', error);
          showModal({ type: 'error', title: 'Error', message: 'No se pudo eliminar el incidente' });
        }
      }
    });
  };

  const handleSave = async (incidentData: any) => {
    try {
      if (selectedIncident) {
        await api.put(`/incidents/${selectedIncident.id}`, incidentData);
      } else {
        await api.post('/incidents', incidentData);
      }
      fetchIncidents();
    } catch (error) {
      console.error('Error saving incident:', error);
      throw error;
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Incidentes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de incidentes registrados en los servidores de base de datos.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={handleCreate}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="h-5 w-5 inline-block mr-1" />
            Nuevo Incidente
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Título
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Servidor
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Tipo
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Severidad
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Estado
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Fecha
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {incidents.map((incident) => (
                    <tr key={incident.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {incident.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {incident.server?.name || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {incident.type}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          incident.severity === 'critical' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                          incident.severity === 'high' ? 'bg-orange-50 text-orange-700 ring-orange-600/10' :
                          incident.severity === 'medium' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                          'bg-green-50 text-green-700 ring-green-600/20'
                        }`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          incident.status === 'new' ? 'bg-blue-50 text-blue-700 ring-blue-600/10' :
                          incident.status === 'in_progress' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                          incident.status === 'resolved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                          'bg-gray-50 text-gray-600 ring-gray-500/10'
                        }`}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(incident.detected_at).toLocaleString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => navigate(`/incidents/${incident.id}`)}
                          className="text-gray-600 hover:text-gray-900 mr-4"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Ver detalles, {incident.title}</span>
                        </button>
                        <button
                          onClick={() => handleEdit(incident)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <PencilSquareIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Editar, {incident.title}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(incident.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Eliminar, {incident.title}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <IncidentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        incident={selectedIncident}
      />
    </div>
  );
}
