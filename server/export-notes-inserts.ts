import mysql2 from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function exportNotesToInserts() {
  let connection;
  try {
    // Conectar a la base de datos de donde quieres exportar
    // Cambia estos valores según tu BD origen
    connection = await mysql2.createConnection({
      host: 'localhost', // Cambia si es otra BD
      user: 'root',      // Cambia al usuario correcto
      password: 'Linkindark16-', // Cambia a tu password
      database: 'dba_incident_manager'
    });

    console.log('Connected to source database');

    // Obtener todos los registros de notes
    const [rows] = await connection.query('SELECT * FROM notes');
    
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log('No notes found to export');
      return;
    }

    console.log(`Found ${rows.length} notes to export`);

    // Generar INSERT statements
    const inserts: string[] = [];
    
    for (const row of rows) {
      const r: any = row;
      const values = [
        r.id || 'NULL',
        r.title ? `'${mysql2.escape(r.title).slice(1, -1)}'` : 'NULL',
        r.content ? `'${mysql2.escape(r.content).slice(1, -1)}'` : 'NULL',
        r.category ? `'${mysql2.escape(r.category).slice(1, -1)}'` : 'NULL',
        r.tags ? `'${mysql2.escape(r.tags).slice(1, -1)}'` : 'NULL',
        r.color ? `'${mysql2.escape(r.color).slice(1, -1)}'` : 'NULL',
        r.is_pinned ? r.is_pinned : 0,
        r.is_archived ? r.is_archived : 0,
        r.created_by || 'NULL',
        r.created_at ? `'${new Date(r.created_at).toISOString().slice(0, 19).replace('T', ' ')}'` : 'NOW()',
        r.updated_at ? `'${new Date(r.updated_at).toISOString().slice(0, 19).replace('T', ' ')}'` : 'NOW()'
      ];

      const insert = `INSERT INTO notes (id, title, content, category, tags, color, is_pinned, is_archived, created_by, created_at, updated_at) VALUES (${values.join(', ')});`;
      inserts.push(insert);
    }

    // Guardar en archivo
    const outputPath = path.join(__dirname, '../backups/notes-inserts.sql');
    
    // Crear directorio si no existe
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const content = [
      '-- Notes Export',
      `-- Generated: ${new Date().toISOString()}`,
      `-- Total records: ${rows.length}`,
      '',
      '-- Disable foreign key checks',
      'SET FOREIGN_KEY_CHECKS = 0;',
      '',
      ...inserts,
      '',
      '-- Re-enable foreign key checks',
      'SET FOREIGN_KEY_CHECKS = 1;',
      ''
    ].join('\n');

    fs.writeFileSync(outputPath, content, 'utf-8');
    
    console.log(`✅ Export complete! File saved to: ${outputPath}`);
    console.log(`Total INSERT statements: ${inserts.length}`);

  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

exportNotesToInserts();
