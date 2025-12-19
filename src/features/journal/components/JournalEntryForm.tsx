import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { CreateJournalEntryDTO, JournalEntry } from '../types/journal.types';

interface JournalEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJournalEntryDTO) => void;
  initialData?: JournalEntry | null;
}

const moods = [
  { value: 'great', label: 'Great 😄' },
  { value: 'good', label: 'Good 🙂' },
  { value: 'neutral', label: 'Neutral 😐' },
  { value: 'bad', label: 'Bad 🙁' },
  { value: 'terrible', label: 'Terrible 😫' },
];

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [entryDate, setEntryDate] = useState('');
  const [whatIDid, setWhatIDid] = useState('');
  const [whatILearned, setWhatILearned] = useState('');
  const [problemsFaced, setProblemsFaced] = useState('');
  const [pendingTomorrow, setPendingTomorrow] = useState('');
  const [importantNotes, setImportantNotes] = useState('');
  const [mood, setMood] = useState('neutral');
  const [timeTracked, setTimeTracked] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setEntryDate(initialData.entry_date.split('T')[0]);
      setWhatIDid(initialData.what_i_did || '');
      setWhatILearned(initialData.what_i_learned || '');
      setProblemsFaced(initialData.problems_faced || '');
      setPendingTomorrow(initialData.pending_tomorrow || '');
      setImportantNotes(initialData.important_notes || '');
      setMood(initialData.mood || 'neutral');
      setTimeTracked(initialData.time_tracked_minutes || 0);
      setTags(initialData.daily_tags || []);
    } else {
      setEntryDate(new Date().toISOString().split('T')[0]);
      setWhatIDid('');
      setWhatILearned('');
      setProblemsFaced('');
      setPendingTomorrow('');
      setImportantNotes('');
      setMood('neutral');
      setTimeTracked(0);
      setTags([]);
    }
    setTagInput('');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      entry_date: entryDate,
      what_i_did: whatIDid,
      what_i_learned: whatILearned,
      problems_faced: problemsFaced,
      pending_tomorrow: pendingTomorrow,
      important_notes: importantNotes,
      mood,
      time_tracked_minutes: timeTracked,
      daily_tags: tags,
    });
    onClose();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  {initialData ? 'Edit Journal Entry' : 'New Journal Entry'}
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        required
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Time Tracked (mins)</label>
                      <input
                        type="number"
                        min="0"
                        value={timeTracked}
                        onChange={(e) => setTimeTracked(parseInt(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
                      <Listbox value={mood} onChange={setMood}>
                        <div className="relative mt-1">
                          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm border">
                            <span className="block truncate">
                              {moods.find(m => m.value === mood)?.label}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </Listbox.Button>
                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                              {moods.map((m, mIdx) => (
                                <Listbox.Option
                                  key={mIdx}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                      active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                                    }`
                                  }
                                  value={m.value}
                                >
                                  {({ selected }) => (
                                    <>
                                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        {m.label}
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </Listbox>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">What I Did</label>
                    <textarea
                      value={whatIDid}
                      onChange={(e) => setWhatIDid(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                      placeholder="Summary of tasks completed..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">What I Learned</label>
                      <textarea
                        value={whatILearned}
                        onChange={(e) => setWhatILearned(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        placeholder="New concepts, commands, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Problems Faced</label>
                      <textarea
                        value={problemsFaced}
                        onChange={(e) => setProblemsFaced(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        placeholder="Blockers or issues encountered..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pending for Tomorrow</label>
                      <textarea
                        value={pendingTomorrow}
                        onChange={(e) => setPendingTomorrow(e.target.value)}
                        rows={2}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Important Notes</label>
                      <textarea
                        value={importantNotes}
                        onChange={(e) => setImportantNotes(e.target.value)}
                        rows={2}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tags</label>
                    <div className="mt-1 flex flex-wrap gap-2 mb-2">
                      {tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
                          >
                            <span className="sr-only">Remove tag {tag}</span>
                            <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                      placeholder="Type tag and press Enter"
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    >
                      {initialData ? 'Save Changes' : 'Save Entry'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
