'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) UNIQUE NOT NULL,
        color VARCHAR(7) DEFAULT '#3B82F6',
        usage_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS incident_tags (
        incident_id INT NOT NULL,
        tag_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (incident_id, tag_id),
        INDEX idx_incident (incident_id),
        INDEX idx_tag (tag_id),
        FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS script_tags (
        script_id INT NOT NULL,
        tag_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (script_id, tag_id),
        INDEX idx_script (script_id),
        INDEX idx_tag (tag_id),
        FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('script_tags');
    await queryInterface.dropTable('incident_tags');
    await queryInterface.dropTable('tags');
  }
};
