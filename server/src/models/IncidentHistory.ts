import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface IncidentHistoryAttributes {
  id: number;
  incident_id: number;
  field_changed: string;
  old_value?: string;
  new_value?: string;
  changed_by: number;
  changed_at?: Date;
}

interface IncidentHistoryCreationAttributes extends Optional<IncidentHistoryAttributes, 'id' | 'old_value' | 'new_value' | 'changed_at'> {}

class IncidentHistory extends Model<IncidentHistoryAttributes, IncidentHistoryCreationAttributes> implements IncidentHistoryAttributes {
  public id!: number;
  public incident_id!: number;
  public field_changed!: string;
  public old_value?: string;
  public new_value?: string;
  public changed_by!: number;
  public readonly changed_at!: Date;
}

IncidentHistory.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  incident_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  field_changed: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  old_value: {
    type: DataTypes.TEXT,
  },
  new_value: {
    type: DataTypes.TEXT,
  },
  changed_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  changed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'incident_history',
  timestamps: false,
});

export default IncidentHistory;
