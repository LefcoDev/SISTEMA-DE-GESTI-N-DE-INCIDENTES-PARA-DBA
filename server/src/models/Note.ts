import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface NoteAttributes {
  id: number;
  title: string;
  content: string;
  color: 'yellow' | 'green' | 'blue' | 'red' | 'purple' | 'gray';
  type: 'global' | 'server' | 'incident' | 'script' | 'personal' | 'shared';
  priority: 'low' | 'medium' | 'high' | 'critical';
  server_id?: number;
  incident_id?: number;
  script_id?: number;
  is_pinned: boolean;
  is_archived: boolean;
  is_private: boolean;
  expires_at?: Date;
  created_by: number;
  shared_with?: string; // JSON array
  kanban_column: string;
  kanban_position: number;
  views_count: number;
  last_viewed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface NoteCreationAttributes extends Optional<NoteAttributes, 'id' | 'color' | 'priority' | 'server_id' | 'incident_id' | 'script_id' | 'is_pinned' | 'is_archived' | 'is_private' | 'expires_at' | 'shared_with' | 'kanban_column' | 'kanban_position' | 'views_count' | 'last_viewed_at' | 'created_at' | 'updated_at'> {}

class Note extends Model<NoteAttributes, NoteCreationAttributes> implements NoteAttributes {
  public id!: number;
  public title!: string;
  public content!: string;
  public color!: 'yellow' | 'green' | 'blue' | 'red' | 'purple' | 'gray';
  public type!: 'global' | 'server' | 'incident' | 'script' | 'personal' | 'shared';
  public priority!: 'low' | 'medium' | 'high' | 'critical';
  public server_id?: number;
  public incident_id?: number;
  public script_id?: number;
  public is_pinned!: boolean;
  public is_archived!: boolean;
  public is_private!: boolean;
  public expires_at?: Date;
  public created_by!: number;
  public shared_with?: string;
  public kanban_column!: string;
  public kanban_position!: number;
  public views_count!: number;
  public last_viewed_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Note.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  color: {
    type: DataTypes.ENUM('yellow', 'green', 'blue', 'red', 'purple', 'gray'),
    defaultValue: 'yellow',
  },
  type: {
    type: DataTypes.ENUM('global', 'server', 'incident', 'script', 'personal', 'shared'),
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
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
  is_pinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_archived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_private: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  shared_with: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  kanban_column: {
    type: DataTypes.STRING(50),
    defaultValue: 'todo',
  },
  kanban_position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  views_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  last_viewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'notes',
  timestamps: true,
  underscored: true,
});

export default Note;
