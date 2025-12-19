import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TagAttributes {
  id: number;
  name: string;
  color: string;
  usage_count: number;
  created_at?: Date;
  updated_at?: Date;
}

interface TagCreationAttributes extends Optional<TagAttributes, 'id' | 'color' | 'usage_count' | 'created_at' | 'updated_at'> {}

class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
  public id!: number;
  public name!: string;
  public color!: string;
  public usage_count!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Tag.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#3B82F6',
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  sequelize,
  tableName: 'tags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Tag;
