'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        server_id INT NOT NULL,
        type ENUM('performance', 'availability', 'data_corruption', 'backup_restore', 
                  'replication', 'security', 'capacity', 'slow_query', 'deadlock', 'other') NOT NULL,
        severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,
        status ENUM('new', 'in_progress', 'waiting', 'resolved', 'closed') DEFAULT 'new',
        impact ENUM('critical', 'high', 'medium', 'low'),
        reported_by VARCHAR(255),
        assigned_to INT,
        detected_at TIMESTAMP NOT NULL,
        started_work_at TIMESTAMP NULL,
        resolved_at TIMESTAMP NULL,
        closed_at TIMESTAMP NULL,
        resolution_time_minutes INT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_title (title),
        INDEX idx_server (server_id),
        INDEX idx_status (status),
        INDEX idx_severity (severity),
        INDEX idx_type (type),
        INDEX idx_detected_at (detected_at),
        INDEX idx_created_by (created_by),
        FULLTEXT idx_fulltext (title, description),
        FOREIGN KEY (server_id) REFERENCES servers(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('incidents');
  }
};
