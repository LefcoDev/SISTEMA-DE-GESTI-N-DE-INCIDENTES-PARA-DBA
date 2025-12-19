import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CreateNuggetDTO, KnowledgeNugget, NuggetCategory, ComplexityLevel } from '../types/knowledge.types';

interface KnowledgeNuggetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nugget: CreateNuggetDTO) => Promise<void>;
  nugget?: KnowledgeNugget | null;
}

const initialNugget: CreateNuggetDTO = {
  title: '',
  category: 'til',
  content: '',
  code_example: '',
  expected_result: '',
  technology: '',
  complexity_level: 'beginner',
  external_references: [],
  applicable_to: [],
  tags: []
};

const categories: { value: NuggetCategory; label: string }[] = [
  { value: 'til', label: 'Today I Learned' },
  { value: 'best_practice', label: 'Best Practice' },
  { value: 'gotcha', label: 'Gotcha / Warning' },
  { value: 'quick_tip', label: 'Quick Tip' },
  { value: 'command_ref', label: 'Command Reference' },
  { value: 'troubleshooting', label: 'Troubleshooting' },
];

const complexityLevels: { value: ComplexityLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export default function KnowledgeNuggetForm({ isOpen, onClose, onSave, nugget }: KnowledgeNuggetFormProps) {
  const [formData, setFormData] = useState<CreateNuggetDTO>(initialNugget);
  const [loading, setLoading] = useState(false);
  const [newReference, setNewReference] = useState('');
  const [newApplicable, setNewApplicable] = useState('');

  useEffect(() => {
    if (nugget) {
      // Parse JSON fields if they come as strings from the database
      const parseJsonField = (field: any): string[] => {
        if (Array.isArray(field)) return field;
        if (typeof field === 'string') {
          try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      };

      setFormData({
        title: nugget.title,
        category: nugget.category,
        content: nugget.content,
        code_example: nugget.code_example || '',
        expected_result: nugget.expected_result || '',
        technology: nugget.technology,
        complexity_level: nugget.complexity_level,
        external_references: parseJsonField(nugget.external_references),
        applicable_to: parseJsonField(nugget.applicable_to),
        tags: nugget.Tags?.map(t => t.name) || [],
        incident_id: nugget.incident_id
      });
    } else {
      setFormData(initialNugget);
    }
  }, [nugget, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
      setFormData(initialNugget);
    } catch (error) {
      console.error('Error saving nugget:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReference = () => {
    if (newReference.trim()) {
      setFormData({
        ...formData,
        external_references: [...(formData.external_references || []), newReference.trim()]
      });
      setNewReference('');
    }
  };

  const removeReference = (index: number) => {
    const newRefs = [...(formData.external_references || [])];
    newRefs.splice(index, 1);
    setFormData({ ...formData, external_references: newRefs });
  };

  const addApplicable = () => {
    if (newApplicable.trim()) {
      setFormData({
        ...formData,
        applicable_to: [...(formData.applicable_to || []), newApplicable.trim()]
      });
      setNewApplicable('');
    }
  };

  const removeApplicable = (index: number) => {
    const newApps = [...(formData.applicable_to || [])];
    newApps.splice(index, 1);
    setFormData({ ...formData, applicable_to: newApps });
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
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start w-full">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      {nugget ? 'Edit Knowledge Nugget' : 'New Knowledge Nugget'}
                    </Dialog.Title>
                    
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      {/* Title */}
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          type="text"
                          name="title"
                          id="title"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          placeholder="How to fix ORA-00600..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Category */}
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                          <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as NuggetCategory })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          >
                            {categories.map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Complexity */}
                        <div>
                          <label htmlFor="complexity" className="block text-sm font-medium text-gray-700">Complexity</label>
                          <select
                            id="complexity"
                            name="complexity"
                            value={formData.complexity_level}
                            onChange={(e) => setFormData({ ...formData, complexity_level: e.target.value as ComplexityLevel })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          >
                            {complexityLevels.map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Technology */}
                      <div>
                        <label htmlFor="technology" className="block text-sm font-medium text-gray-700">Technology</label>
                        <input
                          type="text"
                          name="technology"
                          id="technology"
                          required
                          value={formData.technology}
                          onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          placeholder="Oracle 19c, PostgreSQL 14, Linux..."
                        />
                      </div>

                      {/* Content */}
                      <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                        <textarea
                          name="content"
                          id="content"
                          required
                          rows={4}
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          placeholder="Explain the concept or solution..."
                        />
                      </div>

                      {/* Code Example */}
                      <div>
                        <label htmlFor="code_example" className="block text-sm font-medium text-gray-700">Code Example (Optional)</label>
                        <textarea
                          name="code_example"
                          id="code_example"
                          rows={3}
                          value={formData.code_example}
                          onChange={(e) => setFormData({ ...formData, code_example: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 font-mono bg-gray-50"
                          placeholder="SELECT * FROM..."
                        />
                      </div>

                      {/* Expected Result */}
                      <div>
                        <label htmlFor="expected_result" className="block text-sm font-medium text-gray-700">Expected Result (Optional)</label>
                        <textarea
                          name="expected_result"
                          id="expected_result"
                          rows={2}
                          value={formData.expected_result}
                          onChange={(e) => setFormData({ ...formData, expected_result: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 font-mono bg-gray-50"
                          placeholder="Output or behavior..."
                        />
                      </div>

                      {/* Tags */}
                      <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                        <input
                          type="text"
                          name="tags"
                          id="tags"
                          value={formData.tags?.join(', ') || ''}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          placeholder="Comma separated tags..."
                        />
                      </div>

                      {/* External References */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">External References</label>
                        <div className="flex mt-1">
                          <input
                            type="text"
                            value={newReference}
                            onChange={(e) => setNewReference(e.target.value)}
                            className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            placeholder="https://docs.oracle.com/..."
                          />
                          <button
                            type="button"
                            onClick={addReference}
                            className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm hover:bg-gray-100"
                          >
                            <PlusIcon className="h-5 w-5" />
                          </button>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {formData.external_references?.map((ref, idx) => (
                            <li key={idx} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-1 rounded">
                              <span className="truncate">{ref}</span>
                              <button type="button" onClick={() => removeReference(idx)} className="text-red-500 hover:text-red-700">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Applicable To */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Applicable To (Versions/Systems)</label>
                        <div className="flex mt-1">
                          <input
                            type="text"
                            value={newApplicable}
                            onChange={(e) => setNewApplicable(e.target.value)}
                            className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            placeholder="v19c, Prod, Linux..."
                          />
                          <button
                            type="button"
                            onClick={addApplicable}
                            className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm hover:bg-gray-100"
                          >
                            <PlusIcon className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.applicable_to?.map((app, idx) => (
                            <span key={idx} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                              {app}
                              <button type="button" onClick={() => removeApplicable(idx)} className="ml-1 text-blue-600 hover:text-blue-800">
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
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
