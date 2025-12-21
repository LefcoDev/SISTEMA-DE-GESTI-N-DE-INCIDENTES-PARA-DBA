import { Sequelize } from 'sequelize';
import { Server, ServerHealth, Incident, User } from '../models';
import { IncidentService } from './incident.service';
import notificationService from './notification.service';
import logger from '../utils/logger';

export class MonitoringService {
  private incidentService: IncidentService;

  constructor() {
    this.incidentService = new IncidentService();
  }

  async checkAllServers() {
    const servers = await Server.findAll({
      where: {
        status: 'active',
        monitoring_enabled: true
      }
    });

    const results = await Promise.all(servers.map(server => this.checkServer(server)));
    return results;
  }

  async checkServerById(id: number) {
    const server = await Server.findByPk(id);
    if (!server) {
      throw new Error('Server not found');
    }
    return this.checkServer(server);
  }

  async checkServer(server: Server) {
    console.log(`Checking server: ${server.name} (${server.host}:${server.port}) - Type: ${server.engine_type}`);
    const startTime = Date.now();
    let isOnline = false;
    let isServerReachable = false;
    let errorMessage = '';

    // 1. Check Server Reachability (Ping)
    isServerReachable = await this.checkPing(server.host);
    console.log(`Ping result for ${server.host}: ${isServerReachable}`);

    // 2. Check DB Port
    try {
      // Determine dialect
      let dialect = server.engine_type;

      if (dialect === 'oracle') {
        // Oracle specific check using tnsping
        const tnsOk = await this.checkTnsPing(server.host, server.port, server.service_name, server.manual_tns);
        if (!tnsOk) {
          throw new Error('TNS Ping failed (Listener unreachable)');
        }
        
        // Level 3: Deep Check (Real Connection)
        if (server.monitoring_user && server.monitoring_password) {
           await this.checkOracleConnection(server);
           console.log(`Oracle Deep Check to ${server.host}:${server.port} successful`);
        } else {
           console.log(`Skipping Oracle Deep Check: No credentials`);
        }

        isOnline = true;
        console.log(`TNS Ping to ${server.host}:${server.port} successful`);
      } else {
        if (dialect === 'sqlserver') dialect = 'mssql' as any;
        if (dialect === 'postgresql') dialect = 'postgres' as any;
        
        // TCP Check
        await this.checkTcpConnection(server.host, server.port);
        isOnline = true;
        console.log(`TCP connection to ${server.host}:${server.port} successful`);
      }

    } catch (error: any) {
      isOnline = false;
      errorMessage = error.message;
      console.log(`Connection check to ${server.host}:${server.port} failed: ${errorMessage}`);
    }

    const responseTime = Date.now() - startTime;

    // Save health check
    await ServerHealth.create({
      server_id: server.id,
      server_reachable: isServerReachable,
      is_online: isOnline,
      response_time_ms: responseTime,
      error_message: errorMessage ? errorMessage.substring(0, 255) : undefined,
      checked_at: new Date()
    });

    // Determine current status
    const currentStatus = (isServerReachable && isOnline) ? 'online' : 'offline';
    const previousStatus = server.last_status;

    // Update server last check and status
    await server.update({ 
      last_check: new Date(),
      last_status: currentStatus
    });

    // Determine if we should send notification
    // First time (previousStatus is null): Only alert if server is DOWN
    // After first time: Only alert if status CHANGED
    const isFirstCheck = previousStatus === null;
    const statusChanged = previousStatus !== null && previousStatus !== currentStatus;
    const shouldAlert = (isFirstCheck && currentStatus === 'offline') || statusChanged;

    console.log(`Status check for ${server.name}: Previous=${previousStatus}, Current=${currentStatus}, FirstCheck=${isFirstCheck}, Changed=${statusChanged}, ShouldAlert=${shouldAlert}`);

    // Handle Incident Creation/Resolution
    if (!isServerReachable) {
      if (shouldAlert) {
        console.log(`Sending alert: Server ${server.name} is unreachable`);
        await this.handleServerDown(server, "Server Host Unreachable (Ping Failed)");
      }
    } else if (!isOnline) {
      if (shouldAlert) {
        console.log(`Sending alert: Database ${server.name} service is down`);
        await this.handleServerDown(server, "Database Service Unreachable (Port Closed): " + errorMessage);
      }
    } else {
      // Server is online - only notify if it was previously offline (recovery)
      if (statusChanged && previousStatus === 'offline') {
        console.log(`Sending recovery alert: Server ${server.name} is back online`);
        await this.handleServerRecovery(server);
      }
    }

    return { server: server.name, isOnline, isServerReachable, responseTime };
  }

