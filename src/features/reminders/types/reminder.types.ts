export type ReminderType = 'one_time' | 'recurring';
export type ReminderPriority = 'low' | 'medium' | 'high' | 'critical';
export type ReminderStatus = 'pending' | 'completed' | 'snoozed' | 'cancelled';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Reminder {
  id: number;
  title: string;
  description?: string;
  scheduled_at: string;
  type: ReminderType;
  recurrence_pattern?: string;
  priority: ReminderPriority;
  status: ReminderStatus;
  notification_channels: string[]; // Parsed JSON
  advance_notice_minutes: number;
  server_id?: number;
  incident_id?: number;
  script_id?: number;
  note_id?: number;
  quick_action?: string;
  quick_action_params?: any;
  is_auto_generated: boolean;
  auto_generation_rule?: string;
  created_by: number;
  last_triggered_at?: string;
  next_trigger_at?: string;
  snooze_until?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderDTO {
  title: string;
  description?: string;
  scheduled_at: string;
  type: ReminderType;
  recurrence_pattern?: string;
  priority?: ReminderPriority;
  notification_channels: string[];
  advance_notice_minutes?: number;
  server_id?: number;
  incident_id?: number;
  script_id?: number;
  note_id?: number;
}

export interface UpdateReminderDTO extends Partial<CreateReminderDTO> {
  status?: ReminderStatus;
  snooze_until?: string;
}

export interface ReminderFilters {
  status?: ReminderStatus;
  from_date?: string;
  to_date?: string;
}
