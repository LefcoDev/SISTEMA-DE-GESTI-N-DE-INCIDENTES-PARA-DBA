import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';

const execPromise = util.promisify(exec);

export class BackupService {
  private backupPath: string;

  constructor() {
    this.backupPath = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
  }

  public async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(this.backupPath, filename);

    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

    // Construct mysqldump command
    // Note: Password handling in command line can be insecure, but standard for simple scripts.
    const command = `mysqldump -h ${DB_HOST} -P ${DB_PORT || 3306} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > "${filepath}"`;

    try {
      await execPromise(command);
      return filename;
    } catch (error) {
      console.error('Backup failed:', error);
      throw new Error('Backup creation failed');
    }
  }

  public listBackups(): { filename: string; size: number; date: Date }[] {
    const files = fs.readdirSync(this.backupPath).filter(f => f.endsWith('.sql'));
    return files.map(f => {
      const stats = fs.statSync(path.join(this.backupPath, f));
      return {
        filename: f,
        size: stats.size,
        date: stats.mtime
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  public async restoreBackup(filename: string): Promise<void> {
    const filepath = path.join(this.backupPath, filename);
    if (!fs.existsSync(filepath)) {
      throw new Error('Backup file not found');
    }

    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
    
    const command = `mysql -h ${DB_HOST} -P ${DB_PORT || 3306} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < "${filepath}"`;

    try {
      await execPromise(command);
    } catch (error) {
      console.error('Restore failed:', error);
      throw new Error('Backup restoration failed');
    }
  }
}
