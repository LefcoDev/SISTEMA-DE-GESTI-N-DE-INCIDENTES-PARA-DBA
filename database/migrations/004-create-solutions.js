'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS solutions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        incident_id INT NOT NULL,
        description TEXT NOT NULL,
        sql_scripts TEXT,
        system_commands TEXT,
        external_references TEXT,
        time_spent_minutes INT,
        result_obtained TEXT,
        is_template BOOLEAN DEFAULT FALSE,
        template_name VARCHAR(255),
        template_category VARCHAR(100),
        applied_by INT NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_incident (incident_id),
        INDEX idx_is_template (is_template),
        INDEX idx_template_category (template_category),
        FULLTEXT idx_fulltext (description),
        FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
        FOREIGN KEY (applied_by) REFERENCES users(id)
      );
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('solutions');
  }
};
