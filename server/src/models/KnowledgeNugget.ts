import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface KnowledgeNuggetAttributes {
  id: number;
  title: string;
  category: 'til' | 'best_practice' | 'gotcha' | 'quick_tip' | 'command_ref' | 'troubleshooting';
  content: string;
  code_example?: string;
  expected_result?: string;
  technology: string;
  complexity_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  external_references?: string; // JSON array
  incident_id?: number;
  applicable_to?: string; // JSON array
  usage_count: number;
  helpful_count: number;
  rating_sum: number;
  rating_count: number;
  is_verified: boolean;
  verified_by?: number;
  verified_at?: Date;
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
}

interface KnowledgeNuggetCreationAttributes extends Optional<KnowledgeNuggetAttributes, 'id' | 'code_example' | 'expected_result' | 'external_references' | 'incident_id' | 'applicable_to' | 'usage_count' | 'helpful_count' | 'rating_sum' | 'rating_count' | 'is_verified' | 'verified_by' | 'verified_at' | 'created_at' | 'updated_at'> {}

class KnowledgeNugget extends Model<KnowledgeNuggetAttributes, KnowledgeNuggetCreationAttributes> implements KnowledgeNuggetAttributes {
  public id!: number;
  public title!: string;
  public category!: 'til' | 'best_practice' | 'gotcha' | 'quick_tip' | 'command_ref' | 'troubleshooting';
  public content!: string;
  public code_example?: string;
  public expected_result?: string;
  public technology!: string;
  public complexity_level!: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  public external_references?: string;
  public incident_id?: number;
  public applicable_to?: string;
  public usage_count!: number;
  public helpful_count!: number;
  public rating_sum!: number;
  public rating_count!: number;
  public is_verified!: boolean;
  public verified_by?: number;
  public verified_at?: Date;
  public created_by!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

KnowledgeNugget.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('til', 'best_practice', 'gotcha', 'quick_tip', 'command_ref', 'troubleshooting'),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  code_example: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  expected_result: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  technology: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  complexity_level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    allowNull: false,
  },
  external_references: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  incident_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  applicable_to: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  helpful_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rating_sum: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rating_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verified_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'knowledge_nuggets',
  timestamps: true,
  underscored: true,
});

export default KnowledgeNugget;
