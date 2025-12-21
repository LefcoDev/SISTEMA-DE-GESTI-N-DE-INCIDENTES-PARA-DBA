import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import MonacoEditor from 'react-monaco-editor';
import { scriptService, Script } from '../../services/script.service';

interface ScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  script: Script | null;
}

export default function ScriptModal({ isOpen, onClose, onSave, script }: ScriptModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: 'sql',
    code: '',
    category: 'maintenance',
    engine_compatible: '',
    parameters_description: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (script) {
      setFormData({
        name: script.name,
        description: script.description,
        language: script.language,
        code: script.code,
        category: script.category,
        engine_compatible: script.engine_compatible || '',
        parameters_description: script.parameters_description || '',
        tags: script.tags ? script.tags.map(t => t.name).join(', ') : ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        language: 'sql',
        code: '',
        category: 'maintenance',
        engine_compatible: '',
        parameters_description: '',
        tags: ''
      });
    }
  }, [script]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (script) {
        await scriptService.update(script.id, dataToSubmit as any);
      } else {
        await scriptService.create(dataToSubmit as any);
      }
      onSave();
    } catch (error) {
      console.error('Error saving script:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl sm:p-6">
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-6">
                    {script ? 'Editar Script' : 'Nuevo Script'}
                  </Dialog.Title>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Layout: Metadata (left) + Code Editor (right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left column: Metadata */}
                      <div className="lg:col-span-1 space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nombre *
                          </label>
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

                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Descripción *
                          </label>
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

                        <div>
                          <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                            Lenguaje
                          </label>
                          <select
                            id="language"
                            name="language"
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          >
                            <option value="sql">SQL</option>
                            <option value="bash">Bash</option>
                            <option value="powershell">PowerShell</option>
                            <option value="python">Python</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                            Categoría
                          </label>
                          <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          >
                            <option value="maintenance">Mantenimiento</option>
                            <option value="monitoring">Monitoreo</option>
                            <option value="backup">Backup</option>
                            <option value="performance">Rendimiento</option>
                            <option value="administration">Administración</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="engine_compatible" className="block text-sm font-medium text-gray-700">
                            Motor Compatible
                          </label>
                          <input
                            type="text"
                            name="engine_compatible"
                            id="engine_compatible"
                            value={formData.engine_compatible}
                            onChange={(e) => setFormData({ ...formData, engine_compatible: e.target.value })}
                            placeholder="ej. Oracle 19c, PostgreSQL 14"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          />
                        </div>

                        <div>
                          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                            Tags (separados por coma)
                          </label>
                          <input
                            type="text"
                            name="tags"
                            id="tags"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            placeholder="ej. backup, diario, critico"
                          />
                        </div>

                        <div>
                          <label htmlFor="parameters_description" className="block text-sm font-medium text-gray-700">
                            Parámetros
                          </label>
                          <textarea
                            name="parameters_description"
                            id="parameters_description"
                            rows={2}
                            value={formData.parameters_description}
                            onChange={(e) => setFormData({ ...formData, parameters_description: e.target.value })}
                            placeholder="Descripción de parámetros requeridos"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          />
                        </div>
                      </div>

                      {/* Right column: Code Editor */}
                      <div className="lg:col-span-2">
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                          Código *
                        </label>
                        <div className="border rounded-md overflow-hidden" style={{ height: '500px' }}>
                          <MonacoEditor
                            width="100%"
                            height="500"
                            language={
                              formData.language === 'bash' ? 'shell' : 
                              formData.language === 'powershell' ? 'powershell' : 
                              formData.language === 'python' ? 'python' : 'sql'
                            }
                            theme="vs-light"
                            value={formData.code}
                            options={{
                              selectOnLineNumbers: true,
                              minimap: { enabled: true },
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                              fontSize: 14,
                              lineNumbers: 'on',
                              renderWhitespace: 'selection',
                              wordWrap: 'on'
                            }}
                            onChange={(newValue) => setFormData({ ...formData, code: newValue })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50"
                      >
                        {loading ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                        onClick={onClose}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
