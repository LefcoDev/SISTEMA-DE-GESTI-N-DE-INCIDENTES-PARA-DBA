import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { notesService } from '../../features/notes/services/notes.service';
import { Note, CreateNoteDTO, NoteFilters } from '../../features/notes/types/note.types';
import { NotesList } from '../../features/notes/components/NotesList';
import NoteForm from '../../features/notes/components/NoteForm';
import { useModal } from '../../context/ModalContext';

export default function NotesDashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [filters, setFilters] = useState<NoteFilters>({ is_archived: false });
  const { showModal } = useModal();

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await notesService.getAll(filters);
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [filters]); // Re-fetch when filters change

  const handleCreate = () => {
    setSelectedNote(null);
    setIsFormOpen(true);
  };

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setIsFormOpen(true);
  };

  const handleSave = async (noteData: CreateNoteDTO) => {
    try {
      if (selectedNote) {
        await notesService.update(selectedNote.id, noteData);
      } else {
        await notesService.create(noteData);
      }
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  };

  const handleDelete = (id: number) => {
    showModal({
      title: 'Delete Note',
      message: 'Are you sure you want to delete this note? This action cannot be undone.',
      type: 'error',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await notesService.delete(id);
          fetchNotes();
        } catch (error) {
          console.error('Error deleting note:', error);
        }
      }
    });
  };

  const handlePin = async (id: number) => {
    try {
      await notesService.togglePin(id);
      fetchNotes();
    } catch (error) {
      console.error('Error pinning note:', error);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await notesService.toggleArchive(id);
      fetchNotes();
    } catch (error) {
      console.error('Error archiving note:', error);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">My Notes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your sticky notes, ideas, and reminders.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={handleCreate}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="h-5 w-5 inline-block mr-1" />
            New Note
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search notes..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700">Show Archived:</label>
          <input
            type="checkbox"
            checked={filters.is_archived}
            onChange={(e) => setFilters({ ...filters, is_archived: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mt-8">
        {loading ? (
          <div className="text-center py-12">Loading notes...</div>
        ) : (
          <NotesList
            notes={notes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPin={handlePin}
            onArchive={handleArchive}
          />
        )}
      </div>

      <NoteForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        note={selectedNote}
      />
    </div>
  );
}
