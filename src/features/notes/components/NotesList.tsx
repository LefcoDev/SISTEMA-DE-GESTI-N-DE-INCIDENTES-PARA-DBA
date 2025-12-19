import React from 'react';
import { Note } from '../types/note.types';
import { StickyNote } from './StickyNote';

interface NotesListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
  onPin: (id: number) => void;
  onArchive: (id: number) => void;
}

export const NotesList: React.FC<NotesListProps> = ({ notes, onEdit, onDelete, onPin, onArchive }) => {
  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No notes found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {notes.map((note) => (
        <StickyNote
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onPin={onPin}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
};
