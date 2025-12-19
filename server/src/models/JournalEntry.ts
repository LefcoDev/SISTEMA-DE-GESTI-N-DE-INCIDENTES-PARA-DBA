import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface JournalEntryAttributes {
  id: number;
  user_id: number;
  entry_date: string; // DATEONLY
  what_i_did?: string;
  what_i_learned?: string;
  problems_faced?: string;
  pending_tomorrow?: string;
  important_notes?: string;
  mood?: string;
  daily_tags?: string; // JSON array
  achievements?: string; // JSON array
  incidents_worked?: any; // JSON
  scripts_executed?: any; // JSON
  time_tracked_minutes: number;
  created_at?: Date;
  updated_at?: Date;
}

interface JournalEntryCreationAttributes extends Optional<JournalEntryAttributes, 'id' | 'what_i_did' | 'what_i_learned' | 'problems_faced' | 'pending_tomorrow' | 'important_notes' | 'mood' | 'daily_tags' | 'achievements' | 'incidents_worked' | 'scripts_executed' | 'time_tracked_minutes' | 'created_at' | 'updated_at'> {}

class JournalEntry extends Model<JournalEntryAttributes, JournalEntryCreationAttributes> implements JournalEntryAttributes {
  public id!: number;
  public user_id!: number;
  public entry_date!: string;
  public what_i_did?: string;
  public what_i_learned?: string;
  public problems_faced?: string;
  public pending_tomorrow?: string;
  public important_notes?: string;
  public mood?: string;
  public daily_tags?: string;
  public achievements?: string;
  public incidents_worked?: any;
  public scripts_executed?: any;
  public time_tracked_minutes!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

JournalEntry.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  entry_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  what_i_did: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  what_i_learned: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  problems_faced: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pending_tomorrow: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  important_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  mood: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  daily_tags: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  achievements: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  incidents_worked: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  scripts_executed: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  time_tracked_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  sequelize,
  tableName: 'journal_entries',
  timestamps: true,
  underscored: true,
});

export default JournalEntry;
