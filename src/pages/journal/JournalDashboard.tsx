import React, { useEffect, useState } from 'react';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { JournalEntry, CreateJournalEntryDTO } from '../../features/journal/types/journal.types';
import { journalService } from '../../features/journal/services/journal.service';
import { JournalEntryCard } from '../../features/journal/components/JournalEntryCard';
import { JournalEntryForm } from '../../features/journal/components/JournalEntryForm';

export const JournalDashboard: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await journalService.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Failed to load journal entries:', error);
    }
  };

  const handleCreate = async (data: CreateJournalEntryDTO) => {
    try {
      const newEntry = await journalService.createOrUpdate(data);
      setEntries([newEntry, ...entries]);
    } catch (error) {
      console.error('Failed to create journal entry:', error);
    }
  };

  const handleUpdate = async (data: CreateJournalEntryDTO) => {
    if (!editingEntry) return;
    try {
      const updated = await journalService.createOrUpdate(data);
      setEntries(entries.map(e => e.id === updated.id ? updated : e));
      setEditingEntry(null);
    } catch (error) {
      console.error('Failed to update journal entry:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await journalService.delete(id);
      setEntries(entries.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
    }
  };

  const filteredEntries = entries
    .filter(e => 
      e.what_i_did?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.what_i_learned?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.daily_tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Journal</h1>
          <p className="text-sm text-gray-500">Record your daily progress and learnings</p>
        </div>
        <button
          onClick={() => {
            setEditingEntry(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Entry
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
        <div className="flex items-center text-gray-500">
          <FunnelIcon className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Search:</span>
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entries..."
          className="block w-full max-w-md rounded-md border-gray-300 py-1.5 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border p-2"
        />
      </div>

      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No journal entries found.</p>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onEdit={(e) => {
                setEditingEntry(e);
                setIsFormOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <JournalEntryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={editingEntry ? handleUpdate : handleCreate}
        initialData={editingEntry}
      />
    </div>
  );
};
