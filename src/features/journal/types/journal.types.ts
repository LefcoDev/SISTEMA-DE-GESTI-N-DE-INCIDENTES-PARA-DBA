export interface JournalEntry {
  id: number;
  user_id: number;
  entry_date: string;
  what_i_did?: string;
  what_i_learned?: string;
  problems_faced?: string;
  pending_tomorrow?: string;
  important_notes?: string;
  mood?: string;
  daily_tags?: string[]; // Parsed JSON
  achievements?: string[]; // Parsed JSON
  incidents_worked?: number[]; // Parsed JSON
  scripts_executed?: number[]; // Parsed JSON
  time_tracked_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface CreateJournalEntryDTO {
  entry_date: string;
  what_i_did?: string;
  what_i_learned?: string;
  problems_faced?: string;
  pending_tomorrow?: string;
  important_notes?: string;
  mood?: string;
  daily_tags?: string[];
  achievements?: string[];
  incidents_worked?: number[];
  scripts_executed?: number[];
  time_tracked_minutes?: number;
}

export interface JournalFilters {
  from_date?: string;
  to_date?: string;
}
