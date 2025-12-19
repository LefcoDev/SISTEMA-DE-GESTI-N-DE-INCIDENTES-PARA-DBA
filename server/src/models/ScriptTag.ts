import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface ScriptTagAttributes {
  script_id: number;
  tag_id: number;
  created_at?: Date;
}

class ScriptTag extends Model<ScriptTagAttributes> implements ScriptTagAttributes {
  public script_id!: number;
  public tag_id!: number;
  public readonly created_at!: Date;
}

ScriptTag.init({
  script_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  tag_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  sequelize,
  tableName: 'script_tags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default ScriptTag;
