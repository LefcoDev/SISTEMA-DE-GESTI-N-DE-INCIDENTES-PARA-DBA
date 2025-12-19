import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import api from '../../lib/axios';
import { Script } from '../../services/script.service';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface Server {
  id: number;
  name: string;
  host: string;
  engine_type: string;
}

interface ScriptExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script | null;
}

export default function ScriptExecutionModal({ isOpen, onClose, script }: ScriptExecutionModalProps) {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<number>(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await api.get('/servers');
        setServers(response.data);
        if (response.data.length > 0) {
          setSelectedServer(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching servers:', error);
      }
    };
    if (isOpen) {
      fetchServers();
      setResults(null);
      setError(null);
      setPassword('');
    }
  }, [isOpen]);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!script || !selectedServer) return;

    // Safety check for destructive commands
    const destructivePatterns = [
      /\bDROP\b/i,
      /\bTRUNCATE\b/i,
      /\bDELETE\b/i,
      /\bUPDATE\b/i,
      /\bALTER\b/i,
      /\bCREATE\b/i
    ];

    const isDestructive = destructivePatterns.some(pattern => pattern.test(script.code));

    if (isDestructive) {
      const confirmed = window.confirm(
        'ADVERTENCIA: Este script contiene comandos que podrían modificar o eliminar datos (DDL/DML).\n\n¿Está seguro de que desea ejecutarlo en el servidor seleccionado?'
      );
      if (!confirmed) return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await api.post(`/scripts/${script.id}/execute`, {
        serverId: selectedServer,
        username,
        password
      });
      setResults(response.data.results);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error executing script');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!results || !Array.isArray(results)) return;
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    const excelBuffer = XLSX.write(workbook, { bookType: 'csv', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'text/csv;charset=utf-8' });
    saveAs(data, `script_results_${new Date().getTime()}.csv`);
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Ejecutar Script: {script?.name}
                    </Dialog.Title>
                    
                    <div className="mt-4">
                      <form onSubmit={handleExecute} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Servidor</label>
                          <select
                            value={selectedServer}
                            onChange={(e) => setSelectedServer(Number(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          >
                            {servers.map((server) => (
                              <option key={server.id} value={server.id}>
                                {server.name} ({server.host}) - {server.engine_type}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Usuario DB</label>
                            <input
                              type="text"
                              required
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Contraseña DB</label>
                            <input
                              type="password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:w-auto"
                          >
                            {loading ? 'Ejecutando...' : (
                              <>
                                <PlayIcon className="h-5 w-5 mr-2" />
                                Ejecutar
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>

                    {error && (
                      <div className="mt-4 rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error de ejecución</h3>
                            <div className="mt-2 text-sm text-red-700">{error}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {results && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            Resultados {Array.isArray(results) ? `(${results.length} filas)` : ''}
                          </h4>
                          {Array.isArray(results) && results.length > 0 && (
                            <button
                              type="button"
                              onClick={exportToCSV}
                              className="inline-flex items-center rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                              <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                              Exportar CSV
                            </button>
                          )}
                        </div>
                        
                        {Array.isArray(results) && results.length > 0 ? (
                          <div className="overflow-auto max-h-60 border rounded-md">
                            <table className="min-w-full divide-y divide-gray-300">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  {Object.keys(results[0]).map(key => (
                                    <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                      {key}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((row: any, i: number) => (
                                  <tr key={i}>
                                    {Object.values(row).map((val: any, j) => (
                                      <td key={j} className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                        {val === null ? 'NULL' : String(val)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-60">
                            <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                              {JSON.stringify(results, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
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
