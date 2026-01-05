import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab } from '@headlessui/react';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
import api from '../../lib/axios';
import ServerModal from './ServerModal';
import { useModal } from '../../context/ModalContext';

interface Server {
  id: number;
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
}

export default function ServerList() {
  const { t } = useTranslation();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const { showModal } = useModal();

  const DB_ENGINES = ['mysql', 'postgresql', 'sqlserver', 'oracle', 'mongodb'];

  const filteredServers = servers.filter(s => {
    const isDb = DB_ENGINES.includes(s.engine_type.toLowerCase());
    return selectedTab === 0 ? !isDb : isDb;
  });

  const fetchServers = async () => {
    try {
      const response = await api.get('/servers');
      setServers(response.data);
    } catch (error) {
      console.error('Error fetching servers:', error);
      showModal({ type: 'error', title: t('common.error'), message: t('servers.errorLoading') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleCreate = () => {
    setSelectedServer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (server: Server) => {
    setSelectedServer(server);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    showModal({
      type: 'confirm',
      title: 'Eliminar Servidor',
      message: '¿Estás seguro de eliminar este servidor? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await api.delete(`/servers/${id}`);
          fetchServers();
          showModal({ type: 'success', title: 'Éxito', message: 'Servidor eliminado correctamente' });
        } catch (error) {
          console.error('Error deleting server:', error);
          showModal({ type: 'error', title: 'Error', message: 'No se pudo eliminar el servidor' });
        }
      }
    });
  };

  const handleSave = async (serverData: any) => {
    try {
      if (selectedServer) {
        await api.put(`/servers/${selectedServer.id}`, serverData);
      } else {
        await api.post('/servers', serverData);
      }
      fetchServers();
    } catch (error) {
      console.error('Error saving server:', error);
      throw error;
    }
  };

  if (loading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">{t('servers.title')}</h1>
          <p className="mt-2 text-sm text-gray-700">
            {t('servers.description')}
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={handleCreate}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="h-5 w-5 inline-block mr-1" />
            {selectedTab === 0 ? t('servers.newServer') : t('servers.newServer')}
          </button>
        </div>
      </div>
      <div className="mt-8">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-4">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-600 hover:bg-white/[0.5] hover:text-blue-800'
                )
              }
            >
              {t('servers.title')}
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-600 hover:bg-white/[0.5] hover:text-blue-800'
                )
              }
            >
              {t('servers.database')}
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">{t('servers.fields.name')}</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('servers.fields.host')}</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('servers.operatingSystem')}</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('servers.environment')}</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('servers.status')}</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">{t('servers.actions')}</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredServers.map((server) => (
                      <tr key={server.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{server.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{server.host}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{server.engine_type} {server.engine_version}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            server.environment === 'production' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                            server.environment === 'staging' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                            'bg-green-50 text-green-700 ring-green-600/20'
                          }`}>{server.environment}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            server.status === 'active' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                            server.status === 'maintenance' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                            'bg-gray-50 text-gray-600 ring-gray-500/10'
                          }`}>{server.status}</span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button onClick={() => handleEdit(server)} className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilSquareIcon className="h-5 w-5" /></button>
                          <button onClick={() => handleDelete(server.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">{t('servers.fields.name')}</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('servers.fields.engineType')}</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('servers.fields.port')}</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('servers.status')}</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">{t('servers.actions')}</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredServers.map((server) => (
                      <tr key={server.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{server.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{server.engine_type} {server.engine_version}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{server.port}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            server.status === 'active' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                            server.status === 'maintenance' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                            'bg-gray-50 text-gray-600 ring-gray-500/10'
                          }`}>{server.status}</span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button onClick={() => handleEdit(server)} className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilSquareIcon className="h-5 w-5" /></button>
                          <button onClick={() => handleDelete(server.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
      <ServerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={selectedTab === 0 ? 'SERVER' : 'DATABASE'}
        onSave={handleSave}
        server={selectedServer}
      />
    </div>
  );
}
