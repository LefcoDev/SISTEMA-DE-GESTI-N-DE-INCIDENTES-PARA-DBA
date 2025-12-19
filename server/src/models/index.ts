import User from './User';
import Server from './Server';
import Incident from './Incident';
import Solution from './Solution';
import Script from './Script';
import Tag from './Tag';
import IncidentTag from './IncidentTag';
import ScriptTag from './ScriptTag';
import Attachment from './Attachment';
import ExecutionHistory from './ExecutionHistory';
import AuditLog from './AuditLog';
import IncidentHistory from './IncidentHistory';
import AppSettings from './AppSettings';
import ServerHealth from './ServerHealth';
import Note from './Note';
import Reminder from './Reminder';
import KnowledgeNugget from './KnowledgeNugget';
import JournalEntry from './JournalEntry';
import KnowledgeTopic from './KnowledgeTopic';
import KnowledgeResource from './KnowledgeResource';
import NotificationQueue from './NotificationQueue';

import NoteTag from './NoteTag';
import KnowledgeTag from './KnowledgeTag';

// Define associations

// User associations
User.hasMany(Server, { foreignKey: 'created_by' });
Server.belongsTo(User, { foreignKey: 'created_by' });

Server.hasMany(ServerHealth, { foreignKey: 'server_id', as: 'healthChecks' });
ServerHealth.belongsTo(Server, { foreignKey: 'server_id' });

User.hasMany(Incident, { foreignKey: 'created_by', as: 'createdIncidents' });
Incident.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(Incident, { foreignKey: 'assigned_to', as: 'assignedIncidents' });
Incident.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

User.hasMany(Solution, { foreignKey: 'applied_by', as: 'appliedSolutions' });
Solution.belongsTo(User, { foreignKey: 'applied_by', as: 'applicator' });

User.hasMany(Script, { foreignKey: 'created_by' });
Script.belongsTo(User, { foreignKey: 'created_by' });

User.hasMany(Attachment, { foreignKey: 'uploaded_by' });
Attachment.belongsTo(User, { foreignKey: 'uploaded_by' });

User.hasMany(ExecutionHistory, { foreignKey: 'executed_by' });
ExecutionHistory.belongsTo(User, { foreignKey: 'executed_by' });

User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(IncidentHistory, { foreignKey: 'changed_by' });
IncidentHistory.belongsTo(User, { foreignKey: 'changed_by' });

User.hasMany(AppSettings, { foreignKey: 'user_id' });
AppSettings.belongsTo(User, { foreignKey: 'user_id' });

// Notes Module Associations
User.hasMany(Note, { foreignKey: 'created_by' });
Note.belongsTo(User, { foreignKey: 'created_by' });

User.hasMany(Reminder, { foreignKey: 'created_by' });
Reminder.belongsTo(User, { foreignKey: 'created_by' });

User.hasMany(KnowledgeNugget, { foreignKey: 'created_by' });
KnowledgeNugget.belongsTo(User, { foreignKey: 'created_by' });

User.hasMany(JournalEntry, { foreignKey: 'user_id' });
JournalEntry.belongsTo(User, { foreignKey: 'user_id' });

// Server associations
Server.hasMany(Incident, { foreignKey: 'server_id', as: 'incidents' });
Incident.belongsTo(Server, { foreignKey: 'server_id', as: 'server' });

Server.hasMany(ExecutionHistory, { foreignKey: 'server_id' });
ExecutionHistory.belongsTo(Server, { foreignKey: 'server_id' });

Server.hasMany(Note, { foreignKey: 'server_id' });
Note.belongsTo(Server, { foreignKey: 'server_id' });

Server.hasMany(Reminder, { foreignKey: 'server_id' });
Reminder.belongsTo(Server, { foreignKey: 'server_id' });

// Incident associations
Incident.hasMany(Solution, { foreignKey: 'incident_id', as: 'solutions' });
Solution.belongsTo(Incident, { foreignKey: 'incident_id', as: 'incident' });

Incident.hasMany(Attachment, { foreignKey: 'incident_id' });
Attachment.belongsTo(Incident, { foreignKey: 'incident_id' });

Incident.hasMany(IncidentHistory, { foreignKey: 'incident_id' });
IncidentHistory.belongsTo(Incident, { foreignKey: 'incident_id' });

Incident.belongsToMany(Tag, { through: IncidentTag, foreignKey: 'incident_id' });
Tag.belongsToMany(Incident, { through: IncidentTag, foreignKey: 'tag_id' });

Incident.hasMany(Note, { foreignKey: 'incident_id' });
Note.belongsTo(Incident, { foreignKey: 'incident_id' });

Incident.hasMany(Reminder, { foreignKey: 'incident_id' });
Reminder.belongsTo(Incident, { foreignKey: 'incident_id' });

Incident.hasMany(KnowledgeNugget, { foreignKey: 'incident_id' });
KnowledgeNugget.belongsTo(Incident, { foreignKey: 'incident_id' });

// Script associations
Script.hasMany(ExecutionHistory, { foreignKey: 'script_id' });
ExecutionHistory.belongsTo(Script, { foreignKey: 'script_id' });

Script.belongsToMany(Tag, { through: ScriptTag, foreignKey: 'script_id' });
Tag.belongsToMany(Script, { through: ScriptTag, foreignKey: 'tag_id' });

Script.hasMany(Note, { foreignKey: 'script_id' });
Note.belongsTo(Script, { foreignKey: 'script_id' });

Script.hasMany(Reminder, { foreignKey: 'script_id' });
Reminder.belongsTo(Script, { foreignKey: 'script_id' });

// Note associations
Note.hasMany(Reminder, { foreignKey: 'note_id' });
Reminder.belongsTo(Note, { foreignKey: 'note_id' });

Note.belongsToMany(Tag, { through: NoteTag, foreignKey: 'note_id' });
Tag.belongsToMany(Note, { through: NoteTag, foreignKey: 'tag_id' });

Note.hasMany(Attachment, { foreignKey: 'note_id' });
Attachment.belongsTo(Note, { foreignKey: 'note_id' });

// Knowledge Nugget associations
KnowledgeNugget.belongsToMany(Tag, { through: KnowledgeTag, foreignKey: 'knowledge_nugget_id' });
Tag.belongsToMany(KnowledgeNugget, { through: KnowledgeTag, foreignKey: 'tag_id' });

// Knowledge Topic associations
User.hasMany(KnowledgeTopic, { foreignKey: 'created_by' });
KnowledgeTopic.belongsTo(User, { foreignKey: 'created_by' });

// Knowledge Resource associations
KnowledgeTopic.hasMany(KnowledgeResource, { foreignKey: 'topic_id' });
KnowledgeResource.belongsTo(KnowledgeTopic, { foreignKey: 'topic_id' });

// Notification associations
User.hasMany(NotificationQueue, { foreignKey: 'user_id' });
NotificationQueue.belongsTo(User, { foreignKey: 'user_id' });

export {
  User,
  Server,
  Incident,
  Solution,
  Script,
  Tag,
  IncidentTag,
  ScriptTag,
  NoteTag,
  KnowledgeTag,
  Attachment,
  ExecutionHistory,
  AuditLog,
  IncidentHistory,
  AppSettings,
  ServerHealth,
  Note,
  Reminder,
  KnowledgeNugget,
  JournalEntry,
  KnowledgeTopic,
  KnowledgeResource,
  NotificationQueue
};
