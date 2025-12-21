-- Script completo de creación de base de datos DBA Incident Manager
-- Para usar en MySQL Workbench conectado a Aiven

-- Usar la base de datos
USE defaultdb;

-- ================================================================
-- TABLA: users
-- ================================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'senior_dba', 'junior_dba') DEFAULT 'junior_dba',
  profile_picture VARCHAR(500),
  phone_number VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: servers
-- ================================================================
CREATE TABLE IF NOT EXISTS servers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  host VARCHAR(255) NOT NULL,
  port INT NOT NULL,
  engine_type VARCHAR(50) NOT NULL,
  engine_version VARCHAR(50),
  environment ENUM('development', 'qa', 'staging', 'production') NOT NULL,
  description TEXT,
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  monitoring_enabled BOOLEAN DEFAULT TRUE,
  monitoring_user VARCHAR(100),
  monitoring_password VARCHAR(100),
  service_name VARCHAR(100),
  manual_tns TEXT,
  last_check DATETIME,
  last_status ENUM('online', 'offline'),
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: incidents
-- ================================================================
CREATE TABLE IF NOT EXISTS incidents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  server_id INT NOT NULL,
  type ENUM('performance', 'availability', 'data_corruption', 'backup_restore', 'replication', 'security', 'capacity', 'slow_query', 'deadlock', 'other') NOT NULL,
  severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,
  status ENUM('new', 'in_progress', 'waiting', 'resolved', 'closed') DEFAULT 'new',
  impact ENUM('critical', 'high', 'medium', 'low'),
  reported_by VARCHAR(255),
  assigned_to INT,
  detected_at DATETIME NOT NULL,
  started_work_at DATETIME,
  resolved_at DATETIME,
  closed_at DATETIME,
  resolution_time_minutes INT,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: server_health_checks
-- ================================================================
CREATE TABLE IF NOT EXISTS server_health_checks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  server_id INT NOT NULL,
  server_reachable BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN NOT NULL,
  response_time_ms INT NOT NULL,
  error_message TEXT,
  checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE,
  INDEX idx_server_checked (server_id, checked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: notification_queue
-- ================================================================
CREATE TABLE IF NOT EXISTS notification_queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('reminder', 'mention', 'comment', 'share', 'suggestion', 'server_down', 'database_error', 'incident_created', 'incident_assigned', 'monitoring_alert') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  entity_type VARCHAR(50),
  entity_id INT,
  action_url VARCHAR(500),
  status ENUM('pending', 'sent', 'read', 'dismissed') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  scheduled_at DATETIME,
  sent_at DATETIME,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: solutions
-- ================================================================
CREATE TABLE IF NOT EXISTS solutions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  incident_id INT,
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
  applied_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE SET NULL,
  FOREIGN KEY (applied_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: tags
-- ================================================================
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#3b82f6',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: scripts
-- ================================================================
CREATE TABLE IF NOT EXISTS scripts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  language ENUM('sql', 'bash', 'powershell', 'python') NOT NULL,
  code TEXT NOT NULL,
  category ENUM('maintenance', 'monitoring', 'backup', 'performance', 'administration') NOT NULL,
  engine_compatible VARCHAR(100),
  parameters_description TEXT,
  usage_count INT DEFAULT 0,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: script_tags
-- ================================================================
CREATE TABLE IF NOT EXISTS script_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  script_id INT NOT NULL,
  tag_id INT NOT NULL,
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE KEY unique_script_tag (script_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: notes
-- ================================================================
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('technical', 'personal', 'meeting', 'idea', 'todo') DEFAULT 'technical',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: note_tags
-- ================================================================
CREATE TABLE IF NOT EXISTS note_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  note_id INT NOT NULL,
  tag_id INT NOT NULL,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE KEY unique_note_tag (note_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: reminders
-- ================================================================
CREATE TABLE IF NOT EXISTS reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  remind_at DATETIME NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: app_settings
-- ================================================================
CREATE TABLE IF NOT EXISTS app_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_by INT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: audit_logs
-- ================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: attachments
-- ================================================================
CREATE TABLE IF NOT EXISTS attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  uploaded_by INT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: execution_history
-- ================================================================
CREATE TABLE IF NOT EXISTS execution_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  script_id INT NOT NULL,
  executed_by INT NOT NULL,
  execution_time DATETIME NOT NULL,
  parameters_used TEXT,
  exit_code INT,
  output TEXT,
  execution_duration_ms INT,
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
  FOREIGN KEY (executed_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_script_time (script_id, execution_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: incident_history
-- ================================================================
CREATE TABLE IF NOT EXISTS incident_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  incident_id INT NOT NULL,
  changed_by INT NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_incident (incident_id, changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: incident_tags
-- ================================================================
CREATE TABLE IF NOT EXISTS incident_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  incident_id INT NOT NULL,
  tag_id INT NOT NULL,
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE KEY unique_incident_tag (incident_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: journal_entries
-- ================================================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  entry_date DATE NOT NULL,
  content TEXT NOT NULL,
  mood ENUM('productive', 'neutral', 'challenging', 'stressed', 'excellent'),
  is_private BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, entry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: knowledge_topics
-- ================================================================
CREATE TABLE IF NOT EXISTS knowledge_topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7) DEFAULT '#3b82f6',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: knowledge_nuggets
-- ================================================================
CREATE TABLE IF NOT EXISTS knowledge_nuggets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES knowledge_topics(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: knowledge_tags
-- ================================================================
CREATE TABLE IF NOT EXISTS knowledge_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nugget_id INT NOT NULL,
  tag_id INT NOT NULL,
  FOREIGN KEY (nugget_id) REFERENCES knowledge_nuggets(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE KEY unique_nugget_tag (nugget_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- TABLA: knowledge_resources
-- ================================================================
CREATE TABLE IF NOT EXISTS knowledge_resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nugget_id INT NOT NULL,
  resource_type ENUM('link', 'document', 'video', 'code_snippet') NOT NULL,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500),
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nugget_id) REFERENCES knowledge_nuggets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- INSERTAR USUARIO ADMINISTRADOR
-- ================================================================
INSERT INTO users (email, password, full_name, role, is_active)
VALUES (
  'admin@localhost.com',
  '$2a$10$2nWGxZ4HKPxEk.hW6qvpkudVL0B1GZvPe8UvEkL9Zu0pIBqC7oF0C',  -- Password: admin123
  'Administrador',
  'admin',
  TRUE
);

-- ================================================================
-- VERIFICAR TABLAS CREADAS
-- ================================================================
SHOW TABLES;

-- ================================================================
-- Script completado exitosamente
-- ================================================================