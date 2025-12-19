import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ServerAttributes {
  id: number;
  name: string;
  host: string;
  port: number;
  engine_type: string;
  engine_version?: string;
  environment: 'development' | 'qa' | 'staging' | 'production';
  description?: string;
  status: 'active' | 'inactive' | 'maintenance';
  monitoring_enabled: boolean;
  monitoring_user?: string;
  monitoring_password?: string;
  service_name?: string;
  manual_tns?: string;
  last_check?: Date;
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

interface ServerCreationAttributes extends Optional<ServerAttributes, 'id' | 'engine_version' | 'description' | 'status' | 'monitoring_enabled' | 'monitoring_user' | 'monitoring_password' | 'service_name' | 'manual_tns' | 'last_check' | 'created_by' | 'created_at' | 'updated_at'> {}

class Server extends Model<ServerAttributes, ServerCreationAttributes> implements ServerAttributes {
  public id!: number;
  public name!: string;
  public host!: string;
  public port!: number;
  public engine_type!: string;
  public engine_version?: string;
  public environment!: 'development' | 'qa' | 'staging' | 'production';
  public description?: string;
  public status!: 'active' | 'inactive' | 'maintenance';
  public monitoring_enabled!: boolean;
  public monitoring_user?: string;
  public monitoring_password?: string;
  public service_name?: string;
  public manual_tns?: string;
  public last_check?: Date;
  public created_by?: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Server.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  host: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  port: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  engine_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  engine_version: {
    type: DataTypes.STRING(50),
  },
  environment: {
    type: DataTypes.ENUM('development', 'qa', 'staging', 'production'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
    defaultValue: 'active',
  },
  monitoring_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  monitoring_user: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  monitoring_password: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  service_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  manual_tns: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  last_check: {
    type: DataTypes.DATE,
  },
  created_by: {
    type: DataTypes.INTEGER,
  },
}, {
  sequelize,
  tableName: 'servers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Server;
