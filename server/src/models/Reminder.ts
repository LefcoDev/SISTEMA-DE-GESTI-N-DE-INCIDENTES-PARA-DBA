import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ReminderAttributes {
  id: number;
  title: string;
  description?: string;
  scheduled_at: Date;
  type: 'one_time' | 'recurring';
  recurrence_pattern?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'completed' | 'snoozed' | 'cancelled';
  notification_channels: any; // JSON
  advance_notice_minutes: number;
  server_id?: number;
  incident_id?: number;
  script_id?: number;
  note_id?: number;
  quick_action?: string;
  quick_action_params?: any; // JSON
  is_auto_generated: boolean;
  auto_generation_rule?: string;
  created_by: number;
  last_triggered_at?: Date;
  next_trigger_at?: Date;
  snooze_until?: Date;
  completed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface ReminderCreationAttributes extends Optional<ReminderAttributes, 'id' | 'description' | 'recurrence_pattern' | 'priority' | 'status' | 'advance_notice_minutes' | 'server_id' | 'incident_id' | 'script_id' | 'note_id' | 'quick_action' | 'quick_action_params' | 'is_auto_generated' | 'auto_generation_rule' | 'last_triggered_at' | 'next_trigger_at' | 'snooze_until' | 'completed_at' | 'created_at' | 'updated_at'> {}

class Reminder extends Model<ReminderAttributes, ReminderCreationAttributes> implements ReminderAttributes {
  public id!: number;
  public title!: string;
  public description?: string;
  public scheduled_at!: Date;
  public type!: 'one_time' | 'recurring';
  public recurrence_pattern?: string;
  public priority!: 'low' | 'medium' | 'high' | 'critical';
  public status!: 'pending' | 'completed' | 'snoozed' | 'cancelled';
  public notification_channels!: any;
  public advance_notice_minutes!: number;
  public server_id?: number;
  public incident_id?: number;
  public script_id?: number;
  public note_id?: number;
  public quick_action?: string;
  public quick_action_params?: any;
  public is_auto_generated!: boolean;
  public auto_generation_rule?: string;
  public created_by!: number;
  public last_triggered_at?: Date;
  public next_trigger_at?: Date;
  public snooze_until?: Date;
  public completed_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Reminder.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('one_time', 'recurring'),
    allowNull: false,
  },
  recurrence_pattern: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'snoozed', 'cancelled'),
    defaultValue: 'pending',
  },
  notification_channels: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  advance_notice_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  server_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  incident_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  script_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  note_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  quick_action: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  quick_action_params: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  is_auto_generated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  auto_generation_rule: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  last_triggered_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  next_trigger_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  snooze_until: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'reminders',
  timestamps: true,
  underscored: true,
});

export default Reminder;
