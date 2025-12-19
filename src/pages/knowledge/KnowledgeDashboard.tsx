import React, { useEffect, useState } from 'react';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { KnowledgeNugget, CreateNuggetDTO, NuggetCategory, ComplexityLevel } from '../../features/knowledge/types/knowledge.types';
import { knowledgeService } from '../../features/knowledge/services/knowledge.service';
import { KnowledgeNuggetList } from '../../features/knowledge/components/KnowledgeNuggetList';
import KnowledgeNuggetForm from '../../features/knowledge/components/KnowledgeNuggetForm';

export const KnowledgeDashboard: React.FC = () => {
  const [nuggets, setNuggets] = useState<KnowledgeNugget[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNugget, setEditingNugget] = useState<KnowledgeNugget | null>(null);
  const [filterCategory, setFilterCategory] = useState<NuggetCategory | 'all'>('all');
  const [filterComplexity, setFilterComplexity] = useState<ComplexityLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    if (!window.confirm('Are you sure you want to delete this nugget?')) return;
    try {
      await knowledgeService.delete(id);
      setNuggets(nuggets.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete nugget:', error);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-sm text-gray-500">Capture and share knowledge nuggets</p>
        </div>
        <button
          onClick={() => {
            setEditingNugget(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Nugget
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
        <div className="flex items-center text-gray-500">
          <FunnelIcon className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as any)}
          className="block w-40 rounded-md border-gray-300 py-1.5 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border p-2"
        >
          <option value="all">All Categories</option>
          <option value="til">Today I Learned</option>
          <option value="best_practice">Best Practice</option>
          <option value="gotcha">Gotcha</option>
          <option value="quick_tip">Quick Tip</option>
          <option value="command_ref">Command Ref</option>
          <option value="troubleshooting">Troubleshooting</option>
        </select>

        <select
          value={filterComplexity}
          onChange={(e) => setFilterComplexity(e.target.value as any)}
          className="block w-40 rounded-md border-gray-300 py-1.5 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border p-2"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search nuggets or tags..."
          className="block w-64 rounded-md border-gray-300 py-1.5 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border p-2"
        />
      </div>

      <KnowledgeNuggetList
        nuggets={filteredNuggets}
        onEdit={(n) => {
          setEditingNugget(n);
          setIsFormOpen(true);
        }}
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
    </div>
  );
};
