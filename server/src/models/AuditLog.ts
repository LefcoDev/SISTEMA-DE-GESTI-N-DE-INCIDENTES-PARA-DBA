import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AuditLogAttributes {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;
}

interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'entity_id' | 'old_value' | 'new_value' | 'ip_address' | 'user_agent' | 'created_at'> {}

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: number;
  public user_id!: number;
  public action!: string;
  public entity_type!: string;
  public entity_id?: number;
  public old_value?: string;
  public new_value?: string;
  public ip_address?: string;
  public user_agent?: string;
  public readonly created_at!: Date;
}

AuditLog.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  entity_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  entity_id: {
    type: DataTypes.INTEGER,
  },
  old_value: {
    type: DataTypes.TEXT,
  },
  new_value: {
    type: DataTypes.TEXT,
  },
  ip_address: {
    type: DataTypes.STRING(50),
  },
  user_agent: {
    type: DataTypes.TEXT,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'audit_logs',
  timestamps: false,
});

export default AuditLog;
