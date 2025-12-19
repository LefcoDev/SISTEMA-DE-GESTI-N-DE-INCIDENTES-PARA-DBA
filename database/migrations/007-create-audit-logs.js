'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS attachments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        incident_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        filepath VARCHAR(500) NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        file_size INT NOT NULL,
        uploaded_by INT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_incident (incident_id),
        INDEX idx_uploaded_by (uploaded_by),
        FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS execution_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        script_id INT,
        server_id INT NOT NULL,
        script_content TEXT NOT NULL,
        executed_by INT NOT NULL,
        execution_status ENUM('success', 'failed') NOT NULL,
        execution_time_ms INT,
        rows_affected INT,
        error_message TEXT,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_script (script_id),
        INDEX idx_server (server_id),
        INDEX idx_executed_by (executed_by),
        INDEX idx_executed_at (executed_at),
        INDEX idx_status (execution_status),
        FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE SET NULL,
        FOREIGN KEY (server_id) REFERENCES servers(id),
        FOREIGN KEY (executed_by) REFERENCES users(id)
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INT,
        old_value TEXT,
        new_value TEXT,
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS incident_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        incident_id INT NOT NULL,
        field_changed VARCHAR(100) NOT NULL,
        old_value TEXT,
        new_value TEXT,
        changed_by INT NOT NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_incident (incident_id),
        INDEX idx_changed_by (changed_by),
        INDEX idx_changed_at (changed_at),
        FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id)
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        setting_key VARCHAR(100) NOT NULL,
        setting_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_setting (user_id, setting_key),
        INDEX idx_user (user_id),
        INDEX idx_setting_key (setting_key),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('app_settings');
    await queryInterface.dropTable('incident_history');
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('execution_history');
    await queryInterface.dropTable('attachments');
  }
};
