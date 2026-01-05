import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { KnowledgeNugget, CreateNuggetDTO, NuggetCategory, ComplexityLevel } from '../../features/knowledge/types/knowledge.types';
import { knowledgeService } from '../../features/knowledge/services/knowledge.service';
import { KnowledgeNuggetList } from '../../features/knowledge/components/KnowledgeNuggetList';
import KnowledgeNuggetForm from '../../features/knowledge/components/KnowledgeNuggetForm';
import { useModal } from '../../context/ModalContext';

export const KnowledgeDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [nuggets, setNuggets] = useState<KnowledgeNugget[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNugget, setEditingNugget] = useState<KnowledgeNugget | null>(null);
  const [viewingNugget, setViewingNugget] = useState<KnowledgeNugget | null>(null);
  const [filterCategory, setFilterCategory] = useState<NuggetCategory | 'all'>('all');
  const [filterComplexity, setFilterComplexity] = useState<ComplexityLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { showModal } = useModal();

  useEffect(() => {
    loadNuggets();
  }, []);

  const loadNuggets = async () => {
    try {
      const data = await knowledgeService.getAll();
      setNuggets(data);
    } catch (error) {
      console.error('Failed to load nuggets:', error);
    }
  };

  const handleCreateNugget = async (data: CreateNuggetDTO) => {
    try {
      const newNugget = await knowledgeService.create(data);
      setNuggets([newNugget, ...nuggets]);
    } catch (error) {
      console.error('Failed to create nugget:', error);
    }
  };

  const handleUpdateNugget = async (data: CreateNuggetDTO) => {
    if (!editingNugget) return;
    try {
      const updated = await knowledgeService.update(editingNugget.id, data);
      setNuggets(nuggets.map(n => n.id === updated.id ? updated : n));
      setEditingNugget(null);
    } catch (error) {
      console.error('Failed to update nugget:', error);
    }
  };

  const handleDeleteNugget = async (id: number) => {
    showModal({
      type: 'confirm',
      title: 'Eliminar Knowledge Nugget',
      message: '¿Estás seguro de eliminar este nugget? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await knowledgeService.delete(id);
          setNuggets(nuggets.filter(n => n.id !== id));
          showModal({ type: 'success', title: 'Éxito', message: 'Nugget eliminado correctamente' });
        } catch (error) {
          console.error('Failed to delete nugget:', error);
          showModal({ type: 'error', title: 'Error', message: 'No se pudo eliminar el nugget' });
        }
      }
    });
  };

  const filteredNuggets = nuggets
    .filter(n => filterCategory === 'all' ? true : n.category === filterCategory)
    .filter(n => filterComplexity === 'all' ? true : n.complexity_level === filterComplexity)
    .filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.Tags?.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('knowledge.title')}</h1>
          <p className="text-sm text-gray-500">{t('knowledge.description')}</p>
        </div>
        <button
          onClick={() => {
            setEditingNugget(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          {t('knowledge.newEntry')}
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
        <div className="flex items-center text-gray-500">
          <FunnelIcon className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">{t('knowledge.filters')}:</span>
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as any)}
          className="block w-40 rounded-md border-gray-300 py-1.5 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border p-2"
        >
          <option value="all">{t('knowledge.allCategories')}</option>
          <option value="til">{t('knowledge.category.til')}</option>
          <option value="best_practice">{t('knowledge.category.bestPractice')}</option>
          <option value="gotcha">{t('knowledge.category.gotcha')}</option>
          <option value="quick_tip">{t('knowledge.category.quickTip')}</option>
          <option value="command_ref">{t('knowledge.category.commandRef')}</option>
          <option value="troubleshooting">{t('knowledge.category.troubleshooting')}</option>
        </select>

        <select
          value={filterComplexity}
          onChange={(e) => setFilterComplexity(e.target.value as any)}
          className="block w-40 rounded-md border-gray-300 py-1.5 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border p-2"
        >
          <option value="all">{t('knowledge.allLevels')}</option>
          <option value="beginner">{t('knowledge.complexity.beginner')}</option>
          <option value="intermediate">{t('knowledge.complexity.intermediate')}</option>
          <option value="advanced">{t('knowledge.complexity.advanced')}</option>
          <option value="expert">{t('knowledge.complexity.expert')}</option>
        </select>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('knowledge.searchPlaceholder')}
          className="block w-64 rounded-md border-gray-300 py-1.5 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border p-2"
        />
      </div>

      <KnowledgeNuggetList
        nuggets={filteredNuggets}
        onView={(n) => setViewingNugget(n)}
        onEdit={(n) => {
          setEditingNugget(n);
          setIsFormOpen(true);
        }}
        onDelete={handleDeleteNugget}
      />

      <KnowledgeNuggetForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingNugget(null);
        }}
        onSave={editingNugget ? handleUpdateNugget : handleCreateNugget}
        nugget={editingNugget}
      />

      {/* Modal para ver detalles del nugget */}
      {viewingNugget && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setViewingNugget(null)}></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold leading-6 text-gray-900" id="modal-title">
                          {viewingNugget.title}
                        </h3>
                        <div className="mt-2 flex gap-2 items-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            viewingNugget.complexity_level === 'beginner' ? 'bg-green-100 text-green-800' :
                            viewingNugget.complexity_level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                            viewingNugget.complexity_level === 'advanced' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {viewingNugget.complexity_level}
                          </span>
                          <span className="text-sm text-gray-500">{viewingNugget.technology} • {viewingNugget.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setViewingNugget(null)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <span className="text-2xl">&times;</span>
                      </button>
                    </div>
                    
                    <div className="mt-6 space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Contenido</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{viewingNugget.content}</p>
                      </div>

                      {viewingNugget.code_example && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Ejemplo de Código</h4>
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{viewingNugget.code_example}</code>
                          </pre>
                        </div>
                      )}

                      {viewingNugget.expected_result && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Resultado Esperado</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">{viewingNugget.expected_result}</p>
                        </div>
                      )}

                      {/* Información técnica */}
                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Información Técnica</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Tecnología:</span>
                            <span className="ml-2 font-medium text-gray-900">{viewingNugget.technology}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Complejidad:</span>
                            <span className="ml-2 font-medium text-gray-900">{viewingNugget.complexity_level}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Categoría:</span>
                            <span className="ml-2 font-medium text-gray-900">{viewingNugget.category}</span>
                          </div>
                          {viewingNugget.is_verified && (
                            <div>
                              <span className="text-green-600 font-medium">✓ Verificado</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Aplicable a */}
                      {viewingNugget.applicable_to && viewingNugget.applicable_to.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Aplicable a Versiones</h4>
                          <div className="flex flex-wrap gap-2">
                            {viewingNugget.applicable_to.map((version: string, idx: number) => (
                              <span key={idx} className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                {version}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Referencias externas */}
                      {viewingNugget.external_references && viewingNugget.external_references.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Referencias Externas</h4>
                          <ul className="space-y-2">
                            {viewingNugget.external_references.map((ref: string, idx: number) => (
                              <li key={idx}>
                                <a
                                  href={ref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-500 hover:underline text-sm break-all"
                                >
                                  🔗 {ref}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tags */}
                      {viewingNugget.Tags && viewingNugget.Tags.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {viewingNugget.Tags.map((tag) => (
                              <span key={tag.id} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                #{tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewingNugget(null);
                    setEditingNugget(viewingNugget);
                    setIsFormOpen(true);
                  }}
                  className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:w-auto"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setViewingNugget(null)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
