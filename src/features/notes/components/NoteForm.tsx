import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Note, CreateNoteDTO, NoteColor, NoteType, NotePriority } from '../types/note.types';

interface NoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: CreateNoteDTO) => Promise<void>;
  note?: Note | null;
}

const initialNote: CreateNoteDTO = {
  title: '',
  content: '',
  color: 'yellow',
  type: 'personal',
  priority: 'medium',
  is_private: true,
  tags: []
};

const colors: { value: NoteColor; label: string; bg: string }[] = [
  { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-200' },
  { value: 'green', label: 'Green', bg: 'bg-green-200' },
  { value: 'blue', label: 'Blue', bg: 'bg-blue-200' },
  { value: 'red', label: 'Red', bg: 'bg-red-200' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-200' },
  { value: 'gray', label: 'Gray', bg: 'bg-gray-200' },
];

export default function NoteForm({ isOpen, onClose, onSave, note }: NoteFormProps) {
  const [formData, setFormData] = useState<CreateNoteDTO>(initialNote);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        color: note.color,
        type: note.type,
        priority: note.priority,
        is_private: note.is_private,
        server_id: note.server_id,
        incident_id: note.incident_id,
        script_id: note.script_id,
        tags: note.Tags?.map(t => t.name) || []
      });
    } else {
      setFormData(initialNote);
    }
  }, [note, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
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

                <div className="sm:flex sm:items-start w-full">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      {note ? 'Edit Note' : 'New Sticky Note'}
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
                          placeholder="Note title..."
                        />
                      </div>

                      {/* Content */}
                      <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                        <textarea
                          name="content"
                          id="content"
                          required
                          rows={5}
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          placeholder="Write your note here..."
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

                      {/* Color Picker */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                        <div className="flex space-x-3">
                          {colors.map((c) => (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, color: c.value })}
                              className={`w-8 h-8 rounded-full ${c.bg} border-2 ${
                                formData.color === c.value ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-transparent'
                              }`}
                              title={c.label}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Type */}
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                          <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as NoteType })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          >
                            <option value="personal">Personal</option>
                            <option value="global">Global</option>
                            <option value="server">Server</option>
                            <option value="incident">Incident</option>
                            <option value="script">Script</option>
                            <option value="shared">Shared</option>
                          </select>
                        </div>

                        {/* Priority */}
                        <div>
                          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                          <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as NotePriority })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                      </div>

                      {/* Private Toggle */}
                      <div className="flex items-center">
                        <input
                          id="is_private"
                          name="is_private"
                          type="checkbox"
                          checked={formData.is_private}
                          onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="is_private" className="ml-2 block text-sm text-gray-900">
                          Private Note
                        </label>
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
