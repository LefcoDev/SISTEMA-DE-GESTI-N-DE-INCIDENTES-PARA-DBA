import sequelize from '../config/database';

async function updateSchema() {
  try {
    console.log('Updating schema...');
    
    // Add monitoring_enabled to servers
    try {
      await sequelize.query("ALTER TABLE servers ADD COLUMN monitoring_enabled BOOLEAN DEFAULT true;");
      console.log('Added monitoring_enabled to servers');
    } catch (e: any) {
      if (e.original?.code === 'ER_DUP_FIELDNAME') {
        console.log('monitoring_enabled already exists');
      } else {
        console.error('Error adding monitoring_enabled:', e);
      }
    }

    // Add template fields to solutions
    try {
      await sequelize.query("ALTER TABLE solutions ADD COLUMN is_template BOOLEAN DEFAULT false;");
      console.log('Added is_template to solutions');
    } catch (e: any) {
      if (e.original?.code === 'ER_DUP_FIELDNAME') {
        console.log('is_template already exists');
      } else {
        console.error('Error adding is_template:', e);
      }
    }

    try {
      await sequelize.query("ALTER TABLE solutions ADD COLUMN template_name VARCHAR(255);");
      console.log('Added template_name to solutions');
    } catch (e: any) {
      if (e.original?.code === 'ER_DUP_FIELDNAME') {
        console.log('template_name already exists');
      } else {
        console.error('Error adding template_name:', e);
      }
    }

    try {
      await sequelize.query("ALTER TABLE solutions ADD COLUMN template_category VARCHAR(50);");
      console.log('Added template_category to solutions');
    } catch (e: any) {
      if (e.original?.code === 'ER_DUP_FIELDNAME') {
        console.log('template_category already exists');
      } else {
        console.error('Error adding template_category:', e);
      }
    }
    
    // Fix incident_id nullable if needed
    try {
        await sequelize.query("ALTER TABLE solutions MODIFY COLUMN incident_id INT UNSIGNED NULL;");
        console.log('Modified incident_id to be NULL');
    } catch (e: any) {
        console.error('Error modifying incident_id:', e);
    }

    console.log('Schema update complete.');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error updating schema:', error);
    process.exit(1);
  }
}

updateSchema();
