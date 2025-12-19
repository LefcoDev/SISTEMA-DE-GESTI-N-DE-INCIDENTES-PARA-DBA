import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ServerHealthAttributes {
  id: number;
  server_id: number;
  server_reachable: boolean;
  is_online: boolean;
  response_time_ms: number;
  error_message?: string;
  checked_at: Date;
}

interface ServerHealthCreationAttributes extends Optional<ServerHealthAttributes, 'id' | 'error_message' | 'server_reachable'> {}

class ServerHealth extends Model<ServerHealthAttributes, ServerHealthCreationAttributes> implements ServerHealthAttributes {
  public id!: number;
  public server_id!: number;
  public server_reachable!: boolean;
  public is_online!: boolean;
  public response_time_ms!: number;
  public error_message?: string;
  public readonly checked_at!: Date;
}

ServerHealth.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  server_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  server_reachable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_online: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  response_time_ms: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  checked_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'server_health_checks',
  timestamps: false,
  indexes: [
    {
      fields: ['server_id', 'checked_at'],
    },
  ],
});

export default ServerHealth;
