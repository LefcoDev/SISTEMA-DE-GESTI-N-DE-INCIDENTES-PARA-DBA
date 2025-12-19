import React from 'react';
import { KnowledgeTopic, KnowledgeTopicStatus } from '../types/knowledge.types';
import { BookOpenIcon, TagIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface TopicCardProps {
  topic: KnowledgeTopic;
  onEdit: (topic: KnowledgeTopic) => void;
  onDelete: (id: number) => void;
  onClick: (topic: KnowledgeTopic) => void;
}

const statusColors: Record<KnowledgeTopicStatus, string> = {
  'to_learn': 'bg-gray-100 text-gray-800',
  'in_progress': 'bg-blue-100 text-blue-800',
  'mastered': 'bg-green-100 text-green-800',
};

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onEdit, onDelete, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200 flex flex-col h-full"
      onClick={() => onClick(topic)}
    >
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <BookOpenIcon className="h-6 w-6" />
          </div>
          <span className={clsx("px-2 py-1 rounded-full text-xs font-medium uppercase", statusColors[topic.status])}>
            {topic.status.replace('_', ' ')}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{topic.title}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-3">{topic.description}</p>

        {topic.tags && topic.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {topic.tags.map((tag: string, index: number) => (
              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                <TagIcon className="h-3 w-3 mr-1 text-gray-400" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 rounded-b-lg flex justify-end space-x-2" onClick={e => e.stopPropagation()}>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(topic); }}
          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          title="Edit Topic"
        >
          <PencilSquareIcon className="h-5 w-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(topic.id); }}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Delete Topic"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
