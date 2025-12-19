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

User.hasMany(Solution, { foreignKey: 'applied_by' });
Solution.belongsTo(User, { foreignKey: 'applied_by' });

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

// Server associations
Server.hasMany(Incident, { foreignKey: 'server_id', as: 'incidents' });
Incident.belongsTo(Server, { foreignKey: 'server_id', as: 'server' });

Server.hasMany(ExecutionHistory, { foreignKey: 'server_id' });
ExecutionHistory.belongsTo(Server, { foreignKey: 'server_id' });

// Incident associations
Incident.hasMany(Solution, { foreignKey: 'incident_id' });
Solution.belongsTo(Incident, { foreignKey: 'incident_id' });

Incident.hasMany(Attachment, { foreignKey: 'incident_id' });
Attachment.belongsTo(Incident, { foreignKey: 'incident_id' });

Incident.hasMany(IncidentHistory, { foreignKey: 'incident_id' });
IncidentHistory.belongsTo(Incident, { foreignKey: 'incident_id' });

Incident.belongsToMany(Tag, { through: IncidentTag, foreignKey: 'incident_id' });
Tag.belongsToMany(Incident, { through: IncidentTag, foreignKey: 'tag_id' });

// Script associations
Script.hasMany(ExecutionHistory, { foreignKey: 'script_id' });
ExecutionHistory.belongsTo(Script, { foreignKey: 'script_id' });

Script.belongsToMany(Tag, { through: ScriptTag, foreignKey: 'script_id' });
Tag.belongsToMany(Script, { through: ScriptTag, foreignKey: 'tag_id' });

export {
  User,
  Server,
  Incident,
  Solution,
  Script,
  Tag,
  IncidentTag,
  ScriptTag,
  Attachment,
  ExecutionHistory,
  AuditLog,
  IncidentHistory,
  AppSettings,
  ServerHealth
};
