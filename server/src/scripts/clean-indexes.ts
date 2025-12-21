import sequelize from '../config/database';

async function cleanIndexes() {
  try {
    console.log('🧹 Limpiando índices duplicados...');

    // Get all tables
    const tables = [
      'users', 'servers', 'incidents', 'solutions', 'scripts', 
      'incident_history', 'attachments', 'tags', 'incident_tags',
      'notes', 'reminders', 'knowledge_nuggets', 'journal_entries',
      'audit_logs', 'server_health', 'alerts', 'maintenance_windows'
    ];

    for (const table of tables) {
      console.log(`\n📋 Procesando tabla: ${table}`);
      
      // Get all indexes for the table
      let indexes: any;
      try {
        [indexes] = await sequelize.query(`SHOW INDEX FROM \`${table}\``);
      } catch (error: any) {
        if (error.original?.errno === 1146) {
          console.log(`   ⚠ Tabla ${table} no existe, omitiendo...`);
          continue;
        }
        throw error;
      }

      // Group indexes by Key_name
      const indexGroups = new Map();
      for (const idx of indexes) {
        if (idx.Key_name === 'PRIMARY') continue; // Skip primary key
        
        if (!indexGroups.has(idx.Key_name)) {
          indexGroups.set(idx.Key_name, []);
        }
        indexGroups.get(idx.Key_name).push(idx);
      }

      console.log(`   Total índices (excluyendo PRIMARY): ${indexGroups.size}`);

      // Keep track of columns that need unique constraint
      const uniqueColumns = new Set<string>();
      const indexesToDrop: string[] = [];

      // Identify indexes to drop
      for (const [keyName, idxGroup] of indexGroups.entries()) {
        const isUnique = idxGroup[0].Non_unique === 0;
        const columnName = idxGroup[0].Column_name;

        // If it's a simple unique index on a single column
        if (isUnique && idxGroup.length === 1) {
          uniqueColumns.add(columnName);
        }

        // Drop all indexes that aren't the primary key
        // We'll recreate unique constraints separately
        indexesToDrop.push(keyName);
      }

      // Drop indexes
      for (const keyName of indexesToDrop) {
        try {
          await sequelize.query(`ALTER TABLE \`${table}\` DROP INDEX \`${keyName}\``);
          console.log(`   ✓ Eliminado índice: ${keyName}`);
        } catch (error: any) {
          if (error.original?.errno === 1091) {
            console.log(`   ⚠ Índice ${keyName} ya no existe`);
          } else {
            console.log(`   ✗ Error eliminando ${keyName}: ${error.message}`);
          }
        }
      }

      // Recreate unique constraints for specific columns
      if (table === 'users' && uniqueColumns.has('email')) {
        try {
          await sequelize.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`users_email_unique\` (\`email\`)`);
          console.log(`   ✓ Recreado índice único para email`);
        } catch (error: any) {
          console.log(`   ⚠ No se pudo recrear índice único para email: ${error.message}`);
        }
      }

      if (table === 'servers' && uniqueColumns.has('name')) {
        try {
          await sequelize.query(`ALTER TABLE \`servers\` ADD UNIQUE INDEX \`servers_name_unique\` (\`name\`)`);
          console.log(`   ✓ Recreado índice único para name`);
        } catch (error: any) {
          console.log(`   ⚠ No se pudo recrear índice único para name: ${error.message}`);
        }
      }
    }

    console.log('\n✅ Limpieza de índices completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error limpiando índices:', error);
    process.exit(1);
  }
}

cleanIndexes();
