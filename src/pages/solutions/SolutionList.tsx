import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { solutionService, Solution } from '../../services/solution.service';
import { MagnifyingGlassIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useModal } from '../../context/ModalContext';

export default function SolutionList() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'solution' | 'template'>('all');
  const { showModal } = useModal();

  useEffect(() => {
    loadSolutions();
  }, []);

  const loadSolutions = async () => {
    try {
      const data = await solutionService.getAll();
      setSolutions(data);
    } catch (error) {
      console.error('Error loading solutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    showModal({
      type: 'confirm',
      title: 'Eliminar Solución',
      message: '¿Estás seguro de eliminar esta solución? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await solutionService.delete(id);
          setSolutions(solutions.filter(s => s.id !== id));
          showModal({ type: 'success', title: 'Éxito', message: 'Solución eliminada correctamente' });
        } catch (error) {
          console.error('Error deleting solution:', error);
          showModal({ type: 'error', title: 'Error', message: 'No se pudo eliminar la solución' });
        }
      }
    });
  };

  const filteredSolutions = solutions.filter(solution => {
    const matchesSearch = 
      solution.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solution.template_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solution.incident?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterType === 'template') return solution.is_template;
    if (filterType === 'solution') return !solution.is_template;
    return true;
  });

  if (loading) {
    return <div className="p-4">Cargando soluciones...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Soluciones</h1>
          <p className="mt-2 text-sm text-gray-700">
            Registro de soluciones aplicadas a incidentes y base de conocimiento.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            to="/solutions/new"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Nueva Solución
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative rounded-md shadow-sm max-w-md flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Buscar soluciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-10 ${
              filterType === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFilterType('solution')}
            className={`relative -ml-px inline-flex items-center px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-10 ${
              filterType === 'solution' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'
            }`}
          >
            Soluciones
          </button>
          <button
            type="button"
            onClick={() => setFilterType('template')}
            className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-10 ${
              filterType === 'template' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'
            }`}
          >
            Plantillas
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Descripción
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Incidente
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Tipo
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Aplicado por
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Fecha
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSolutions.map((solution) => (
                  <tr key={solution.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {solution.template_name || (solution.description.length > 50 ? solution.description.substring(0, 50) + '...' : solution.description)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {solution.incident?.title || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {solution.is_template ? (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Plantilla
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          Solución
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {solution.applicator?.full_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(solution.applied_at).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <div className="flex justify-end gap-3">
                        <Link to={`/solutions/${solution.id}`} className="text-indigo-600 hover:text-indigo-900" title="Ver">
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link to={`/solutions/${solution.id}/edit`} className="text-indigo-600 hover:text-indigo-900" title="Editar">
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(solution.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