  private checkPing(host: string): Promise<boolean> {
    return new Promise((resolve) => {
      const { exec } = require('child_process');
      // Windows ping
      exec(`ping -n 1 ${host}`, (error: any, stdout: string, stderr: string) => {
        if (error) {
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
  }

  private checkTnsPing(host: string, port: number, serviceName?: string, manualTns?: string): Promise<boolean> {
    return new Promise((resolve) => {
      const { exec } = require('child_process');
      // Construct a TNS address string
      // If manualTns is provided, use it.
      // If serviceName is provided, use it. Otherwise, try to ping just the listener address.
      let tnsAddress;
      if (manualTns) {
        tnsAddress = manualTns;
      } else if (serviceName) {
        tnsAddress = `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${host})(PORT=${port}))(CONNECT_DATA=(SERVICE_NAME=${serviceName})))`;
      } else {
        tnsAddress = `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${host})(PORT=${port})))`;
      }
      
      const command = `tnsping "${tnsAddress}"`;
      
      console.log(`Executing: ${command}`);
      
      exec(command, (error: any, stdout: string, stderr: string) => {
        if (error) {
          console.log(`TNS Ping execution failed: ${error.message}`);
          // If tnsping is not found, we might want to fallback or just fail.
          // For now, we assume it's a requirement.
          resolve(false);
          return;
        }
        
        // Check output for "OK" or "Realizado correctamente" (Spanish)
        // Example output: "OK (20 msec)" or "Realizado correctamente (20 mseg)"
        if (stdout && (stdout.includes("OK") || stdout.includes("Realizado correctamente") || stdout.includes("mseg") || stdout.includes("msec"))) {
             resolve(true);
        } else {
             console.log(`TNS Ping output did not contain OK/Realizado: ${stdout}`);
             resolve(false);
        }
      });
    });
  }

  private checkOracleConnection(server: Server): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!server.monitoring_user || !server.monitoring_password) {
        // If no credentials, we skip this check (or consider it success if TNS was OK)
        // But the user wants deep monitoring. Let's log a warning and resolve.
        console.log(`Skipping Oracle deep check for ${server.name}: No credentials provided`);
        resolve();
        return;
      }

      const { exec } = require('child_process');
      // Using sqlplus to check connection
      // Format: sqlplus -L user/pass@//host:port/service_name
      // We need service name. If not available, we might have issues.
      // Assuming SID/Service Name is part of the connection string or we use a default.
      // Since we don't have a service name field in Server model explicitly (it might be in engine_version or description?), 
      // we will try to use a common pattern or just the host/port if EZCONNECT allows.
      // EZCONNECT: user/password@//host:port/service_name
      
      // IMPORTANT: We need a service name. Let's assume 'ORCL' or 'XE' if not provided, 
      // OR we should add a service_name field. 
      // Use the configured service name or default to 'orcl'
      const serviceName = server.service_name || 'orcl';
      
      let connectionString;
      if (server.manual_tns) {
        // If manual TNS is provided, use it directly in the connection string
        // Format: user/pass@"(DESCRIPTION=...)"
        connectionString = `${server.monitoring_user}/${server.monitoring_password}@"${server.manual_tns}"`;
      } else {
        connectionString = `${server.monitoring_user}/${server.monitoring_password}@//${server.host}:${server.port}/${serviceName}`;
      }
      
      // We need a simple SQL script to run.
      // Alternatively, we can just run a simple command inline.
      // sqlplus -L user/pass@... <<< "SELECT 1 FROM DUAL; EXIT;"
      
      const commandInline = `echo SELECT 1 FROM DUAL; | sqlplus -L "${connectionString}"`;
      
      console.log(`Executing Oracle Deep Check: sqlplus -L ...`);

      exec(commandInline, (error: any, stdout: string, stderr: string) => {
        if (error) {
          console.log(`Oracle Deep Check failed: ${error.message}`);
          // Clean error message - remove connection string with credentials
          const cleanMessage = error.message.replace(/sqlplus -L ".*?"/, 'sqlplus -L [credentials hidden]');
          reject(new Error(`Database Connection Failed: SELECT 1 FROM DUAL;`));
          return;
        }
        
        if (stdout && stdout.includes("ORA-")) {
           // Extract ORA error
           const match = stdout.match(/(ORA-\d+)/);
           const oraError = match ? match[1] : "Unknown ORA Error";
           reject(new Error(`Database Error: ${oraError}`));
           return;
        } else if (stdout && stdout.includes("1")) {
           resolve();
           return;
        } else {
           // Fallback if we connected but didn't get expected output
           // If sqlplus didn't return error code, it might be fine.
           // But we want to be sure.
           if (stdout.includes("Connected to")) {
             resolve();
           } else {
             reject(new Error("Database Connection Failed: SELECT 1 FROM DUAL;"));
           }
        }
      });
    });
  }

  private checkTcpConnection(host: string, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const net = require('net');
      const socket = new net.Socket();
      const timeout = 5000;

      socket.setTimeout(timeout);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve();
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timed out'));
      });

