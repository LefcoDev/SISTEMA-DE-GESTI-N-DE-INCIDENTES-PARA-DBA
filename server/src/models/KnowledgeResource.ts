import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface KnowledgeResourceAttributes {
  id: number;
  topic_id: number;
  title: string;
  type: 'documentation' | 'video' | 'course' | 'article' | 'other';
  url?: string;
  is_completed: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface KnowledgeResourceCreationAttributes extends Optional<KnowledgeResourceAttributes, 'id' | 'url' | 'is_completed' | 'created_at' | 'updated_at'> {}

class KnowledgeResource extends Model<KnowledgeResourceAttributes, KnowledgeResourceCreationAttributes> implements KnowledgeResourceAttributes {
  public id!: number;
  public topic_id!: number;
  public title!: string;
  public type!: 'documentation' | 'video' | 'course' | 'article' | 'other';
  public url?: string;
  public is_completed!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

KnowledgeResource.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    topic_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('documentation', 'video', 'course', 'article', 'other'),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'knowledge_resources',
    timestamps: true,
    underscored: true,
  }
);

export default KnowledgeResource;
