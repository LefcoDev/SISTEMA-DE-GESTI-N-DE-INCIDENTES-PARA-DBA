import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Server from './Server';
import User from './User';

interface IncidentAttributes {
  id: number;
  title: string;
  description: string;
  server_id: number;
  type: 'performance' | 'availability' | 'data_corruption' | 'backup_restore' | 'replication' | 'security' | 'capacity' | 'slow_query' | 'deadlock' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  impact?: 'critical' | 'high' | 'medium' | 'low';
  reported_by?: string;
  assigned_to?: number;
  detected_at: Date;
  started_work_at?: Date;
  resolved_at?: Date;
  closed_at?: Date;
  resolution_time_minutes?: number;
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
}

interface IncidentCreationAttributes extends Optional<IncidentAttributes, 'id' | 'status' | 'impact' | 'reported_by' | 'assigned_to' | 'started_work_at' | 'resolved_at' | 'closed_at' | 'resolution_time_minutes' | 'created_at' | 'updated_at'> {}

class Incident extends Model<IncidentAttributes, IncidentCreationAttributes> implements IncidentAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public server_id!: number;
  public type!: 'performance' | 'availability' | 'data_corruption' | 'backup_restore' | 'replication' | 'security' | 'capacity' | 'slow_query' | 'deadlock' | 'other';
  public severity!: 'critical' | 'high' | 'medium' | 'low';
  public status!: 'new' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  public impact?: 'critical' | 'high' | 'medium' | 'low';
  public reported_by?: string;
  public assigned_to?: number;
  public detected_at!: Date;
  public started_work_at?: Date;
  public resolved_at?: Date;
  public closed_at?: Date;
  public resolution_time_minutes?: number;
  public created_by!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Incident.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  server_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('performance', 'availability', 'data_corruption', 'backup_restore', 'replication', 'security', 'capacity', 'slow_query', 'deadlock', 'other'),
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('critical', 'high', 'medium', 'low'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('new', 'in_progress', 'waiting', 'resolved', 'closed'),
    defaultValue: 'new',
  },
  impact: {
    type: DataTypes.ENUM('critical', 'high', 'medium', 'low'),
  },
  reported_by: {
    type: DataTypes.STRING(255),
  },
  assigned_to: {
    type: DataTypes.INTEGER,
  },
  detected_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  started_work_at: {
    type: DataTypes.DATE,
  },
  resolved_at: {
    type: DataTypes.DATE,
  },
  closed_at: {
    type: DataTypes.DATE,
  },
  resolution_time_minutes: {
    type: DataTypes.INTEGER,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'incidents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Incident;
