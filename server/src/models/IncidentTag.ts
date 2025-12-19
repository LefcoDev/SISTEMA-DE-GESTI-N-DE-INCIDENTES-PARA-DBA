import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface IncidentTagAttributes {
  incident_id: number;
  tag_id: number;
  created_at?: Date;
}

class IncidentTag extends Model<IncidentTagAttributes> implements IncidentTagAttributes {
  public incident_id!: number;
  public tag_id!: number;
  public readonly created_at!: Date;
}

IncidentTag.init({
  incident_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  tag_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  sequelize,
  tableName: 'incident_tags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default IncidentTag;
