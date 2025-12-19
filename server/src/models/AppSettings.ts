import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AppSettingsAttributes {
  id: number;
  user_id: number;
  setting_key: string;
  setting_value?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface AppSettingsCreationAttributes extends Optional<AppSettingsAttributes, 'id' | 'setting_value' | 'created_at' | 'updated_at'> {}

class AppSettings extends Model<AppSettingsAttributes, AppSettingsCreationAttributes> implements AppSettingsAttributes {
  public id!: number;
  public user_id!: number;
  public setting_key!: string;
  public setting_value?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

AppSettings.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  setting_key: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  setting_value: {
    type: DataTypes.TEXT,
  },
}, {
  sequelize,
  tableName: 'app_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default AppSettings;
