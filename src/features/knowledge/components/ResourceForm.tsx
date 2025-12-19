import React, { useState } from 'react';
import { CreateResourceDto, KnowledgeResourceType } from '../types/knowledge.types';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ResourceFormProps {
  topicId: number;
  onSubmit: (data: CreateResourceDto) => void;
}

const types: { value: KnowledgeResourceType; label: string }[] = [
  { value: 'documentation', label: 'Documentation' },
  { value: 'video', label: 'Video' },
  { value: 'course', label: 'Course' },
  { value: 'article', label: 'Article' },
  { value: 'other', label: 'Other' },
];

export const ResourceForm: React.FC<ResourceFormProps> = ({ topicId, onSubmit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<KnowledgeResourceType>('documentation');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      topic_id: topicId,
      title,
      url: url || undefined,
      type,
    });
    setTitle('');
    setUrl('');
    setType('documentation');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center text-sm font-medium"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Add Resource
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700">Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          placeholder="Resource title"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as KnowledgeResourceType)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          >
            {types.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">URL (Optional)</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
        >
          Add Resource
        </button>
      </div>
    </form>
  );
};