      socket.on('error', (err: any) => {
        socket.destroy();
        reject(err);
      });

      socket.connect(port, host);
    });
  }

  private async handleServerDown(server: Server, error: string) {
    try {
      console.log(`[handleServerDown] Processing alert for ${server.name}`);
      
      // Determine if it's a database or server based on engine_type
      const isDatabase = ['oracle', 'mysql', 'postgresql', 'sqlserver', 'mongodb'].includes(server.engine_type.toLowerCase());
      const alertTitle = isDatabase ? 'BD Offline Alert' : 'Server Offline Alert';
      const entityType = isDatabase ? 'Base de Datos' : 'Servidor';

      // ALWAYS send monitoring alerts (independent of incident creation)
      const allUsers = await User.findAll();
      console.log(`[handleServerDown] Found ${allUsers.length} users to notify`);

      if (allUsers.length > 0) {
        const userIds = allUsers.map(u => u.id);
        
        console.log(`[handleServerDown] Sending monitoring alert to users: ${userIds.join(', ')}`);
        
        // Send monitoring alert notification
        await notificationService.createMonitoringAlert(userIds, {
          serverName: server.name,
          serverType: server.engine_type,
          status: 'Offline',
          message: error,
        });

        logger.info(`Sent monitoring alerts to ${userIds.length} users for server ${server.name}`);
      } else {
        console.warn(`[handleServerDown] No users found to notify!`);
      }

      // Check if there is already an open incident for this server
      const openIncident = await Incident.findOne({
        where: {
          server_id: server.id,
          status: ['new', 'in_progress', 'on_hold'],
          title: alertTitle
        }
      });

      console.log(`[handleServerDown] Open incident exists: ${!!openIncident}`);

      // Create incident only if one doesn't exist (incidents are just for tracking)
      if (!openIncident) {
        // Find a user to assign as creator (System or Admin)
        const systemUser = await User.findOne({ order: [['id', 'ASC']] });
        const userId = systemUser ? systemUser.id : 1;

        // Create new incident (this will trigger incident notification separately)
        await this.incidentService.create({
          title: alertTitle,
          description: `${entityType} ${server.name} (${server.host}) is unreachable.\nError: ${error}`,
          server_id: server.id,
          type: 'availability',
          severity: server.environment === 'production' ? 'critical' : 'high',
          status: 'new',
          created_by: userId,
          detected_at: new Date()
        }, userId);

        console.log(`[handleServerDown] Created new incident for ${server.name}`);
      } else {
        console.log(`[handleServerDown] Incident already exists, not creating duplicate`);
      }
    } catch (err: any) {
      console.error(`[handleServerDown] ERROR for server ${server.name}:`, err);
      console.error(err.stack);
      // Do not throw, so the monitoring check can complete and return status
    }
  }

  private async handleServerRecovery(server: Server) {
    try {
      console.log(`[handleServerRecovery] Processing recovery for ${server.name}`);
      
      // Determine if it's a database or server based on engine_type
      const isDatabase = ['oracle', 'mysql', 'postgresql', 'sqlserver', 'mongodb'].includes(server.engine_type.toLowerCase());
      const alertTitle = isDatabase ? 'BD Offline Alert' : 'Server Offline Alert';

      // ALWAYS send recovery alerts (independent of incident resolution)
      const allUsers = await User.findAll();
      console.log(`[handleServerRecovery] Found ${allUsers.length} users to notify`);

      if (allUsers.length > 0) {
        const userIds = allUsers.map(u => u.id);
        
        console.log(`[handleServerRecovery] Sending recovery alert to users: ${userIds.join(', ')}`);
        
        await notificationService.createMonitoringAlert(userIds, {
          serverName: server.name,
          serverType: server.engine_type,
          status: 'Recovered',
          message: 'Server is now online and responding',
        });

        logger.info(`Sent recovery notification to ${userIds.length} users for server ${server.name}`);
      } else {
        console.warn(`[handleServerRecovery] No users found to notify!`);
      }

      // Find open incident to auto-resolve (incidents are just for tracking)
      const openIncident = await Incident.findOne({
        where: {
          server_id: server.id,
          status: ['new', 'in_progress', 'on_hold'],
          title: alertTitle
        }
      });

      console.log(`[handleServerRecovery] Open incident exists: ${!!openIncident}`);

      if (openIncident) {
        // Auto-resolve the incident
        await openIncident.update({
          status: 'resolved',
          description: openIncident.description + `\n\n[System]: Server recovered at ${new Date().toISOString()}`
        });

        console.log(`[handleServerRecovery] Resolved incident for ${server.name}`);
      } else {
        console.log(`[handleServerRecovery] No open incident found for ${server.name}`);
      }
    } catch (err: any) {
      console.error(`[handleServerRecovery] ERROR for server ${server.name}:`, err);
      console.error(err.stack);
    }
  }
}
