import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Notes
      await queryInterface.createTable('notes', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        title: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        color: {
          type: DataTypes.ENUM('yellow', 'green', 'blue', 'red', 'purple', 'gray'),
          defaultValue: 'yellow',
        },
        type: {
          type: DataTypes.ENUM('global', 'server', 'incident', 'script', 'personal', 'shared'),
          allowNull: false,
        },
        priority: {
          type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
          defaultValue: 'medium',
        },
        server_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'servers', key: 'id' },
          onDelete: 'SET NULL',
        },
        incident_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'incidents', key: 'id' },
          onDelete: 'SET NULL',
        },
        script_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'scripts', key: 'id' },
          onDelete: 'SET NULL',
        },
        is_pinned: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        is_archived: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        is_private: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
        shared_with: {
          type: DataTypes.TEXT, // JSON array
          allowNull: true,
        },
        kanban_column: {
          type: DataTypes.STRING(50),
          defaultValue: 'todo',
        },
        kanban_position: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        views_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        last_viewed_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });

      // 2. Note Tags
      await queryInterface.createTable('note_tags', {
        note_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'notes', key: 'id' },
          onDelete: 'CASCADE',
          primaryKey: true,
        },
        tag_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'tags', key: 'id' },
          onDelete: 'CASCADE',
          primaryKey: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });
      // Add composite primary key for note_tags
      /*
      await queryInterface.addConstraint('note_tags', {
        fields: ['note_id', 'tag_id'],
        type: 'primary key',
        name: 'pk_note_tags',
        transaction,
      });
      */

      // 3. Note Comments
      await queryInterface.createTable('note_comments', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        note_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'notes', key: 'id' },
          onDelete: 'CASCADE',
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        parent_comment_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'note_comments', key: 'id' },
          onDelete: 'CASCADE',
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
        is_solution: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });

      // 4. Note Reactions
      await queryInterface.createTable('note_reactions', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        note_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'notes', key: 'id' },
          onDelete: 'CASCADE',
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
        reaction: {
          type: DataTypes.STRING(10),
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { 
        transaction,
        uniqueKeys: {
          unique_user_reaction: {
            fields: ['note_id', 'user_id', 'reaction']
          }
        }
      });
      /*
      await queryInterface.addConstraint('note_reactions', {
        fields: ['note_id', 'user_id', 'reaction'],
        type: 'unique',
        name: 'unique_user_reaction',
        transaction,
      });
      */

      // 5. Note Attachments
      await queryInterface.createTable('note_attachments', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        note_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'notes', key: 'id' },
          onDelete: 'CASCADE',
        },
        filename: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        original_filename: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        filepath: {
          type: DataTypes.STRING(500),
          allowNull: false,
        },
        file_type: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        file_size: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        uploaded_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
        uploaded_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });

      // 6. Reminders
      await queryInterface.createTable('reminders', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        title: {
          type: DataTypes.STRING(150),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        scheduled_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM('one_time', 'recurring'),
          allowNull: false,
        },
        recurrence_pattern: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        priority: {
          type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
          defaultValue: 'medium',
        },
        status: {
          type: DataTypes.ENUM('pending', 'completed', 'snoozed', 'cancelled'),
          defaultValue: 'pending',
        },
        notification_channels: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        advance_notice_minutes: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        server_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'servers', key: 'id' },
          onDelete: 'SET NULL',
        },
        incident_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'incidents', key: 'id' },
          onDelete: 'SET NULL',
        },
        script_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'scripts', key: 'id' },
          onDelete: 'SET NULL',
        },
        note_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'notes', key: 'id' },
          onDelete: 'SET NULL',
        },
        quick_action: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        quick_action_params: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        is_auto_generated: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        auto_generation_rule: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
        last_triggered_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        next_trigger_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        snooze_until: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        completed_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });

      // 7. Reminder History
      await queryInterface.createTable('reminder_history', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        reminder_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'reminders', key: 'id' },
          onDelete: 'CASCADE',
        },
        triggered_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        action_taken: {
          type: DataTypes.ENUM('completed', 'snoozed', 'dismissed'),
          allowNull: false,
        },
        snooze_duration_minutes: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      }, { transaction });

      // 8. Knowledge Nuggets
      await queryInterface.createTable('knowledge_nuggets', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        title: {
          type: DataTypes.STRING(150),
          allowNull: false,
        },
        category: {
          type: DataTypes.ENUM('til', 'best_practice', 'gotcha', 'quick_tip', 'command_ref', 'troubleshooting'),
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        code_example: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        expected_result: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        technology: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        complexity_level: {
          type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
          allowNull: false,
        },
        external_references: {
          type: DataTypes.TEXT, // JSON array
          allowNull: true,
        },
        incident_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'incidents', key: 'id' },
          onDelete: 'SET NULL',
        },
        applicable_to: {
          type: DataTypes.TEXT, // JSON array
          allowNull: true,
        },
        usage_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        helpful_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        rating_sum: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        rating_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        is_verified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        verified_by: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'users', key: 'id' },
        },
        verified_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });

      // 9. Knowledge Nugget Tags
      await queryInterface.createTable('knowledge_nugget_tags', {
        nugget_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'knowledge_nuggets', key: 'id' },
          onDelete: 'CASCADE',
          primaryKey: true,
        },
        tag_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'tags', key: 'id' },
          onDelete: 'CASCADE',
          primaryKey: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });
      /*
      await queryInterface.addConstraint('knowledge_nugget_tags', {
        fields: ['nugget_id', 'tag_id'],
        type: 'primary key',
        name: 'pk_knowledge_nugget_tags',
        transaction,
      });
      */

      // 10. Nugget Comments
      await queryInterface.createTable('nugget_comments', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        nugget_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'knowledge_nuggets', key: 'id' },
          onDelete: 'CASCADE',
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        parent_comment_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: { model: 'nugget_comments', key: 'id' },
          onDelete: 'CASCADE',
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });

      // 11. Quick Tips
      await queryInterface.createTable('quick_tips', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        title: {
          type: DataTypes.STRING(80),
          allowNull: false,
        },
        command: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        explanation: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        technology: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        category: {
          type: DataTypes.ENUM('performance', 'security', 'backup', 'monitoring', 'administration'),
          allowNull: false,
        },
        usage_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });

      // 12. Quick Tip Tags
      await queryInterface.createTable('quick_tip_tags', {
        tip_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'quick_tips', key: 'id' },
          onDelete: 'CASCADE',
          primaryKey: true,
        },
        tag_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'tags', key: 'id' },
          onDelete: 'CASCADE',
          primaryKey: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });
      /*
      await queryInterface.addConstraint('quick_tip_tags', {
        fields: ['tip_id', 'tag_id'],
        type: 'primary key',
        name: 'pk_quick_tip_tags',
        transaction,
      });
      */

      // 13. Lessons Learned
      await queryInterface.createTable('lessons_learned', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        incident_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          references: { model: 'incidents', key: 'id' },
          onDelete: 'CASCADE',
        },
        what_went_well: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        what_went_wrong: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        what_to_do_different: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        key_learnings: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        preventive_measures: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        impact_level: {
          type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
          allowNull: false,
        },
        applicability: {
          type: DataTypes.ENUM('this_server', 'server_type', 'global'),
          allowNull: false,
        },
        action_items: {
          type: DataTypes.TEXT, // JSON array
          allowNull: true,
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });

      // 14. Lessons Learned Tags
      await queryInterface.createTable('lessons_learned_tags', {
        lesson_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'lessons_learned', key: 'id' },
          onDelete: 'CASCADE',
          primaryKey: true,
        },
        tag_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'tags', key: 'id' },
          onDelete: 'CASCADE',
          primaryKey: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });
      /*
      await queryInterface.addConstraint('lessons_learned_tags', {
        fields: ['lesson_id', 'tag_id'],
        type: 'primary key',
        name: 'pk_lessons_learned_tags',
        transaction,
      });
      */

      // 15. Journal Entries
      await queryInterface.createTable('journal_entries', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        entry_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        what_i_did: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        what_i_learned: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        problems_faced: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        pending_tomorrow: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        important_notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        mood: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        daily_tags: {
          type: DataTypes.TEXT, // JSON array
          allowNull: true,
        },
        achievements: {
          type: DataTypes.TEXT, // JSON array
          allowNull: true,
        },
        incidents_worked: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        scripts_executed: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        time_tracked_minutes: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { 
        transaction,
        uniqueKeys: {
          unique_user_date: {
            fields: ['user_id', 'entry_date']
          }
        }
      });
      /*
      await queryInterface.addConstraint('journal_entries', {
        fields: ['user_id', 'entry_date'],
        type: 'unique',
        name: 'unique_user_date',
        transaction,
      });
      */

      // 16. Skill Tracking
      await queryInterface.createTable('skill_tracking', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        skill_category: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        skill_level: {
          type: DataTypes.ENUM('novice', 'competent', 'proficient', 'expert'),
          allowNull: false,
        },
        incidents_resolved: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        nuggets_contributed: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        scripts_executed: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        self_assessment: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        assessment_date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        certifications: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        courses: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        last_activity_date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { 
        transaction,
        uniqueKeys: {
          unique_user_skill: {
            fields: ['user_id', 'skill_category']
          }
        }
      });
      /*
      await queryInterface.addConstraint('skill_tracking', {
        fields: ['user_id', 'skill_category'],
        type: 'unique',
        name: 'unique_user_skill',
        transaction,
      });
      */

      // 17. User Favorites
      await queryInterface.createTable('user_favorites', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        entity_type: {
          type: DataTypes.ENUM('note', 'nugget', 'tip', 'lesson', 'reminder'),
          allowNull: false,
        },
        entity_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { 
        transaction,
        uniqueKeys: {
          unique_favorite: {
            fields: ['user_id', 'entity_type', 'entity_id']
          }
        }
      });
      /*
      await queryInterface.addConstraint('user_favorites', {
        fields: ['user_id', 'entity_type', 'entity_id'],
        type: 'unique',
        name: 'unique_favorite',
        transaction,
      });
      */

      // 18. Notification Queue
      await queryInterface.createTable('notification_queue', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        type: {
          type: DataTypes.ENUM('reminder', 'mention', 'comment', 'share', 'suggestion'),
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        entity_type: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        entity_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        action_url: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('pending', 'sent', 'read', 'dismissed'),
          defaultValue: 'pending',
        },
        priority: {
          type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
          defaultValue: 'medium',
        },
        scheduled_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        sent_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        read_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });

      // 19. Knowledge Topics
      await queryInterface.createTable('knowledge_topics', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        title: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('to_learn', 'in_progress', 'mastered'),
          defaultValue: 'to_learn',
        },
        tags: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        created_by: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });

      // 20. Knowledge Resources
      await queryInterface.createTable('knowledge_resources', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        topic_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'knowledge_topics', key: 'id' },
          onDelete: 'CASCADE',
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM('documentation', 'video', 'course', 'article', 'other'),
          allowNull: false,
        },
        url: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        is_completed: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });

      // 21. User Mentions
      await queryInterface.createTable('user_mentions', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        mentioned_user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
        mentioned_by_user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
        },
        entity_type: {
          type: DataTypes.ENUM('note', 'note_comment', 'nugget', 'nugget_comment'),
          allowNull: false,
        },
        entity_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        is_read: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        read_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Drop in reverse order
      await queryInterface.dropTable('user_mentions', { transaction });
      await queryInterface.dropTable('knowledge_resources', { transaction });
      await queryInterface.dropTable('knowledge_topics', { transaction });
      await queryInterface.dropTable('notification_queue', { transaction });
      await queryInterface.dropTable('user_favorites', { transaction });
      await queryInterface.dropTable('skill_tracking', { transaction });
      await queryInterface.dropTable('journal_entries', { transaction });
      await queryInterface.dropTable('lessons_learned_tags', { transaction });
      await queryInterface.dropTable('lessons_learned', { transaction });
      await queryInterface.dropTable('quick_tip_tags', { transaction });
      await queryInterface.dropTable('quick_tips', { transaction });
      await queryInterface.dropTable('nugget_comments', { transaction });
      await queryInterface.dropTable('knowledge_nugget_tags', { transaction });
      await queryInterface.dropTable('knowledge_nuggets', { transaction });
      await queryInterface.dropTable('reminder_history', { transaction });
      await queryInterface.dropTable('reminders', { transaction });
      await queryInterface.dropTable('note_attachments', { transaction });
      await queryInterface.dropTable('note_reactions', { transaction });
      await queryInterface.dropTable('note_comments', { transaction });
      await queryInterface.dropTable('note_tags', { transaction });
      await queryInterface.dropTable('notes', { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
