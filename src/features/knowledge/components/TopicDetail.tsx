import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { KnowledgeTopic, KnowledgeResource, CreateResourceDto } from '../types/knowledge.types';
import { ResourceList } from './ResourceList';
import { ResourceForm } from './ResourceForm';

interface TopicDetailProps {
  isOpen: boolean;
  onClose: () => void;
  topic: KnowledgeTopic | null;
  resources: KnowledgeResource[];
  onAddResource: (data: CreateResourceDto) => void;
  onDeleteResource: (id: number) => void;
  onToggleResource: (id: number) => void;
}

export const TopicDetail: React.FC<TopicDetailProps> = ({ 
  isOpen, 
  onClose, 
  topic, 
  resources, 
  onAddResource, 
  onDeleteResource, 
  onToggleResource 
}) => {
  if (!topic) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900">
                    {topic.title}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-500">{topic.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {topic.tags?.map((tag: string, idx: number) => (
                      <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Resources</h4>
                  
                  <div className="mb-4">
                    <ResourceForm topicId={topic.id} onSubmit={onAddResource} />
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    <ResourceList 
                      resources={resources} 
                      onDelete={onDeleteResource}
                      onToggleComplete={onToggleResource}
                    />
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
