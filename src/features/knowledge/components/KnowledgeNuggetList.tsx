import React from 'react';
import { KnowledgeNugget } from '../types/knowledge.types';
import { CheckBadgeIcon, CodeBracketIcon, BookOpenIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface KnowledgeNuggetListProps {
  nuggets: KnowledgeNugget[];
  onEdit: (nugget: KnowledgeNugget) => void;
  onDelete: (id: number) => void;
  onView: (nugget: KnowledgeNugget) => void;
}

const complexityColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-blue-100 text-blue-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800',
};

export const KnowledgeNuggetList: React.FC<KnowledgeNuggetListProps> = ({ nuggets, onEdit, onDelete, onView }) => {
  if (nuggets.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No nuggets found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new knowledge nugget.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {nuggets.map((nugget) => (
        <div
          key={nugget.id}
          className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${complexityColors[nugget.complexity_level]}`}>
                {nugget.complexity_level}
              </span>
              {nugget.is_verified && (
                <CheckBadgeIcon className="h-5 w-5 text-blue-500" title="Verified" />
              )}
            </div>
            
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {nugget.title}
            </h3>
            
            <p className="mt-1 text-sm text-gray-500 line-clamp-3">
              {nugget.content}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {nugget.Tags?.map((tag) => (
                <span key={tag.id} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {nugget.technology} • {nugget.category}
              {nugget.code_example && (
                <CodeBracketIcon className="inline-block ml-2 h-4 w-4 text-gray-400" title="Has code example" />
              )}
            </div>
            <div className="flex gap-2 relative z-10">
              <button
                onClick={() => onView(nugget)}
                className="text-blue-600 hover:text-blue-900"
                title="Ver detalles"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(nugget)}
                className="text-indigo-600 hover:text-indigo-900"
                title="Editar"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(nugget.id)}
                className="text-red-600 hover:text-red-900"
                title="Eliminar"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
