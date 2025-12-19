import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AttachmentAttributes {
  id: number;
  incident_id: number;
  filename: string;
  original_filename: string;
  filepath: string;
  file_type: string;
  file_size: number;
  uploaded_by: number;
  uploaded_at?: Date;
}

interface AttachmentCreationAttributes extends Optional<AttachmentAttributes, 'id' | 'uploaded_at'> {}

class Attachment extends Model<AttachmentAttributes, AttachmentCreationAttributes> implements AttachmentAttributes {
  public id!: number;
  public incident_id!: number;
  public filename!: string;
  public original_filename!: string;
  public filepath!: string;
  public file_type!: string;
  public file_size!: number;
  public uploaded_by!: number;
  public readonly uploaded_at!: Date;
}

Attachment.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  incident_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  original_filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  filepath: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'attachments',
  timestamps: false,
});

export default Attachment;
