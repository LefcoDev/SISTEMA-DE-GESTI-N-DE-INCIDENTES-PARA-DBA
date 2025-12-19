import { useEffect, useState } from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, CodeBracketIcon, PlayIcon } from '@heroicons/react/24/outline';
import { scriptService, Script } from '../../services/script.service';
import ScriptModal from './ScriptModal';
import ScriptExecutionModal from './ScriptExecutionModal';
import { useModal } from '../../context/ModalContext';

export default function ScriptList() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [scriptToExecute, setScriptToExecute] = useState<Script | null>(null);
  const { showModal } = useModal();

  const fetchScripts = async () => {
    try {
      const data = await scriptService.getAll();
      setScripts(data);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      showModal({ type: 'error', title: 'Error', message: 'Error al cargar los scripts' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const handleCreate = () => {
    setSelectedScript(null);
    setIsModalOpen(true);
  };

  const handleEdit = (script: Script) => {
    setSelectedScript(script);
    setIsModalOpen(true);
  };

  const handleExecute = (script: Script) => {
    setScriptToExecute(script);
    setIsExecutionModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    showModal({
      type: 'confirm',
      title: 'Eliminar Script',
      message: '¿Estás seguro de eliminar este script? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await scriptService.delete(id);
          fetchScripts();
          showModal({ type: 'success', title: 'Éxito', message: 'Script eliminado correctamente' });
        } catch (error) {
          console.error('Error deleting script:', error);
          showModal({ type: 'error', title: 'Error', message: 'No se pudo eliminar el script' });
        }
      }
    });
  };

  const handleSave = () => {
    setIsModalOpen(false);
    fetchScripts();
  };

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'sql': return 'bg-blue-100 text-blue-800';
      case 'bash': return 'bg-gray-100 text-gray-800';
      case 'powershell': return 'bg-blue-900 text-white';
      case 'python': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-4">Cargando scripts...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Scripts</h1>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Script
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {scripts.map((script) => (
            <li key={script.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CodeBracketIcon className="h-6 w-6 text-gray-400 mr-3" />
                    <p className="text-sm font-medium text-indigo-600 truncate">{script.name}</p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLanguageColor(script.language)}`}>
                      {script.language}
                    </span>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {script.category}
                    </span>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                      Uso: {script.usage_count}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {script.description}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <button
                      onClick={() => handleExecute(script)}
                      className="text-green-600 hover:text-green-900 mr-4"
                      title="Ejecutar"
                    >
                      <PlayIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(script)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(script.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {scripts.length === 0 && (
            <li className="px-4 py-8 text-center text-gray-500">
              No hay scripts registrados
            </li>
          )}
        </ul>
      </div>

      {isModalOpen && (
        <ScriptModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          script={selectedScript}
        />
      )}

      {isExecutionModalOpen && (
        <ScriptExecutionModal
          isOpen={isExecutionModalOpen}
          onClose={() => setIsExecutionModalOpen(false)}
          script={scriptToExecute}
        />
      )}
    </div>
  );
}
