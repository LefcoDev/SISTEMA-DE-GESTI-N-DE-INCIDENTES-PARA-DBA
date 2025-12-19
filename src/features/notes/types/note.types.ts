export type NoteColor = 'yellow' | 'green' | 'blue' | 'red' | 'purple' | 'gray';
export type NoteType = 'global' | 'server' | 'incident' | 'script' | 'personal' | 'shared';
export type NotePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Tag {
  id: number;
  name: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  color: NoteColor;
  type: NoteType;
  priority: NotePriority;
  server_id?: number;
  incident_id?: number;
  script_id?: number;
  is_pinned: boolean;
  is_archived: boolean;
  is_private: boolean;
  expires_at?: string;
  created_by: number;
  shared_with?: string[]; // Parsed JSON
  kanban_column: string;
  kanban_position: number;
  views_count: number;
  last_viewed_at?: string;
  created_at: string;
  updated_at: string;
  User?: {
    id: number;
    full_name: string;
    email: string;
  };
  Tags?: Tag[];
}

export interface CreateNoteDTO {
  title: string;
  content: string;
  color?: NoteColor;
  type: NoteType;
  priority?: NotePriority;
  server_id?: number;
  incident_id?: number;
  script_id?: number;
  is_private?: boolean;
  expires_at?: string;
  shared_with?: string[];
  tags?: string[];
}

export interface UpdateNoteDTO extends Partial<CreateNoteDTO> {
  is_pinned?: boolean;
  is_archived?: boolean;
  kanban_column?: string;
  kanban_position?: number;
}

export interface NoteFilters {
  type?: NoteType;
  server_id?: number;
  incident_id?: number;
  script_id?: number;
  is_archived?: boolean;
  search?: string;
}
