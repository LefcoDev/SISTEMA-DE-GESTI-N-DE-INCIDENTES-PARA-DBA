'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS servers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        host VARCHAR(255) NOT NULL,
        port INT NOT NULL,
        engine_type ENUM('mysql', 'postgresql', 'sqlserver', 'oracle', 'mongodb') NOT NULL,
        engine_version VARCHAR(50),
        environment ENUM('development', 'qa', 'staging', 'production') NOT NULL,
        description TEXT,
        status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_environment (environment),
        INDEX idx_engine_type (engine_type),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('servers');
  }
};
