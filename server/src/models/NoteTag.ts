import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface NoteTagAttributes {
  note_id: number;
  tag_id: number;
  created_at?: Date;
}

class NoteTag extends Model<NoteTagAttributes> implements NoteTagAttributes {
  public note_id!: number;
  public tag_id!: number;
  public readonly created_at!: Date;
}

NoteTag.init({
  note_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  tag_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  sequelize,
  tableName: 'note_tags',
  timestamps: true,
  updatedAt: false,
  underscored: true,
});

export default NoteTag;
