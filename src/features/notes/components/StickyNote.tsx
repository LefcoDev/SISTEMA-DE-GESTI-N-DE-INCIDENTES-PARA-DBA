import React from 'react';
import { Note, NoteColor } from '../types/note.types';
import { TrashIcon, PencilSquareIcon, MapPinIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { MapPinIcon as MapPinSolidIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { formatDate } from '../../../lib/dateUtils';

interface StickyNoteProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  onPin: (id: number) => void;
  onArchive: (id: number) => void;
}

const colorClasses: Record<NoteColor, string> = {
  yellow: 'bg-yellow-100 border-yellow-200 text-yellow-900',
  green: 'bg-green-100 border-green-200 text-green-900',
  blue: 'bg-blue-100 border-blue-200 text-blue-900',
  red: 'bg-red-100 border-red-200 text-red-900',
  purple: 'bg-purple-100 border-purple-200 text-purple-900',
  gray: 'bg-gray-100 border-gray-200 text-gray-900',
};

export const StickyNote: React.FC<StickyNoteProps> = ({ note, onEdit, onDelete, onPin, onArchive }) => {
  return (
    <div className={clsx(
      'relative p-4 rounded-lg shadow-md border transition-all duration-200 hover:shadow-lg flex flex-col h-64',
      colorClasses[note.color]
    )}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg truncate pr-8">{note.title}</h3>
        <button 
          onClick={() => onPin(note.id)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          title={note.is_pinned ? "Unpin" : "Pin"}
        >
          {note.is_pinned ? (
            <MapPinSolidIcon className="h-5 w-5 text-indigo-600" />
          ) : (
            <MapPinIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto mb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <p className="whitespace-pre-wrap text-sm">{note.content}</p>
      </div>

      {note.Tags && note.Tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {note.Tags.map(tag => (
            <span key={tag.id} className="px-1.5 py-0.5 rounded text-[10px] bg-black/10 text-black/70 font-medium">
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-2 border-t border-black/10 flex justify-between items-center text-xs text-gray-600">
        <span>{note.updated_at ? formatDate(new Date(note.updated_at), 'long') : 'No date'}</span>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(note)}
            className="p-1 hover:bg-black/10 rounded transition-colors"
            title="Edit"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onArchive(note.id)}
            className="p-1 hover:bg-black/10 rounded transition-colors"
            title="Archive"
          >
            <ArchiveBoxIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onDelete(note.id)}
            className="p-1 hover:bg-red-500/20 hover:text-red-700 rounded transition-colors"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Type Badge */}
      <div className="absolute bottom-14 right-4">
        <span className="px-2 py-1 rounded-full text-[10px] uppercase font-bold bg-white/50 border border-black/5">
          {note.type}
        </span>
      </div>
    </div>
  );
};
