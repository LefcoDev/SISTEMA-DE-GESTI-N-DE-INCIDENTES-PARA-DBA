import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Incident from './Incident';
import User from './User';

interface SolutionAttributes {
  id: number;
  incident_id?: number;
  description: string;
  sql_scripts?: string;
  system_commands?: string;
  external_references?: string;
  time_spent_minutes?: number;
  result_obtained?: string;
  is_template: boolean;
  template_name?: string;
  template_category?: string;
  applied_by: number;
  applied_at: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface SolutionCreationAttributes extends Optional<SolutionAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Solution extends Model<SolutionAttributes, SolutionCreationAttributes> implements SolutionAttributes {
  public id!: number;
  public incident_id?: number;
  public description!: string;
  public sql_scripts?: string;
  public system_commands?: string;
  public external_references?: string;
  public time_spent_minutes?: number;
  public result_obtained?: string;
  public is_template!: boolean;
  public template_name?: string;
  public template_category?: string;
  public applied_by!: number;
  public applied_at!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Solution.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    incident_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Incident,
        key: 'id',
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sql_scripts: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    system_commands: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    external_references: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    time_spent_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    result_obtained: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_template: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    template_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    template_category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    applied_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    applied_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'solutions',
    underscored: true,
  }
);

export default Solution;
