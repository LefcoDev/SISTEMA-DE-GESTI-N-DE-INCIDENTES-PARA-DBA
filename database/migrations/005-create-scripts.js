'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS scripts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        language ENUM('sql', 'bash', 'powershell', 'python') NOT NULL,
        code TEXT NOT NULL,
        category ENUM('maintenance', 'monitoring', 'backup', 'performance', 'administration') NOT NULL,
        engine_compatible VARCHAR(100),
        parameters_description TEXT,
        usage_count INT DEFAULT 0,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_category (category),
        INDEX idx_language (language),
        INDEX idx_usage_count (usage_count),
        FULLTEXT idx_fulltext (name, description, code),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('scripts');
  }
};
