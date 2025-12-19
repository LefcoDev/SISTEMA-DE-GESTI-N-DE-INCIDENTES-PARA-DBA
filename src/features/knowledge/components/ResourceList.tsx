import React from 'react';
import { KnowledgeResource, KnowledgeResourceType } from '../types/knowledge.types';
import { LinkIcon, DocumentIcon, VideoCameraIcon, BookOpenIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface ResourceListProps {
  resources: KnowledgeResource[];
  onDelete: (id: number) => void;
  onToggleComplete: (id: number) => void;
}

const typeIcons: Record<KnowledgeResourceType, React.ElementType> = {
  'documentation': DocumentIcon,
  'video': VideoCameraIcon,
  'course': BookOpenIcon,
  'article': DocumentIcon,
  'other': LinkIcon,
};

export const ResourceList: React.FC<ResourceListProps> = ({ resources, onDelete, onToggleComplete }) => {
  if (resources.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 italic">
        No resources added yet.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {resources.map((resource) => {
        const Icon = typeIcons[resource.type];
        return (
          <li key={resource.id} className="py-4 flex items-center justify-between group">
            <div className="flex items-start space-x-3 overflow-hidden">
              <div className={clsx("p-2 rounded-lg flex-shrink-0", resource.is_completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600")}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className={clsx("text-sm font-medium text-gray-900 truncate", resource.is_completed && "line-through text-gray-500")}>
                    {resource.title}
                  </h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                    {resource.type}
                  </span>
                </div>
                {resource.url && (
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-800 truncate block mt-1"
                  >
                    {resource.url}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onToggleComplete(resource.id)}
                className={clsx("p-1 rounded-full transition-colors", resource.is_completed ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:text-green-600 hover:bg-green-50")}
                title={resource.is_completed ? "Mark as Incomplete" : "Mark as Complete"}
              >
                <CheckCircleIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(resource.id)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete Resource"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
