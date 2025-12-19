import React from 'react';
import { JournalEntry } from '../types/journal.types';
import { CalendarIcon, ClockIcon, TagIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: number) => void;
}

const moodEmojis: Record<string, string> = {
  'great': '😄',
  'good': '🙂',
  'neutral': '😐',
  'bad': '🙁',
  'terrible': '😫',
};

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {entry.entry_date ? format(new Date(entry.entry_date), 'PPPP') : 'No date'}
            </h3>
            <div className="flex items-center text-sm text-gray-500 space-x-3">
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {entry.time_tracked_minutes} mins
              </span>
              {entry.mood && (
                <span className="flex items-center" title={`Mood: ${entry.mood}`}>
                  {moodEmojis[entry.mood] || '😐'}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            title="Edit Entry"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete Entry"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {entry.what_i_did && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">What I Did</h4>
            <p className="text-gray-700 text-sm line-clamp-3 whitespace-pre-wrap">{entry.what_i_did}</p>
          </div>
        )}
        
        {entry.what_i_learned && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Learned</h4>
            <p className="text-gray-700 text-sm line-clamp-2">{entry.what_i_learned}</p>
          </div>
        )}
      </div>

      {entry.daily_tags && entry.daily_tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          {entry.daily_tags.map((tag, index) => (
            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              <TagIcon className="h-3 w-3 mr-1 text-gray-400" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
