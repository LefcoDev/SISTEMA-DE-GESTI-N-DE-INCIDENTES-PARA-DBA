import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class ConversationParticipant extends Model {
  public id!: number;
  public conversation_id!: number;
  public user_id!: number;
  public last_read_at!: Date | null;
  public joined_at!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ConversationParticipant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    last_read_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
    tableName: 'conversation_participants',
    timestamps: true,
    underscored: true
  }
);

export default ConversationParticipant;
