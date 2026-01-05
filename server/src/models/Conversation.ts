import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Conversation extends Model {
  public id!: number;
  public name!: string | null;
  public type!: 'direct' | 'group' | 'global';
  public created_by!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('direct', 'group', 'global'),
      defaultValue: 'direct',
      allowNull: false
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'conversations',
    timestamps: true,
    underscored: true
  }
);

export default Conversation;
