import { Model, DataTypes, Optional, BelongsToManySetAssociationsMixin, BelongsToManyGetAssociationsMixin } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Tag from './Tag';

interface ScriptAttributes {
  id: number;
  name: string;
  description: string;
  language: 'sql' | 'bash' | 'powershell' | 'python';
  code: string;
  category: 'maintenance' | 'monitoring' | 'backup' | 'performance' | 'administration';
  engine_compatible?: string;
  parameters_description?: string;
  usage_count: number;
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
}

interface ScriptCreationAttributes extends Optional<ScriptAttributes, 'id' | 'engine_compatible' | 'parameters_description' | 'usage_count' | 'created_at' | 'updated_at'> {}

class Script extends Model<ScriptAttributes, ScriptCreationAttributes> implements ScriptAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public language!: 'sql' | 'bash' | 'powershell' | 'python';
  public code!: string;
  public category!: 'maintenance' | 'monitoring' | 'backup' | 'performance' | 'administration';
  public engine_compatible?: string;
  public parameters_description?: string;
  public usage_count!: number;
  public created_by!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public setTags!: BelongsToManySetAssociationsMixin<Tag, number>;
  public getTags!: BelongsToManyGetAssociationsMixin<Tag>;
}

Script.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  language: {
    type: DataTypes.ENUM('sql', 'bash', 'powershell', 'python'),
    allowNull: false,
  },
  code: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('maintenance', 'monitoring', 'backup', 'performance', 'administration'),
    allowNull: false,
  },
  engine_compatible: {
    type: DataTypes.STRING(100),
  },
  parameters_description: {
    type: DataTypes.TEXT,
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'scripts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Define associations
Script.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

export default Script;
