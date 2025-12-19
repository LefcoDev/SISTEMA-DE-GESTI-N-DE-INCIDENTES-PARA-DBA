import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface KnowledgeTopicAttributes {
  id: number;
  title: string;
  description: string;
  status: 'to_learn' | 'in_progress' | 'mastered';
  tags?: string[];
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
}

interface KnowledgeTopicCreationAttributes extends Optional<KnowledgeTopicAttributes, 'id' | 'tags' | 'created_at' | 'updated_at'> {}

class KnowledgeTopic extends Model<KnowledgeTopicAttributes, KnowledgeTopicCreationAttributes> implements KnowledgeTopicAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public status!: 'to_learn' | 'in_progress' | 'mastered';
  public tags?: string[];
  public created_by!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

KnowledgeTopic.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('to_learn', 'in_progress', 'mastered'),
      defaultValue: 'to_learn',
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'knowledge_topics',
    timestamps: true,
    underscored: true,
  }
);

export default KnowledgeTopic;
