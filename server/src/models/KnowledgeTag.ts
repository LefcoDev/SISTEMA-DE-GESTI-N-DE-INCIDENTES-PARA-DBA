import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface KnowledgeTagAttributes {
  knowledge_nugget_id: number;
  tag_id: number;
  created_at?: Date;
}

class KnowledgeTag extends Model<KnowledgeTagAttributes> implements KnowledgeTagAttributes {
  public knowledge_nugget_id!: number;
  public tag_id!: number;
  public readonly created_at!: Date;
}

KnowledgeTag.init({
  knowledge_nugget_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  tag_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  sequelize,
  tableName: 'knowledge_tags',
  timestamps: true,
  updatedAt: false,
  underscored: true,
});

export default KnowledgeTag;
