import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { User, Server, Incident, Solution, Script, Tag, IncidentTag, ScriptTag, Attachment, ExecutionHistory, AuditLog, IncidentHistory, AppSettings } from '../models';

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../../../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export const createBackup = async (req: Request, res: Response) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    const filePath = path.join(BACKUP_DIR, filename);

    // Fetch all data
    const data = {
      users: await User.findAll(),
      servers: await Server.findAll(),
      incidents: await Incident.findAll(),
      solutions: await Solution.findAll(),
      scripts: await Script.findAll(),
      tags: await Tag.findAll(),
      incidentTags: await IncidentTag.findAll(),
      scriptTags: await ScriptTag.findAll(),
      attachments: await Attachment.findAll(),
      executionHistory: await ExecutionHistory.findAll(),
      auditLogs: await AuditLog.findAll(),
      incidentHistory: await IncidentHistory.findAll(),
      appSettings: await AppSettings.findAll(),
      metadata: {
        version: '1.0.0',
        createdAt: new Date(),
        createdBy: req.user?.id
      }
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.json({ message: 'Backup created successfully', filename });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ message: 'Error creating backup' });
  }
};

export const listBackups = async (req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const stats = fs.statSync(path.join(BACKUP_DIR, file));
        return {
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json(files);
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ message: 'Error listing backups' });
  }
};

export const restoreBackup = async (req: Request, res: Response) => {
  try {
    const { filename } = req.body;
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Backup file not found' });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Restore data in order (handling foreign keys implicitly by order if needed, 
    // but Sequelize bulkCreate with ignoreDuplicates or truncate might be needed)
    
    // Strategy: Truncate tables and re-insert. 
    // WARNING: This is destructive.
    
    // Disable foreign key checks for MySQL
    await User.sequelize?.query('SET FOREIGN_KEY_CHECKS = 0');

    try {
      // Truncate all tables
      await IncidentTag.destroy({ where: {}, truncate: true });
      await ScriptTag.destroy({ where: {}, truncate: true });
      await Solution.destroy({ where: {}, truncate: true });
      await Attachment.destroy({ where: {}, truncate: true });
      await IncidentHistory.destroy({ where: {}, truncate: true });
      await ExecutionHistory.destroy({ where: {}, truncate: true });
      await AuditLog.destroy({ where: {}, truncate: true });
      await AppSettings.destroy({ where: {}, truncate: true });
      await Incident.destroy({ where: {}, truncate: true });
      await Script.destroy({ where: {}, truncate: true });
      await Server.destroy({ where: {}, truncate: true });
      await Tag.destroy({ where: {}, truncate: true });
      await User.destroy({ where: {}, truncate: true });

      // Re-insert data
      if (data.users?.length) await User.bulkCreate(data.users);
      if (data.tags?.length) await Tag.bulkCreate(data.tags);
      if (data.servers?.length) await Server.bulkCreate(data.servers);
      if (data.scripts?.length) await Script.bulkCreate(data.scripts);
      if (data.incidents?.length) await Incident.bulkCreate(data.incidents);
      if (data.solutions?.length) await Solution.bulkCreate(data.solutions);
      if (data.incidentTags?.length) await IncidentTag.bulkCreate(data.incidentTags);
      if (data.scriptTags?.length) await ScriptTag.bulkCreate(data.scriptTags);
      if (data.attachments?.length) await Attachment.bulkCreate(data.attachments);
      if (data.executionHistory?.length) await ExecutionHistory.bulkCreate(data.executionHistory);
      if (data.auditLogs?.length) await AuditLog.bulkCreate(data.auditLogs);
      if (data.incidentHistory?.length) await IncidentHistory.bulkCreate(data.incidentHistory);
      if (data.appSettings?.length) await AppSettings.bulkCreate(data.appSettings);

    } finally {
      await User.sequelize?.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    res.json({ message: 'Backup restored successfully' });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ message: 'Error restoring backup' });
  }
};

export const deleteBackup = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Backup file not found' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'Backup deleted successfully' });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ message: 'Error deleting backup' });
  }
};
