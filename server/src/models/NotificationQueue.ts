import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface NotificationQueueAttributes {
  id: number;
  user_id: number;
  type: 'reminder' | 'mention' | 'comment' | 'share' | 'suggestion';
  title: string;
  message?: string;
  entity_type?: string;
  entity_id?: number;
  action_url?: string;
  status: 'pending' | 'sent' | 'read' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduled_at?: Date;
  sent_at?: Date;
  read_at?: Date;
  created_at?: Date;
}

interface NotificationQueueCreationAttributes extends Optional<NotificationQueueAttributes, 'id' | 'message' | 'entity_type' | 'entity_id' | 'action_url' | 'status' | 'priority' | 'scheduled_at' | 'sent_at' | 'read_at' | 'created_at'> {}

class NotificationQueue extends Model<NotificationQueueAttributes, NotificationQueueCreationAttributes> implements NotificationQueueAttributes {
  public id!: number;
  public user_id!: number;
  public type!: 'reminder' | 'mention' | 'comment' | 'share' | 'suggestion';
  public title!: string;
  public message?: string;
  public entity_type?: string;
  public entity_id?: number;
  public action_url?: string;
  public status!: 'pending' | 'sent' | 'read' | 'dismissed';
  public priority!: 'low' | 'medium' | 'high' | 'critical';
  public scheduled_at?: Date;
  public sent_at?: Date;
  public read_at?: Date;
  public readonly created_at!: Date;
}

NotificationQueue.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('reminder', 'mention', 'comment', 'share', 'suggestion'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    action_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'read', 'dismissed'),
      defaultValue: 'pending',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium',
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'notification_queue',
    timestamps: false,
    underscored: true,
  }
);

export default NotificationQueue;
