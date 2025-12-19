import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ExecutionHistoryAttributes {
  id: number;
  script_id?: number;
  server_id: number;
  script_content: string;
  executed_by: number;
  execution_status: 'success' | 'failed';
  execution_time_ms?: number;
  rows_affected?: number;
  error_message?: string;
  executed_at?: Date;
}

interface ExecutionHistoryCreationAttributes extends Optional<ExecutionHistoryAttributes, 'id' | 'script_id' | 'execution_time_ms' | 'rows_affected' | 'error_message' | 'executed_at'> {}

class ExecutionHistory extends Model<ExecutionHistoryAttributes, ExecutionHistoryCreationAttributes> implements ExecutionHistoryAttributes {
  public id!: number;
  public script_id?: number;
  public server_id!: number;
  public script_content!: string;
  public executed_by!: number;
  public execution_status!: 'success' | 'failed';
  public execution_time_ms?: number;
  public rows_affected?: number;
  public error_message?: string;
  public readonly executed_at!: Date;
}

ExecutionHistory.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  script_id: {
    type: DataTypes.INTEGER,
  },
  server_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  script_content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  executed_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  execution_status: {
    type: DataTypes.ENUM('success', 'failed'),
    allowNull: false,
  },
  execution_time_ms: {
    type: DataTypes.INTEGER,
  },
  rows_affected: {
    type: DataTypes.INTEGER,
  },
  error_message: {
    type: DataTypes.TEXT,
  },
  executed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'execution_history',
  timestamps: false,
});

export default ExecutionHistory;
