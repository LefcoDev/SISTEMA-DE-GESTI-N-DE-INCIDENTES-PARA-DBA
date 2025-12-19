DOCUMENTO DE REQUERIMIENTOS - SISTEMA DE GESTIÓN DE INCIDENTES PARA DBA1. INFORMACIÓN GENERAL DEL PROYECTO1.1 Nombre del Proyecto
DBA Incident Manager1.2 Descripción
Aplicación de escritorio para administradores de bases de datos que permite registrar, gestionar y resolver incidentes, solicitudes y problemas relacionados con bases de datos. La aplicación funcionará de manera local con capacidad offline y proporcionará herramientas de análisis, búsqueda y generación de reportes.1.3 Objetivos

Centralizar la documentación de incidentes y soluciones en bases de datos
Reducir el tiempo de resolución mediante sugerencias basadas en casos históricos
Proporcionar métricas y análisis sobre incidentes recurrentes
Facilitar la transferencia de conocimiento entre DBAs
Mantener un repositorio de scripts y soluciones reutilizables
2. REQUERIMIENTOS FUNCIONALES2.1 Módulo de Autenticación y UsuariosRF-001: Registro de Usuario

El sistema debe permitir crear una cuenta de usuario con los siguientes campos:

Nombre completo (obligatorio)
Correo electrónico (obligatorio, único)
Contraseña (obligatorio, mínimo 8 caracteres)
Rol (DBA Senior, DBA Junior, Administrador)
Foto de perfil (opcional)


La contraseña debe ser hasheada usando bcrypt con salt rounds de 10
El sistema debe validar formato de email y fortaleza de contraseña
RF-002: Inicio de Sesión

El sistema debe autenticar usuarios mediante email y contraseña
El sistema debe generar un token JWT con expiración de 24 horas
El sistema debe mantener la sesión activa mientras la aplicación esté abierta
El sistema debe cerrar sesión automáticamente después de 24 horas de inactividad
RF-003: Gestión de Perfil

El usuario debe poder editar su información personal
El usuario debe poder cambiar su contraseña proporcionando la actual
El usuario debe poder subir/cambiar su foto de perfil
2.2 Módulo de Servidores de Base de DatosRF-004: Registro de Servidores

El sistema debe permitir registrar servidores de base de datos con:

Nombre del servidor (obligatorio)
Tipo de motor (MySQL, PostgreSQL, SQL Server, Oracle, MongoDB)
Host/IP (obligatorio)
Puerto (obligatorio)
Ambiente (Desarrollo, QA, Staging, Producción)
Descripción (opcional)
Versión del motor (opcional)
Tags personalizados (opcional)
Estado (Activo, Inactivo, En Mantenimiento)


RF-005: Listado de Servidores

El sistema debe mostrar todos los servidores en una tabla con:

Filtros por tipo de motor, ambiente y estado
Búsqueda por nombre o host
Ordenamiento por nombre, tipo o ambiente
Paginación de 20 registros por página


RF-006: Edición y Eliminación de Servidores

El sistema debe permitir editar toda la información de un servidor
El sistema debe permitir eliminar servidores sin incidentes asociados
El sistema debe mostrar advertencia si el servidor tiene incidentes asociados
Al eliminar, debe ofrecer opción de desasociar incidentes o cancelar
2.3 Módulo de IncidentesRF-007: Creación de Incidentes

El sistema debe permitir crear incidentes con:

Título (obligatorio, máximo 200 caracteres)
Descripción detallada (obligatorio, texto enriquecido)
Servidor afectado (obligatorio, selección desde catálogo)
Tipo de incidente (Performance, Disponibilidad, Corrupción de datos, Backup/Restore, Replicación, Seguridad, Capacidad, Consulta lenta, Deadlock, Otro)
Severidad (Crítica, Alta, Media, Baja)
Fecha y hora de detección (obligatorio, por defecto timestamp actual)
Usuario reportante (opcional)
Impacto estimado (Crítico - Sistema caído, Alto - Funcionalidad afectada, Medio - Degradación, Bajo - Sin impacto visible)
Tags personalizados (múltiples, opcional)
Adjuntos (logs, capturas de pantalla, scripts)


RF-008: Estados de Incidentes

El sistema debe gestionar los siguientes estados:

Nuevo: Incidente recién creado
En Progreso: Se está trabajando en la resolución
En Espera: Esperando información externa o aprobaciones
Resuelto: Problema solucionado
Cerrado: Incidente finalizado y documentado


El sistema debe registrar timestamp de cada cambio de estado
El sistema debe calcular automáticamente SLA basado en timestamps
RF-009: Listado de Incidentes

El sistema debe mostrar incidentes en una tabla con:

Vista predeterminada: últimos 50 incidentes
Columnas: ID, Título, Servidor, Tipo, Severidad, Estado, Fecha creación, Tiempo de resolución
Filtros múltiples:

Por estado (checkboxes múltiples)
Por severidad (checkboxes múltiples)
Por tipo de incidente (dropdown)
Por servidor (autocomplete)
Por rango de fechas (date picker)
Por tags (selección múltiple)


Búsqueda full-text en título y descripción
Ordenamiento por cualquier columna
Indicador visual de severidad mediante colores:

Crítica: rojo
Alta: naranja
Media: amarillo
Baja: verde




RF-010: Detalle de Incidente

El sistema debe mostrar una vista completa del incidente con:

Toda la información registrada
Timeline de cambios de estado con timestamps y usuario
Lista de soluciones aplicadas
Archivos adjuntos con opción de descarga
Scripts ejecutados
Comentarios y notas
Incidentes relacionados/similares sugeridos automáticamente


RF-011: Edición de Incidentes

El sistema debe permitir editar incidentes en estado Nuevo, En Progreso o En Espera
El sistema debe registrar historial de cambios con:

Campo modificado
Valor anterior
Valor nuevo
Usuario que realizó el cambio
Timestamp del cambio


Los incidentes Cerrados no deben ser editables, solo consultables
RF-012: Adjuntar Archivos a Incidentes

El sistema debe permitir adjuntar archivos con:

Tipos permitidos: .log, .txt, .sql, .png, .jpg, .jpeg, .pdf, .zip
Tamaño máximo por archivo: 10MB
Cantidad máxima de archivos: 20 por incidente
Almacenamiento en filesystem con referencia en base de datos
Visualización de miniatura para imágenes
Opción de descarga individual o en lote (zip)


2.4 Módulo de SolucionesRF-013: Registro de Soluciones

El sistema debe permitir documentar soluciones con:

Incidente asociado (obligatorio)
Descripción de la solución (obligatorio, texto enriquecido)
Scripts SQL ejecutados (opcional, con syntax highlighting)
Comandos de sistema ejecutados (opcional)
Referencias externas (URLs, documentación)
Tiempo invertido en la resolución (horas y minutos)
Resultado obtenido (texto libre)
Fecha y hora de aplicación (timestamp automático)


RF-014: Plantillas de Solución

El sistema debe permitir marcar soluciones como plantillas reutilizables
Las plantillas deben incluir:

Nombre descriptivo
Categoría (Performance, Seguridad, Backup, etc.)
Descripción general
Scripts parametrizados
Pasos de ejecución
Precauciones y advertencias


El usuario debe poder instanciar una plantilla en un nuevo incidente
RF-015: Sugerencias Automáticas de Soluciones

Al crear/editar un incidente, el sistema debe buscar incidentes similares mediante:

Coincidencia de palabras clave en título y descripción
Mismo tipo de incidente
Mismo servidor o tipo de motor
Tags comunes


El sistema debe mostrar top 5 incidentes similares con:

Título del incidente
Porcentaje de similitud
Estado de resolución
Link directo para ver la solución aplicada


2.5 Módulo de Biblioteca de ScriptsRF-016: Gestión de Scripts

El sistema debe permitir almacenar scripts con:

Nombre del script (obligatorio)
Descripción (obligatorio)
Lenguaje (SQL, Bash, PowerShell, Python)
Código del script (obligatorio)
Categoría (Mantenimiento, Monitoreo, Backup, Performance, Administración)
Motor de BD compatible (MySQL, PostgreSQL, etc.)
Parámetros requeridos (descripción)
Tags (múltiples)
Frecuencia de uso (contador automático)


RF-017: Ejecución de Scripts

El sistema debe incluir un editor de código con:

Syntax highlighting según lenguaje
Numeración de líneas
Auto-completado básico de palabras clave SQL
Atajos de teclado (Ctrl+Enter para ejecutar)
Validación de sintaxis SQL básica


El sistema debe permitir seleccionar un servidor destino
El sistema debe mostrar confirmación antes de ejecutar comandos DDL (CREATE, ALTER, DROP) o DML destructivo (DELETE, TRUNCATE, UPDATE sin WHERE)
El sistema debe mostrar resultados de ejecución:

Filas afectadas
Tiempo de ejecución
Resultado en tabla (para SELECT)
Mensajes de error
Opción de exportar resultados a CSV


RF-018: Historial de Ejecuciones

El sistema debe registrar cada ejecución de script con:

Script ejecutado
Servidor donde se ejecutó
Usuario que ejecutó
Timestamp de ejecución
Resultado (exitoso/fallido)
Tiempo de ejecución
Filas afectadas
Mensaje de error (si aplica)


El historial debe ser consultable con filtros por fecha, servidor y usuario
2.6 Módulo de Dashboard y ReportesRF-019: Dashboard Principal

El sistema debe mostrar un dashboard con:

KPIs principales en cards:

Total de incidentes activos
Total de incidentes resueltos en el mes
Tiempo promedio de resolución
Incidentes críticos abiertos


Gráfico de barras: Incidentes por mes (últimos 12 meses)
Gráfico de dona: Distribución por severidad
Gráfico de barras horizontal: Top 10 tipos de incidentes más frecuentes
Tabla: Últimos 10 incidentes registrados
Tabla: Top 5 servidores con más incidentes
Gráfico de línea: Tendencia de tiempo de resolución por mes


Todos los gráficos deben ser interactivos con tooltips
RF-020: Reportes Personalizados

El sistema debe permitir generar reportes con:

Selección de rango de fechas
Filtros por servidor, tipo, severidad, estado
Métricas a incluir:

Cantidad total de incidentes
Distribución por tipo
Distribución por severidad
Tiempo promedio de resolución
SLA cumplido vs no cumplido
Incidentes recurrentes


Formato de salida: PDF o Excel
Opción de incluir gráficos
Opción de incluir listado detallado de incidentes


RF-021: Análisis de Tendencias

El sistema debe proporcionar vista de análisis con:

Identificación de incidentes recurrentes (mismo tipo en mismo servidor)
Servidores más problemáticos del período
Tipos de incidentes en aumento/disminución
Horarios de mayor incidencia
Comparativa de períodos (mes actual vs mes anterior)


2.7 Módulo de Búsqueda GlobalRF-022: Búsqueda Avanzada

El sistema debe proporcionar una búsqueda global que incluya:

Incidentes (título, descripción, soluciones)
Servidores (nombre, host, descripción)
Scripts (nombre, descripción, código)
Tags


La búsqueda debe soportar:

Búsqueda full-text
Operadores booleanos (AND, OR, NOT)
Búsqueda por frases exactas (entre comillas)
Filtro por tipo de entidad
Ordenamiento por relevancia o fecha


Los resultados deben mostrar:

Tipo de entidad
Título/Nombre
Fragmento destacado con coincidencia
Link directo a la entidad


2.8 Módulo de ConfiguraciónRF-023: Configuración de Aplicación

El sistema debe permitir configurar:

Tema visual (Claro, Oscuro, Auto según sistema)
Idioma (Español, Inglés)
Cantidad de registros por página
Formato de fecha y hora
Ubicación de backup automático
Frecuencia de backup automático
Tiempo de sesión antes de logout
Tipos de incidente personalizados
Categorías de scripts personalizadas


RF-024: Gestión de Tags

El sistema debe permitir:

Crear tags personalizados
Editar nombre de tags existentes
Eliminar tags (si no están en uso)
Ver cantidad de uso por tag
Asignar colores a tags


RF-025: Backup y Restauración

El sistema debe permitir:

Crear backup manual de la base de datos
Programar backups automáticos (diario, semanal)
Almacenar backups en ubicación configurable
Listar backups existentes con fecha y tamaño
Restaurar desde un backup específico
Limpiar backups antiguos (mantener últimos N)

### 2.9 Módulo de Monitoreo y Alertas (NUEVO)

#### RF-027: Sistema de Monitoreo de Servidores

**Descripción:**
El sistema debe monitorear proactivamente el estado de los servidores registrados y generar alertas automáticas cuando detecte problemas.

**Funcionalidades:**

1. **Health Checks Automáticos:**
   - Ping periódico a servidores registrados
   - Verificación de conexión a base de datos
   - Monitoreo de métricas básicas (conexiones, queries lentas, espacio en disco)
   - Frecuencia configurable (1, 5, 15, 30 minutos)

2. **Alertas Multi-Canal:**
   - Notificación in-app (push notification en Electron)
   - Email automático
   - Webhook opcional (Slack, Teams, Discord)
   - SMS opcional (Twilio)

3. **Creación Automática de Incidentes:**
   - Generar incidente automáticamente cuando servidor no responde
   - Severidad automática basada en ambiente (Producción = Crítica)
   - Vincular a servidor afectado
   - Incluir logs de diagnóstico automático

4. **Dashboard de Monitoreo:**
   - Vista en tiempo real del estado de todos los servidores
   - Indicadores: Online (verde), Degradado (amarillo), Offline (rojo)
   - Tiempo de respuesta promedio
   - Uptime percentage
   - Historial de caídas

5. **Scripts de Monitoreo Remotos:**
   - Agente ligero instalable en servidores
   - Script que ejecuta en servidor y reporta a la app
   - Reporte de métricas detalladas
🏗️ Arquitectura de Solución
Hay 3 enfoques que puedes implementar:
Enfoque 1: Monitoreo desde la App Electron (Más Simple)
La app hace health checks periódicos a tus servidores.
typescript// server/src/services/monitoring.service.ts

import { createConnection } from 'mysql2/promise';
import nodemailer from 'nodemailer';
import { Server } from '../models/Server';
import { Incident } from '../models/Incident';
import logger from '../utils/logger';

interface HealthCheckResult {
  serverId: number;
  isOnline: boolean;
  responseTime: number;
  error?: string;
  timestamp: Date;
}

class MonitoringService {
  private checkIntervals: Map<number, NodeJS.Timeout> = new Map();
  
  // Iniciar monitoreo de un servidor
  async startMonitoring(serverId: number, intervalMinutes: number = 5) {
    // Detener monitoreo previo si existe
    this.stopMonitoring(serverId);
    
    // Ejecutar check inicial
    await this.performHealthCheck(serverId);
    
    // Programar checks periódicos
    const interval = setInterval(async () => {
      await this.performHealthCheck(serverId);
    }, intervalMinutes * 60 * 1000);
    
    this.checkIntervals.set(serverId, interval);
    logger.info(`Monitoring started for server ${serverId} every ${intervalMinutes} minutes`);
  }
  
  // Detener monitoreo
  stopMonitoring(serverId: number) {
    const interval = this.checkIntervals.get(serverId);
    if (interval) {
      clearInterval(interval);
      this.checkIntervals.delete(serverId);
      logger.info(`Monitoring stopped for server ${serverId}`);
    }
  }
  
  // Realizar health check
  async performHealthCheck(serverId: number): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const server = await Server.findByPk(serverId);
      if (!server) {
        throw new Error('Server not found');
      }
      
      // Intentar conexión
      const connection = await createConnection({
        host: server.host,
        port: server.port,
        user: server.username, // Agregar estos campos al modelo
        password: server.password,
        database: 'information_schema',
        connectTimeout: 10000 // 10 segundos timeout
      });
      
      // Ejecutar query simple
      await connection.query('SELECT 1');
      await connection.end();
      
      const responseTime = Date.now() - startTime;
      
      const result: HealthCheckResult = {
        serverId,
        isOnline: true,
        responseTime,
        timestamp: new Date()
      };
      
      // Guardar resultado
      await this.saveHealthCheck(result);
      
      // Verificar si estaba caído y ahora está arriba (recuperación)
      await this.checkRecovery(serverId);
      
      return result;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      const result: HealthCheckResult = {
        serverId,
        isOnline: false,
        responseTime,
        error: error.message,
        timestamp: new Date()
      };
      
      // Guardar resultado
      await this.saveHealthCheck(result);
      
      // Crear alerta y posible incidente
      await this.handleServerDown(serverId, error.message);
      
      return result;
    }
  }
  
  // Manejar servidor caído
  async handleServerDown(serverId: number, errorMessage: string) {
    const server = await Server.findByPk(serverId);
    if (!server) return;
    
    // Verificar si ya hay un incidente abierto para este servidor
    const existingIncident = await Incident.findOne({
      where: {
        server_id: serverId,
        status: ['new', 'in_progress', 'waiting'],
        type: 'availability'
      },
      order: [['created_at', 'DESC']]
    });
    
    // Si ya hay incidente abierto reciente (últimas 2 horas), no crear otro
    if (existingIncident) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      if (existingIncident.created_at > twoHoursAgo) {
        logger.info(`Incident already exists for server ${serverId}, skipping creation`);
        return;
      }
    }
    
    // Crear incidente automático
    const incident = await Incident.create({
      title: `[AUTO] Servidor ${server.name} no responde`,
      description: `
El sistema de monitoreo ha detectado que el servidor no está respondiendo.

**Detalles:**
- Servidor: ${server.name} (${server.host}:${server.port})
- Ambiente: ${server.environment}
- Motor: ${server.engine_type}
- Fecha detección: ${new Date().toISOString()}
- Error: ${errorMessage}

**Acciones recomendadas:**
1. Verificar conectividad de red
2. Verificar que el servicio de BD esté corriendo
3. Revisar logs del servidor
4. Verificar recursos (CPU, memoria, disco)

Este incidente fue creado automáticamente por el sistema de monitoreo.
      `,
      server_id: serverId,
      type: 'availability',
      severity: server.environment === 'production' ? 'critical' : 
                server.environment === 'staging' ? 'high' : 'medium',
      impact: server.environment === 'production' ? 'critical' : 'high',
      status: 'new',
      detected_at: new Date(),
      created_by: 1 // Usuario sistema
    });
    
    logger.error(`Server ${serverId} is down. Incident ${incident.id} created.`);
    
    // Enviar notificaciones
    await this.sendAlerts(server, incident, errorMessage);
  }
  
  // Verificar recuperación
  async checkRecovery(serverId: number) {
    // Buscar incidente abierto de tipo availability
    const openIncident = await Incident.findOne({
      where: {
        server_id: serverId,
        status: ['new', 'in_progress', 'waiting'],
        type: 'availability'
      },
      order: [['created_at', 'DESC']]
    });
    
    if (openIncident) {
      // Agregar nota de recuperación
      logger.info(`Server ${serverId} recovered. Incident ${openIncident.id} can be resolved.`);
      
      // Enviar notificación de recuperación
      const server = await Server.findByPk(serverId);
      await this.sendRecoveryAlert(server, openIncident);
    }
  }
  
  // Enviar alertas (email, notificación app, webhook)
  async sendAlerts(server: any, incident: any, errorMessage: string) {
    // 1. Notificación in-app (Electron)
    await this.sendAppNotification({
      title: `⚠️ Servidor Caído: ${server.name}`,
      body: `${server.name} (${server.environment}) no está respondiendo`,
      severity: incident.severity,
      incidentId: incident.id
    });
    
    // 2. Email
    await this.sendEmailAlert(server, incident, errorMessage);
    
    // 3. Webhook (Slack, Discord, etc) - opcional
    await this.sendWebhookAlert(server, incident, errorMessage);
  }
  
  // Enviar notificación a la app Electron
  async sendAppNotification(notification: any) {
    // Esto se enviará a través de IPC al proceso principal de Electron
    // que mostrará una notificación del sistema operativo
    
    // Guardar en tabla de notificaciones
    await Notification.create({
      title: notification.title,
      body: notification.body,
      type: 'alert',
      severity: notification.severity,
      incident_id: notification.incidentId,
      read: false,
      created_at: new Date()
    });
    
    logger.info('App notification sent');
  }
  
  // Enviar email
  async sendEmailAlert(server: any, incident: any, errorMessage: string) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    const severityEmoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    };
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'alerts@dba-manager.com',
      to: process.env.ALERT_EMAIL || 'dba-team@company.com',
      subject: `${severityEmoji[incident.severity]} ALERTA: ${server.name} no responde`,
      html: `
        <h2 style="color: #dc2626;">⚠️ Servidor Caído Detectado</h2>
        
        <p><strong>Servidor:</strong> ${server.name}</p>
        <p><strong>Host:</strong> ${server.host}:${server.port}</p>
        <p><strong>Ambiente:</strong> ${server.environment.toUpperCase()}</p>
        <p><strong>Motor:</strong> ${server.engine_type}</p>
        <p><strong>Severidad:</strong> ${incident.severity.toUpperCase()}</p>
        <p><strong>Hora:</strong> ${new Date().toLocaleString()}</p>
        
        <h3>Error:</h3>
        <pre style="background: #f3f4f6; padding: 10px; border-radius: 5px;">${errorMessage}</pre>
        
        <h3>Incidente Creado:</h3>
        <p>ID: #${incident.id}</p>
        <p>Título: ${incident.title}</p>
        
        <p style="margin-top: 20px;">
          <a href="dba-manager://incident/${incident.id}" 
             style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Ver Incidente en la App
          </a>
        </p>
        
        <hr style="margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          Esta alerta fue generada automáticamente por DBA Incident Manager.
        </p>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      logger.info(`Email alert sent for server ${server.id}`);
    } catch (error) {
      logger.error('Failed to send email alert:', error);
    }
  }
  
  // Webhook (Slack, Discord, Teams)
  async sendWebhookAlert(server: any, incident: any, errorMessage: string) {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) return;
    
    const payload = {
      text: `⚠️ *Servidor Caído: ${server.name}*`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `🔴 Servidor Caído: ${server.name}`
          }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Servidor:*\n${server.name}` },
            { type: "mrkdwn", text: `*Ambiente:*\n${server.environment}` },
            { type: "mrkdwn", text: `*Host:*\n${server.host}:${server.port}` },
            { type: "mrkdwn", text: `*Severidad:*\n${incident.severity}` }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Error:*\n\`\`\`${errorMessage}\`\`\``
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Incidente creado:* #${incident.id}\n${incident.title}`
          }
        }
      ]
    };
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        logger.info(`Webhook alert sent for server ${server.id}`);
      }
    } catch (error) {
      logger.error('Failed to send webhook alert:', error);
    }
  }
  
  // Alerta de recuperación
  async sendRecoveryAlert(server: any, incident: any) {
    // Email de recuperación
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.ALERT_EMAIL,
      subject: `✅ RECUPERADO: ${server.name} está en línea`,
      html: `
        <h2 style="color: #10b981;">✅ Servidor Recuperado</h2>
        <p><strong>Servidor:</strong> ${server.name} está respondiendo nuevamente.</p>
        <p><strong>Incidente:</strong> #${incident.id} puede ser cerrado.</p>
        <p><strong>Hora de recuperación:</strong> ${new Date().toLocaleString()}</p>
      `
    });
    
    logger.info(`Recovery alert sent for server ${server.id}`);
  }
  
  // Guardar resultado de health check
  async saveHealthCheck(result: HealthCheckResult) {
    await HealthCheck.create({
      server_id: result.serverId,
      is_online: result.isOnline,
      response_time_ms: result.responseTime,
      error_message: result.error,
      checked_at: result.timestamp
    });
  }
  
  // Obtener estadísticas de uptime
  async getUptimeStats(serverId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const checks = await HealthCheck.findAll({
      where: {
        server_id: serverId,
        checked_at: { [Op.gte]: startDate }
      }
    });
    
    const totalChecks = checks.length;
    const successfulChecks = checks.filter(c => c.is_online).length;
    const uptimePercentage = (successfulChecks / totalChecks) * 100;
    
    const avgResponseTime = checks
      .filter(c => c.is_online)
      .reduce((sum, c) => sum + c.response_time_ms, 0) / successfulChecks;
    
    return {
      uptimePercentage: uptimePercentage.toFixed(2),
      totalChecks,
      successfulChecks,
      failedChecks: totalChecks - successfulChecks,
      avgResponseTime: Math.round(avgResponseTime)
    };
  }
}

export const monitoringService = new MonitoringService();

3. REQUERIMIENTOS NO FUNCIONALES3.1 RendimientoRNF-001: Tiempo de Respuesta

La carga inicial de la aplicación no debe exceder 3 segundos
Las consultas de listado no deben exceder 2 segundos para hasta 10,000 registros
La búsqueda full-text debe retornar resultados en menos de 1 segundo
La generación de reportes PDF no debe exceder 5 segundos para 1,000 incidentes
Los gráficos del dashboard deben renderizar en menos de 1 segundo
RNF-002: Capacidad

El sistema debe soportar almacenamiento de al menos 100,000 incidentes
El sistema debe soportar al menos 1,000 servidores registrados
El sistema debe manejar archivos adjuntos hasta 500MB en total por incidente
El sistema debe permitir al menos 5,000 scripts en la biblioteca
RNF-003: Escalabilidad

La base de datos debe usar índices en:

incidents: id, title, status, severity, server_id, created_at
servers: id, name, environment
scripts: id, name, category
users: id, email
incident_tags: incident_id, tag_id


Las consultas deben usar paginación para evitar cargar datasets completos
Los archivos adjuntos deben almacenarse en filesystem, no en base de datos
3.2 SeguridadRNF-004: Autenticación y Autorización

Todas las contraseñas deben hashearse con bcrypt (salt rounds: 10)
Las sesiones deben usar JWT con algoritmo HS256
Los tokens JWT deben expirar en 24 horas
Las rutas de API deben validar token JWT en cada request
El sistema debe cerrar sesión automáticamente al detectar token inválido
RNF-005: Validación de Datos

Todas las entradas de usuario deben ser validadas en frontend y backend
Las consultas SQL deben usar prepared statements para prevenir SQL injection
Los archivos subidos deben validarse por tipo MIME y extensión
Los archivos deben escanearse en busca de contenido malicioso
Las rutas de archivos deben sanitizarse para prevenir path traversal
RNF-006: Protección de Datos Sensibles

Los scripts de BD pueden contener credenciales, deben almacenarse cifrados
Los logs de aplicación no deben contener contraseñas o tokens
Los mensajes de error no deben exponer información sensible del sistema
Las credenciales de conexión a BD deben almacenarse en variables de entorno
3.3 UsabilidadRNF-007: Interfaz de Usuario

La interfaz debe ser responsive y adaptarse a diferentes resoluciones (mínimo 1366x768)
Los formularios deben mostrar validación en tiempo real
Los mensajes de error deben ser claros y específicos
Las acciones destructivas deben requerir confirmación
El sistema debe proporcionar feedback visual para operaciones largas (spinners, progress bars)
La navegación debe ser intuitiva con máximo 3 clicks para cualquier función
RNF-008: Accesibilidad

El contraste de colores debe cumplir WCAG 2.1 nivel AA
Los formularios deben ser navegables con teclado (tab order lógico)
Los botones e iconos deben tener tooltips descriptivos
Los mensajes importantes deben tener indicadores visuales además de color
El tamaño de fuente mínimo debe ser 14px
RNF-009: Internacionalización

El sistema debe soportar cambio de idioma sin reiniciar
Todos los textos de interfaz deben ser traducibles
Los formatos de fecha y hora deben ajustarse al idioma seleccionado
Los números deben formatearse según convención local
3.4 MantenibilidadRNF-010: Código

El código debe seguir principios SOLID
El código debe tener cobertura de pruebas unitarias mínima del 70%
Las funciones deben tener máximo 50 líneas
Los componentes React deben ser funcionales con hooks
El código debe seguir guía de estilo (ESLint + Prettier)
Cada módulo debe tener responsabilidad única y clara
RNF-011: Documentación

Cada función compleja debe tener comentarios JSDoc
Los componentes React deben documentar sus props
Las APIs deben tener documentación OpenAPI/Swagger
El proyecto debe incluir README con instrucciones de instalación
Debe existir documentación de arquitectura y decisiones técnicas
RNF-012: Logging

El sistema debe registrar:

Inicio y cierre de sesión de usuarios
Creación, edición y eliminación de incidentes
Ejecución de scripts (especialmente DDL/DML)
Errores de aplicación con stack trace
Operaciones de backup/restore


Los logs deben incluir timestamp, nivel (INFO, WARN, ERROR), usuario y acción
Los logs deben rotarse diariamente y mantenerse por 30 días
3.5 DisponibilidadRNF-013: Funcionamiento Offline

La aplicación debe funcionar completamente sin conexión a internet
Todas las operaciones deben ser locales
El sistema debe arrancar sin validar conectividad externa
Los datos deben persistirse en base de datos local (MySQL instalado localmente)
RNF-014: Recuperación ante Fallos

El sistema debe recuperarse automáticamente de fallos de conexión a BD
Las transacciones incompletas deben revertirse automáticamente
El sistema debe crear backup automático antes de operaciones críticas
En caso de crash, el sistema debe recuperar último estado conocido al reiniciar
Los archivos adjuntos deben validar integridad al acceder
3.6 PortabilidadRNF-015: Compatibilidad de Sistema Operativo

La aplicación debe funcionar en:

Windows 10/11 (64-bit)
macOS 11 o superior (Intel y Apple Silicon)
Ubuntu 20.04 o superior


El instalador debe ser específico por plataforma
El sistema debe detectar automáticamente el sistema operativo
RNF-016: Instalación

El instalador debe incluir todas las dependencias necesarias
El proceso de instalación no debe exceder 5 minutos
El instalador debe crear accesos directos automáticamente
El sistema debe validar prerrequisitos antes de instalar
Debe existir proceso de desinstalación limpio
4. REQUERIMIENTOS TÉCNICOS4.1 Stack Tecnológico4.1.1 FrontendFramework Principal

React 18.3.1
Electron 28.0.0
TypeScript 5.3.3 (para type safety)
Gestión de Estado

Zustand 4.4.7 (state management ligero y simple)
React Query 5.17.0 (manejo de cache y sincronización de datos del servidor)
Routing

React Router DOM 6.21.0
UI y Estilos

TailwindCSS 3.4.0
HeadlessUI 1.7.17 (componentes accesibles sin estilos)
Heroicons 2.1.1 (librería de iconos)
clsx 2.1.0 (utilidad para clases condicionales)
Formularios y Validación

React Hook Form 7.49.0 (manejo eficiente de formularios)
Zod 3.22.4 (validación de esquemas TypeScript-first)
Editor de Código

Monaco Editor 0.45.0 (editor de VSCode para web)
react-monaco-editor 0.55.0
Visualización de Datos

Recharts 2.10.0 (gráficos responsivos para React)
date-fns 3.0.0 (manipulación de fechas)
Rich Text Editor

TipTap 2.1.13 (editor WYSIWYG moderno y extensible)
Otras Utilidades

axios 1.6.5 (cliente HTTP)
file-saver 2.0.5 (descarga de archivos)
react-dropzone 14.2.3 (drag & drop de archivos)
react-hot-toast 2.4.1 (notificaciones/toasts)
pdf-lib 1.17.1 (generación de PDFs)
xlsx 0.18.5 (generación de Excel)
4.1.2 BackendFramework

Node.js 20.10.0 LTS
Express 4.18.2
TypeScript 5.3.3
ORM y Base de Datos

Sequelize 6.35.2
mysql2 3.7.0 (driver MySQL)
Autenticación y Seguridad

jsonwebtoken 9.0.2 (generación y validación de JWT)
bcrypt 5.1.1 (hashing de contraseñas)
helmet 7.1.0 (headers de seguridad HTTP)
cors 2.8.5 (CORS middleware)
express-rate-limit 7.1.5 (rate limiting)
Validación

express-validator 7.0.1 (validación de requests)
joi 17.11.0 (validación de esquemas)
Logging

winston 3.11.0 (logger robusto)
morgan 1.10.0 (HTTP request logger)
Utilidades

dotenv 16.3.1 (variables de entorno)
multer 1.4.5-lts.1 (manejo de multipart/form-data)
node-cron 3.0.3 (tareas programadas)
compression 1.7.4 (compresión de responses)
4.1.3 Build y DesarrolloElectron

electron-builder 24.9.1 (empaquetado multi-plataforma)
electron-reload 2.0.0-alpha.1 (hot reload en desarrollo)
concurrently 8.2.2 (ejecutar múltiples procesos)
Linting y Formatting

ESLint 8.56.0
eslint-config-airbnb 19.0.4
eslint-plugin-react 7.33.2
Prettier 3.1.1
Testing

Jest 29.7.0
React Testing Library 14.1.2
Supertest 6.3.3 (testing de APIs)
Build Tools

Vite 5.0.10 (build tool rápido)
PostCSS 8.4.32
Autoprefixer 10.4.16
4.2 Arquitectura de la Aplicación4.2.1 Estructura de Directoriosdba-incident-manager/
├── electron/                          # Proceso principal de Electron
│   ├── main.ts                        # Entry point Electron
│   ├── preload.ts                     # Script de preload
│   └── ipc/                           # Manejadores IPC
│       ├── app.handlers.ts
│       ├── database.handlers.ts
│       └── file.handlers.ts
│
├── src/                               # Aplicación React (renderer)
│   ├── main.tsx                       # Entry point React
│   ├── App.tsx
│   │
│   ├── assets/                        # Recursos estáticos
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/                    # Componentes reutilizables
│   │   ├── common/                    # Componentes genéricos
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   └── Spinner.tsx
│   │   │
│   │   ├── layout/                    # Componentes de layout
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   │
│   │   └── charts/                    # Componentes de gráficos
│   │       ├── BarChart.tsx
│   │       ├── LineChart.tsx
│   │       ├── PieChart.tsx
│   │       └── DonutChart.tsx
│   │
│   ├── features/                      # Módulos por funcionalidad
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   └── store/
│   │   │       └── authStore.ts
│   │   │
│   │   ├── incidents/
│   │   │   ├── components/
│   │   │   │   ├── IncidentList.tsx
│   │   │   │   ├── IncidentForm.tsx
│   │   │   │   ├── IncidentDetail.tsx
│   │   │   │   ├── IncidentFilters.tsx
│   │   │   │   └── SimilarIncidents.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useIncidents.ts
│   │   │   │   └── useIncidentFilters.ts
│   │   │   ├── services/
│   │   │   │   └── incidents.service.ts
│   │   │   ├── store/
│   │   │   │   └── incidentsStore.ts
│   │   │   └── types/
│   │   │       └── incident.types.ts
│   │   │
│   │   ├── servers/
│   │   │   ├── components/
│   │   │   │   ├── ServerList.tsx
│   │   │   │   ├── ServerForm.tsx
│   │   │   │   └── ServerDetail.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useServers.ts
│   │   │   ├── services/
│   │   │   │   └── servers.service.ts
│   │   │   └── types/
│   │   │       └── server.types.ts
│   │   │
│   │   ├── solutions/
│   │   │   ├── components/
│   │   │   │   ├── SolutionForm.tsx
│   │   │   │   ├── SolutionList.tsx
│   │   │   │   └── SolutionTemplate.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useSolutions.ts
│   │   │   └── services/
│   │   │       └── solutions.service.ts
│   │   │
│   │   ├── scripts/
│   │   │   ├── components/
│   │   │   │   ├── ScriptEditor.tsx
│   │   │   │   ├── ScriptList.tsx
│   │   │   │   ├── ScriptExecutor.tsx
│   │   │   │   └── ExecutionHistory.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useScripts.ts
│   │   │   └── services/
│   │   │       └── scripts.service.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── KPICard.tsx
│   │   │   │   ├── IncidentsTrend.tsx
│   │   │   │   └── ServerStats.tsx
│   │   │   └── hooks/
│   │   │       └── useDashboard.ts
│   │   │
│   │   ├── reports/
│   │   │   ├── components/
│   │   │   │   ├── ReportGenerator.tsx
│   │   │   │   └── ReportPreview.tsx
│   │   │   ├── services/
│   │   │   │   ├── pdf.service.ts
│   │   │   │   └── excel.service.ts
│   │   │   └── utils/
│   │   │       └── report.utils.ts
│   │   │
│   │   └── search/
│   │       ├── components/
│   │       │   ├── GlobalSearch.tsx
│   │       │   └── SearchResults.tsx
│   │       └── hooks/
│   │           └── useSearch.ts
│   │
│   ├── hooks/                         # Hooks globales
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useTheme.ts
│   │
│   ├── lib/                           # Utilidades y helpers
│   │   ├── api.ts                     # Cliente axios configurado
│   │   ├── constants.ts               # Constantes globales
│   │   ├── validators.ts              # Funciones de validación
│   │   └── utils.ts                   # Utilidades generales
│   │
│   ├── routes/                        # Configuración de rutas
│   │   ├── index.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── routes.config.ts
│   │
│   ├── styles/                        # Estilos globales
│   │   ├── globals.css
│   │   └── tailwind.css
│   │
│   └── types/                         # Tipos TypeScript globales
│       ├── global.d.ts
│       └── api.types.ts
│
├── server/                            # Backend Node.js
│   ├── src/
│   │   ├── index.ts                   # Entry point
│   │   ├── app.ts                     # Configuración Express
│   │   │
│   │   ├── config/                    # Configuraciones
│   │   │   ├── database.ts
│   │   │   ├── jwt.ts
│   │   │   └── app.config.ts
│   │   │
│   │   ├── middlewares/               # Middlewares Express
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── upload.middleware.ts
│   │   │
│   │   ├── models/                    # Modelos Sequelize
│   │   │   ├── index.ts
│   │   │   ├── User.ts
│   │   │   ├── Server.ts
│   │   │   ├── Incident.ts
│   │   │   ├── Solution.ts
│   │   │   ├── Script.ts
│   │   │   ├── Tag.ts
│   │   │   ├── IncidentTag.ts
│   │   │   ├── Attachment.ts
│   │   │   ├── ExecutionHistory.ts
│   │   │   └── AuditLog.ts
│   │   │
│   │   ├── controllers/               # Controladores
│   │   │   ├── auth.controller.ts
│   │   │   ├── incidents.controller.ts
│   │   │   ├── servers.controller.ts
│   │   │   ├── solutions.controller.ts
│   │   │   ├── scripts.controller.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── reports.controller.ts
│   │   │   └── search.controller.ts
│   │   │
│   │   ├── services/                  # Lógica de negocio
│   │   │   ├── auth.service.ts
│   │   │   ├── incidents.service.ts
│   │   │   ├── servers.service.ts
│   │   │   ├── solutions.service.ts
│   │   │   ├── scripts.service.ts
│   │   │   ├── similarity.service.ts
│   │   │   ├── statistics.service.ts
│   │   │   ├── backup.service.ts
│   │   │   └── search.service.ts
│   │   │
│   │   ├── routes/                    # Definición de rutas
│   │   │   ├── index.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── incidents.routes.ts
│   │   │   ├── servers.routes.ts
│   │   │   ├── solutions.routes.ts
│   │   │   ├── scripts.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   ├── reports.routes.ts
│   │   │   └── search.routes.ts
│   │   │
│   │   ├── validators/                # Esquemas de validación
│   │   │   ├── auth.validator.ts
│   │   │   ├── incidents.validator.ts
│   │   │   ├── servers.validator.ts
│   │   │   └── scripts.validator.ts
│   │   │
│   │   ├── utils/                     # Utilidades
│   │   │   ├── logger.ts
│   │   │   ├── errors.ts
│   │   │   ├── jwt.utils.ts
│   │   │   └── file.utils.ts
│   │   │
│   │   └── types/                     # Tipos TypeScript
│   │       └── express.d.ts
│   │
│   └── tests/                         # Tests del backend
│       ├── unit/
│       ├── integration/
│       └── setup.ts
│
├── database/                          # Migraciones y seeds
│   ├── migrations/
│   │   ├── 001-create-users.ts
│   │   ├── 002-create-servers.ts
│   │   ├── 003-create-incidents.ts
│   │   ├── 004-create-solutions.ts
│   │   ├── 005-create-scripts.ts
│   │   ├── 006-create-tags.ts
│   │   └── 007-create-audit-logs.ts
│   │
│   └── seeders/
│       ├── 001-demo-user.ts
│       └── 002-sample-data.ts
│
├── public/                            # Recursos públicos de Electron
│   ├── icon.png
│   └── icon.ico
│
├── uploads/                           # Directorio para archivos adjuntos
│
├── backups/                           # Directorio para backups
│
├── .env.example                       # Ejemplo de variables de entorno
├── .eslintrc.js                       # Configuración ESLint
├── .prettierrc                        # Configuración Prettier
├── tsconfig.json                      # Configuración TypeScript
├── tailwind.config.js                 # Configuración Tailwind
├── postcss.config.js                  # Configuración PostCSS
├── vite.config.ts                     # Configuración Vite
├── electron-builder.yml               # Configuración empaquetado
├── package.json
└── README.md4.2.2 Modelos de Base de DatosTabla: users
sqlCREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'senior_dba', 'junior_dba') DEFAULT 'junior_dba',
  profile_picture VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);Tabla: servers
sqlCREATE TABLE servers (
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
);Tabla: incidents
sqlCREATE TABLE incidents (
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
);Tabla: solutions
sqlCREATE TABLE solutions (
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
);Tabla: scripts
sqlCREATE TABLE scripts (
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
);Tabla: tags
sqlCREATE TABLE tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);Tabla: incident_tags
sqlCREATE TABLE incident_tags (
  incident_id INT NOT NULL,
  tag_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (incident_id, tag_id),
  INDEX idx_incident (incident_id),
  INDEX idx_tag (tag_id),
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);Tabla: script_tags
sqlCREATE TABLE script_tags (
  script_id INT NOT NULL,
  tag_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (script_id, tag_id),
  INDEX idx_script (script_id),
  INDEX idx_tag (tag_id),
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);Tabla: attachments
sqlCREATE TABLE attachments (
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
);Tabla: execution_history
sqlCREATE TABLE execution_history (
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
);Tabla: audit_logs
sqlCREATE TABLE audit_logs (
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
);Tabla: incident_history
sqlCREATE TABLE incident_history (
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
);Tabla: app_settings
sqlCREATE TABLE app_settings (
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
);4.3 APIs y Endpoints4.3.1 AutenticaciónPOST /api/auth/register

Body: { email, password, full_name, role }
Response: { success, message, data: { user, token } }
Status: 201 Created
POST /api/auth/login

Body: { email, password }
Response: { success, data: { user, token } }
Status: 200 OK
POST /api/auth/logout

Headers: Authorization: Bearer <token>
Response: { success, message }
Status: 200 OK
GET /api/auth/me

Headers: Authorization: Bearer <token>
Response: { success, data: { user } }
Status: 200 OK
PUT /api/auth/profile

Headers: Authorization: Bearer <token>
Body: { full_name, profile_picture }
Response: { success, data: { user } }
Status: 200 OK
PUT /api/auth/change-password

Headers: Authorization: Bearer <token>
Body: { current_password, new_password }
Response: { success, message }
Status: 200 OK
4.3.2 ServidoresGET /api/servers

Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20&search=&environment=&engine_type=&status=
Response: { success, data: { servers, pagination } }
Status: 200 OK
GET /api/servers/:id

Headers: Authorization: Bearer <token>
Response: { success, data: { server } }
Status: 200 OK
POST /api/servers

Headers: Authorization: Bearer <token>
Body: { name, host, port, engine_type, environment, description, engine_version, status }
Response: { success, data: { server } }
Status: 201 Created
PUT /api/servers/:id

Headers: Authorization: Bearer <token>
Body: { name, host, port, engine_type, environment, description, engine_version, status }
Response: { success, data: { server } }
Status: 200 OK
DELETE /api/servers/:id

Headers: Authorization: Bearer <token>
Response: { success, message }
Status: 200 OK
GET /api/servers/:id/incidents

Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20
Response: { success, data: { incidents, pagination } }
Status: 200 OK
4.3.3 IncidentesGET /api/incidents

Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20&search=&status[]=&severity[]=&type=&server_id=&start_date=&end_date=&tags[]=&sort_by=&sort_order=
Response: { success, data: { incidents, pagination } }
Status: 200 OK
GET /api/incidents/:id

Headers: Authorization: Bearer <token>
Response: { success, data: { incident, solutions, attachments, history, similar_incidents } }
Status: 200 OK
POST /api/incidents

Headers: Authorization: Bearer <token>
Body: { title, description, server_id, type, severity, impact, reported_by, detected_at, tags }
Response: { success, data: { incident } }
Status: 201 Created
PUT /api/incidents/:id

Headers: Authorization: Bearer <token>
Body: { title, description, type, severity, impact, status, assigned_to, tags }
Response: { success, data: { incident } }
Status: 200 OK
PATCH /api/incidents/:id/status

Headers: Authorization: Bearer <token>
Body: { status }
Response: { success, data: { incident } }
Status: 200 OK
DELETE /api/incidents/:id

Headers: Authorization: Bearer <token>
Response: { success, message }
Status: 200 OK
GET /api/incidents/:id/similar

Headers: Authorization: Bearer <token>
Response: { success, data: { similar_incidents } }
Status: 200 OK
POST /api/incidents/:id/attachments

Headers: Authorization: Bearer <token>, Content-Type: multipart/form-data
Body: FormData with files
Response: { success, data: { attachments } }
Status: 201 Created
DELETE /api/incidents/:id/attachments/:attachmentId

Headers: Authorization: Bearer <token>
Response: { success, message }
Status: 200 OK
GET /api/incidents/:id/attachments/:attachmentId/download

Headers: Authorization: Bearer <token>
Response: File download
Status: 200 OK
4.3.4 SolucionesGET /api/solutions

Headers: Authorization: Bearer <token>
Query: ?incident_id=&is_template=&category=
Response: { success, data: { solutions } }
Status: 200 OK
GET /api/solutions/:id

Headers: Authorization: Bearer <token>
Response: { success, data: { solution } }
Status: 200 OK
POST /api/solutions

Headers: Authorization: Bearer <token>
Body: { incident_id, description, sql_scripts, system_commands, external_references, time_spent_minutes, result_obtained }
Response: { success, data: { solution } }
Status: 201 Created
PUT /api/solutions/:id

Headers: Authorization: Bearer <token>
Body: { description, sql_scripts, system_commands, external_references, time_spent_minutes, result_obtained }
Response: { success, data: { solution } }
Status: 200 OK
POST /api/solutions/:id/template

Headers: Authorization: Bearer <token>
Body: { template_name, template_category }
Response: { success, data: { solution } }
Status: 200 OK
GET /api/solutions/templates

Headers: Authorization: Bearer <token>
Query: ?category=
Response: { success, data: { templates } }
Status: 200 OK
4.3.5 ScriptsGET /api/scripts

Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20&search=&category=&language=&engine_compatible=
Response: { success, data: { scripts, pagination } }
Status: 200 OK
GET /api/scripts/:id

Headers: Authorization: Bearer <token>
Response: { success, data: { script } }
Status: 200 OK
POST /api/scripts

Headers: Authorization: Bearer <token>
Body: { name, description, language, code, category, engine_compatible, parameters_description, tags }
Response: { success, data: { script } }
Status: 201 Created
PUT /api/scripts/:id

Headers: Authorization: Bearer <token>
Body: { name, description, language, code, category, engine_compatible, parameters_description, tags }
Response: { success, data: { script } }
Status: 200 OK
DELETE /api/scripts/:id

Headers: Authorization: Bearer <token>
Response: { success, message }
Status: 200 OK
POST /api/scripts/:id/execute

Headers: Authorization: Bearer <token>
Body: { server_id, parameters }
Response: { success, data: { result, rows_affected, execution_time } }
Status: 200 OK
GET /api/scripts/:id/history

Headers: Authorization: Bearer <token>
Query: ?page=1&limit=20
Response: { success, data: { executions, pagination } }
Status: 200 OK
4.3.6 Dashboard y EstadísticasGET /api/dashboard/stats

Headers: Authorization: Bearer <token>
Query: ?start_date=&end_date=
Response: { success, data: { total_incidents, resolved_incidents, avg_resolution_time, critical_open } }
Status: 200 OK
GET /api/dashboard/incidents-by-month

Headers: Authorization: Bearer <token>
Query: ?months=12
Response: { success, data: { chart_data } }
Status: 200 OK
GET /api/dashboard/incidents-by-severity

Headers: Authorization: Bearer <token>
Query: ?start_date=&end_date=
Response: { success, data: { chart_data } }
Status: 200 OK
GET /api/dashboard/incidents-by-type

Headers: Authorization: Bearer <token>
Query: ?start_date=&end_date=&limit=10
Response: { success, data: { chart_data } }
Status: 200 OK
GET /api/dashboard/top-servers

Headers: Authorization: Bearer <token>
Query: ?start_date=&end_date=&limit=5
Response: { success, data: { servers } }
Status: 200 OK
GET /api/dashboard/resolution-trend

Headers: Authorization: Bearer <token>
Query: ?months=6
Response: { success, data: { chart_data } }
Status: 200 OK
GET /api/dashboard/recurring-incidents

Headers: Authorization: Bearer <token>
Query: ?start_date=&end_date=&threshold=3
Response: { success, data: { recurring } }
Status: 200 OK
4.3.7 ReportesPOST /api/reports/generate

Headers: Authorization: Bearer <token>
Body: { format, start_date, end_date, filters, include_charts, include_details }
Response: File download (PDF or Excel)
Status: 200 OK
GET /api/reports/templates

Headers: Authorization: Bearer <token>
Response: { success, data: { templates } }
Status: 200 OK
4.3.8 BúsquedaGET /api/search

Headers: Authorization: Bearer <token>
Query: ?q=&entity_type=&page=1&limit=20
Response: { success, data: { results, pagination } }
Status: 200 OK
4.3.9 TagsGET /api/tags

Headers: Authorization: Bearer <token>
Response: { success, data: { tags } }
Status: 200 OK
POST /api/tags

Headers: Authorization: Bearer <token>
Body: { name, color }
Response: { success, data: { tag } }
Status: 201 Created
PUT /api/tags/:id

Headers: Authorization: Bearer <token>
Body: { name, color }
Response: { success, data: { tag } }
Status: 200 OK
DELETE /api/tags/:id

Headers: Authorization: Bearer <token>
Response: { success, message }
Status: 200 OK
4.3.10 ConfiguraciónGET /api/settings

Headers: Authorization: Bearer <token>
Response: { success, data: { settings } }
Status: 200 OK
PUT /api/settings

Headers: Authorization: Bearer <token>
Body: { theme, language, records_per_page, date_format, backup_location, backup_frequency }
Response: { success, data: { settings } }
Status: 200 OK
POST /api/backup/create

Headers: Authorization: Bearer <token>
Response: { success, data: { backup_file, size } }
Status: 200 OK
GET /api/backup/list

Headers: Authorization: Bearer <token>
Response: { success, data: { backups } }
Status: 200 OK
POST /api/backup/restore

Headers: Authorization: Bearer <token>
Body: { backup_file }
Response: { success, message }
Status: 200 OK
4.4 Flujos de Trabajo Principales4.4.1 Flujo de Registro de Incidente
Usuario navega a "Nuevo Incidente"
Sistema carga formulario con:

Lista de servidores desde GET /api/servers
Lista de tags desde GET /api/tags


Usuario completa formulario obligatorio:

Título
Descripción (editor de texto enriquecido)
Servidor (dropdown con búsqueda)
Tipo de incidente (dropdown)
Severidad (radio buttons)
Fecha detección (date-time picker)


Usuario opcionalmente adjunta archivos (drag & drop o file picker)
Usuario opcionalmente agrega tags
Sistema valida en frontend:

Campos obligatorios completos
Título máximo 200 caracteres
Archivos dentro de límites permitidos


Usuario presiona "Guardar"
Sistema envía POST /api/incidents con multipart/form-data si hay archivos
Backend valida datos
Backend crea registro en tabla incidents
Backend procesa archivos adjuntos y crea registros en attachments
Backend crea registros en incident_tags
Backend busca incidentes similares usando similarity.service
Backend retorna incidente creado con similar_incidents
Frontend muestra notificación de éxito
Frontend redirige a vista de detalle del incidente
Frontend muestra sugerencias de incidentes similares
4.4.2 Flujo de Resolución de Incidente
Usuario abre incidente en estado "Nuevo"
Sistema carga GET /api/incidents/:id con toda la información
Usuario cambia estado a "En Progreso" mediante PATCH /api/incidents/:id/status
Sistema registra timestamp en started_work_at
Usuario revisa incidentes similares sugeridos
Usuario puede abrir solución de incidente similar
Usuario crea nueva solución mediante "Agregar Solución"
Sistema muestra formulario de solución
Usuario completa:

Descripción de solución (editor enriquecido)
Scripts SQL ejecutados (editor con syntax highlighting)
Comandos de sistema (textarea)
Tiempo invertido
Resultado obtenido


Usuario presiona "Guardar Solución"
Sistema envía POST /api/solutions
Backend crea registro en solutions
Frontend actualiza vista de detalle mostrando solución
Usuario cambia estado a "Resuelto" mediante PATCH /api/incidents/:id/status
Sistema registra timestamp en resolved_at
Sistema calcula resolution_time_minutes
Sistema actualiza estado en base de datos
Frontend muestra notificación de éxito
Usuario opcionalmente cierra incidente cambiando estado a "Cerrado"
Sistema registra timestamp en closed_at
4.4.3 Flujo de Ejecución de Script
Usuario navega a "Biblioteca de Scripts"
Sistema carga GET /api/scripts con filtros
Usuario busca script deseado mediante búsqueda o filtros
Usuario selecciona script
Sistema carga vista de detalle con GET /api/scripts/:id
Sistema renderiza Monaco Editor con código del script
Usuario presiona "Ejecutar"
Sistema muestra modal de confirmación:

Seleccionar servidor destino (dropdown)
Mostrar advertencia si script contiene DDL/DML destructivo
Checkbox de confirmación para comandos destructivos


Usuario selecciona servidor y confirma
Sistema envía POST /api/scripts/:id/execute con { server_id }
Backend valida permisos de usuario
Backend establece conexión con servidor de BD
Backend ejecuta script con timeout de 30 segundos
Backend registra ejecución en execution_history
Backend retorna resultado:

Status (success/failed)
Rows affected
Execution time
Result set (si es SELECT)
Error message (si falló)


Frontend cierra modal de confirmación
Frontend muestra resultados:

Si SELECT: tabla con datos paginados y opción de exportar CSV
Si UPDATE/DELETE/INSERT: cantidad de filas afectadas
Si error: mensaje de error detallado


Sistema actualiza usage_count del script
Sistema permite ver historial con GET /api/scripts/:id/history
4.4.4 Flujo de Generación de Reporte
Usuario navega a "Reportes"
Sistema muestra formulario de configuración:

Rango de fechas (date range picker)
Filtros (servidores, tipos, severidades)
Formato (PDF o Excel)
Opciones (incluir gráficos, incluir detalles)


Usuario configura parámetros deseados
Usuario presiona "Generar Reporte"
Sistema muestra loading indicator
Sistema envía POST /api/reports/generate con configuración
Backend valida parámetros
Backend consulta datos según filtros:

GET incidents con filtros aplicados
Calcular estadísticas agregadas
Generar datos para gráficos


Backend genera archivo según formato:

Si PDF: usa pdf-lib para crear documento estructurado
Si Excel: usa xlsx para crear workbook con hojas múltiples


Backend incluye:

Portada con rango de fechas y filtros aplicados
Sección de resumen ejecutivo con KPIs
Gráficos (si seleccionado)
Listado detallado de incidentes (si seleccionado)
Pie de página con fecha de generación y usuario


Backend retorna archivo como blob
Frontend recibe archivo
Frontend oculta loading indicator
Frontend dispara descarga automática del archivo
Sistema registra generación de reporte en audit_logs
4.4.5 Flujo de Búsqueda Global
Usuario presiona Ctrl+K o hace clic en barra de búsqueda global
Sistema muestra modal de búsqueda con input enfocado
Usuario escribe términos de búsqueda
Sistema implementa debounce de 300ms
Después del debounce, sistema envía GET /api/search?q=términos
Backend ejecuta búsqueda full-text en:

incidents (title, description)
servers (name, host, description)
scripts (name, description, code)
solutions (description)


Backend calcula relevancia usando MATCH AGAINST en MySQL
Backend retorna resultados ordenados por relevancia
Frontend actualiza lista de resultados en tiempo real
Frontend muestra:

Tipo de entidad (con icono)
Título/Nombre
Fragmento de texto con término resaltado
Metadata (fecha, servidor, etc.)


Usuario puede filtrar resultados por tipo de entidad
Usuario selecciona un resultado
Sistema cierra modal
Sistema navega a vista de detalle de la entidad seleccionada
4.5 Proceso de Build y Deployment4.5.1 Configuración de Entorno de DesarrolloVariables de entorno (.env)
# Backend
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=24h

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dba_incident_manager
DB_USER=root
DB_PASSWORD=your_password
DB_DIALECT=mysql

# Archivos
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.log,.txt,.sql,.png,.jpg,.jpeg,.pdf,.zip

# Backup
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30

# Logging
LOG_LEVEL=debug
LOG_DIR=./logsScripts de package.json
json{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\" \"npm run dev:electron\"",
    "dev:server": "nodemon --watch server --exec ts-node server/src/index.ts",
    "dev:client": "vite",
    "dev:electron": "wait-on http://localhost:5173 && electron .",
    "build": "npm run build:client && npm run build:server && npm run build:electron",
    "build:client": "vite build",
    "build:server": "tsc -p server/tsconfig.json",
    "build:electron": "electron-builder",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,css,md}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "db:migrate": "sequelize-cli db:migrate",
    "db:seed": "sequelize-cli db:seed:all",
    "db:reset": "sequelize-cli db:migrate:undo:all && npm run db:migrate && npm run db:seed"
  }
}4.5.2 Configuración de Electron Builderelectron-builder.yml
yamlappId: com.dbatools.incidentmanager
productName: DBA Incident Manager
copyright: Copyright © 2024
directories:
  output: dist
  buildResources: public

files:
  - dist-electron/**/*
  - dist/**/*
  - server/dist/**/*
  - node_modules/**/*
  - package.json

win:
  target:
    - target: nsis
      arch:
        - x64
  icon: public/icon.ico
  artifactName: ${productName}-Setup-${version}.${ext}

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true

mac:
  target:
    - target: dmg
      arch:
        - x64
        - arm64
  icon: public/icon.icns
  category: public.app-category.developer-tools
  hardenedRuntime: true
  gatekeeperAssess: false

dmg:
  title: ${productName} ${version}
  icon: public/icon.icns

linux:
  target:
    - target: AppImage
      arch:
        - x64
  icon: public/icon.png
  category: Development
  maintainer: your-email@example.com4.5.3 Proceso de InstalaciónPasos de instalación en Windows:

Descargar DBA-Incident-Manager-Setup-X.X.X.exe
Ejecutar instalador
Instalador verifica requisitos:

Windows 10/11 64-bit
4GB RAM mínimo
500MB espacio en disco


Usuario selecciona directorio de instalación
Instalador copia archivos de aplicación
Instalador verifica si MySQL está instalado:

Si no: mostrar mensaje indicando necesidad de instalar MySQL Server
Si sí: continuar


Instalador crea base de datos dba_incident_manager
Instalador ejecuta migraciones iniciales
Instalador crea usuario administrador por defecto
Instalador crea accesos directos en:

Escritorio
Menú Inicio


Instalador ofrece ejecutar aplicación al finalizar
Usuario inicia aplicación
Aplicación muestra pantalla de login
Usuario ingresa credenciales por defecto:

Email: admin@localhost
Password: admin123


Aplicación solicita cambio de contraseña en primer inicio
Pasos de instalación en macOS:

Descargar DBA-Incident-Manager-X.X.X.dmg
Abrir archivo DMG
Arrastrar icono de aplicación a carpeta Applications
Abrir aplicación desde Launchpad
Sistema solicita confirmación de apertura (primera vez)
Usuario confirma apertura
Aplicación verifica MySQL instalado:

Si no: mostrar instrucciones de instalación via Homebrew
Si sí: continuar


Aplicación crea base de datos y ejecuta migraciones
Continúa flujo similar a Windows desde paso 13
Pasos de instalación en Linux (Ubuntu):

Descargar DBA-Incident-Manager-X.X.X.AppImage
Dar permisos de ejecución: chmod +x DBA-Incident-Manager-X.X.X.AppImage
Ejecutar AppImage
Aplicación solicita permisos de lectura/escritura
Usuario concede permisos
Aplicación verifica MySQL instalado:

Si no: mostrar comando de instalación: sudo apt install mysql-server
Si sí: continuar


Aplicación crea base de datos y ejecuta migraciones
Continúa flujo similar desde paso 13
4.6 Estrategia de Testing4.6.1 Tests Unitarios (Jest)Backend - Tests de Servicios
typescript// server/tests/unit/services/incidents.service.test.ts
describe('IncidentsService', () => {
  test('should create incident with valid data', async () => {});
  test('should throw error when server_id does not exist', async () => {});
  test('should calculate resolution time correctly', async () => {});
  test('should find similar incidents based on keywords', async () => {});
});

// server/tests/unit/services/auth.service.test.ts
describe('AuthService', () => {
  test('should hash password correctly', async () => {});
  test('should generate valid JWT token', async () => {});
  test('should validate JWT token', async () => {});
  test('should throw error on invalid credentials', async () => {});
});Frontend - Tests de Componentes
typescript// src/features/incidents/components/__tests__/IncidentForm.test.tsx
describe('IncidentForm', () => {
  test('should render all required fields', () => {});
  test('should validate title max length', () => {});
  test('should show error on submit with empty required fields', () => {});
  test('should call onSubmit with correct data', async () => {});
});

// src/features/incidents/hooks/__tests__/useIncidents.test.ts
describe('useIncidents', () => {
  test('should fetch incidents on mount', async () => {});
  test('should handle pagination correctly', async () => {});
  test('should filter incidents by status', async () => {});
});4.6.2 Tests de IntegraciónAPI Endpoints
typescript// server/tests/integration/incidents.routes.test.ts
describe('GET /api/incidents', () => {
  test('should return 401 without auth token', async () => {});
  test('should return incidents with valid token', async () => {});
  test('should filter by status correctly', async () => {});
  test('should paginate results', async () => {});
});

describe('POST /api/incidents', () => {
  test('should create incident with valid data', async () => {});
  test('should return 400 with invalid data', async () => {});
  test('should upload attachments correctly', async () => {});
});4.6.3 Tests End-to-End (Opcional para futuro)Usar Playwright o Cypress para tests E2E completos simulando interacción de usuario.4.7 Seguridad y Mejores Prácticas4.7.1 Seguridad en BackendImplementación de Middleware de Autenticación
typescript// server/src/middlewares/auth.middleware.ts
import jwt from 'jsonwebtoken';

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};Rate Limiting
typescript// server/src/app.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);Sanitización de Inputs
typescript// Usar express-validator en todos los endpoints
import { body, validationResult } from 'express-validator';

app.post('/api/incidents', [
  body('title').trim().escape().isLength({ max: 200 }),
  body('description').trim().isLength({ min: 10 }),
  body('server_id').isInt(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Continuar con lógica...
});Prevención de SQL Injection
typescript// Siempre usar Sequelize ORM con parámetros
await Incident.findAll({
  where: {
    title: { [Op.like]: `%${searchTerm}%` }
  }
});

// NUNCA concatenar strings en queries:
// MALO: `SELECT * FROM incidents WHERE title LIKE '%${searchTerm}%'`4.7.2 Seguridad en FrontendAlmacenamiento Seguro de Token
typescript// Guardar token en memoria, no en localStorage
// src/features/auth/store/authStore.ts
import create from 'zustand';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => set({ token, user }),
  logout: () => set({ token: null, user: null }),
}));Validación de Archivos
typescript// src/lib/validators.ts
export const validateFile = (file: File): boolean => {
  const allowedTypes = ['.log', '.txt', '.sql', '.png', '.jpg', '.jpeg', '.pdf', '.zip'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!allowedTypes.includes(extension)) {
    throw new Error(`File type ${extension} not allowed`);
  }
  
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum of 10MB`);
  }
  
  return true;
};4.8 Logging y Monitoreo4.8.1 Configuración de Winston Loggertypescript// server/src/utils/logger.ts
import winston from 'winston';
import path from 'path';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(process.env.LOG_DIR, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(process.env.LOG_DIR, 'combined.log')
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;4.8.2 Logging de Eventos Importantestypescript// Ejemplos de uso
logger.info('User logged in', { userId: user.id, email: user.email });
logger.warn('Failed login attempt', { email, ip: req.ip });
logger.error('Database connection failed', { error: error.message, stack: error.stack });4.9 Optimizaciones de Performance4.9.1 Caching con React Querytypescript// src/features/incidents/hooks/useIncidents.ts
import { useQuery } from '@tanstack/react-query';

export const useIncidents = (filters) => {
  return useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => incidentsService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
};4.9.2 Lazy Loading de Componentestypescript// src/routes/index.tsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('../features/dashboard/components/Dashboard'));
const IncidentList = lazy(() => import('../features/incidents/components/IncidentList'));

const AppRoutes = () => (
  <Suspense fallback={<Spinner />}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/incidents" element={<IncidentList />} />
    </Routes>
  </Suspense>
);4.9.3 Virtualización de Listastypescript// Para listas grandes, usar react-window
import { FixedSizeList } from 'react-window';

const IncidentList = ({ incidents }) => (
  <FixedSizeList
    height={600}
    itemCount={incidents.length}
    itemSize={80}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <IncidentRow incident={incidents[index]} />
      </div>
    )}
  </FixedSizeList>
);5. PLAN DE IMPLEMENTACIÓN5.1 Fase 1: Configuración Base (Semana 1-2)Tareas:

Inicializar proyecto con estructura de directorios
Configurar TypeScript, ESLint, Prettier
Configurar Electron con React + Vite
Configurar Express backend con TypeScript
Configurar MySQL y Sequelize ORM
Crear migraciones iniciales de base de datos
Implementar autenticación JWT básica
Configurar TailwindCSS y componentes base
Implementar layout principal con sidebar y header
Configurar React Router
Entregables:

Aplicación Electron ejecutándose
Backend API funcionando en puerto 3001
Base de datos creada con tablas principales
Login/Registro funcional
Layout base implementado
5.2 Fase 2: Módulo de Servidores (Semana 3)Tareas:

Crear modelo Server en Sequelize
Implementar API endpoints para servidores (CRUD)
Crear componente ServerForm con validación
Crear componente ServerList con filtros y búsqueda
Crear componente ServerDetail
Implementar tests unitarios para servidor service
Implementar tests de componentes React
Entregables:

Gestión completa de servidores funcional
Validación de formularios
Tests pasando
5.3 Fase 3: Módulo de Incidentes Core (Semana 4-5)Tareas:

Crear modelos: Incident, IncidentTag, Attachment, IncidentHistory
Implementar API endpoints para incidentes
Crear IncidentForm con editor rico (TipTap)
Implementar subida de archivos con Multer
Crear IncidentList con filtros avanzados
Crear IncidentDetail con todas las secciones
Implementar cambios de estado de incidente
Implementar historial de cambios
Implementar tags en incidentes
Tests de integración de APIs
Entregables:

CRUD de incidentes completo
Subida de archivos funcionando
Cambios de estado con auditoría
Sistema de tags operativo
5.4 Fase 4: Módulo de Soluciones (Semana 6)Tareas:

Crear modelo Solution
Implementar API endpoints para soluciones
Crear SolutionForm con editor SQL (Monaco)
Implementar sistema de plantillas
Implementar servicio de similitud para sugerencias
Crear componente SimilarIncidents
Integrar sugerencias en detalle de incidente
Tests de similarity service
Entregables:

Documentación de soluciones funcional
Sistema de plantillas operativo
Sugerencias automáticas funcionando
5.5 Fase 5: Biblioteca de Scripts (Semana 7-8)Tareas:

Crear modelo Script, ScriptTag, ExecutionHistory
Implementar API endpoints para scripts
Crear ScriptEditor con Monaco Editor
Implementar syntax highlighting y validación
Implementar ejecución de scripts con confirmación
Crear componente de visualización de resultados
Implementar historial de ejecuciones
Implementar exportación de resultados a CSV
Tests de ejecución de scripts
Entregables:

Biblioteca de scripts completa
Ejecución segura con validaciones
Historial de ejecuciones
Exportación de resultados
5.6 Fase 6: Dashboard y Reportes (Semana 9)Tareas:

Implementar API endpoints de estadísticas
Crear componentes de gráficos con Recharts
Implementar Dashboard con KPIs
Crear servicio de generación de PDF
Crear servicio de generación de Excel
Implementar ReportGenerator component
Implementar filtros de reportes
Tests de generación de reportes
Entregables:

Dashboard funcional con gráficos interactivos
Generación de reportes PDF y Excel
Filtros personalizables
5.7 Fase 7: Búsqueda y Configuración (Semana 10)Tareas:

Implementar búsqueda full-text en backend
Crear GlobalSearch component con modal
Implementar debounce y filtros
Crear página de configuración
Implementar cambio de tema (claro/oscuro)
Implementar cambio de idioma (i18n)
Implementar gestión de tags
Implementar sistema de backup/restore
Tests de búsqueda
Entregables:

Búsqueda global funcional
Sistema de configuración completo
Temas claro/oscuro
Backup automático
5.8 Fase 8: Testing y Optimización (Semana 11)Tareas:

Completar cobertura de tests unitarios (objetivo 70%)
Implementar tests de integración faltantes
Optimizar queries de base de datos
Implementar índices faltantes
Optimizar bundle size del frontend
Implementar lazy loading de rutas
Optimizar carga de imágenes
Auditoría de seguridad
Corrección de bugs identificados
Entregables:

Cobertura de tests 70%+
Performance optimizado
Vulnerabilidades corregidas
5.9 Fase 9: Empaquetado y Documentación (Semana 12)Tareas:

Configurar electron-builder para todas las plataformas
Crear instaladores para Windows, macOS, Linux
Probar instaladores en cada plataforma
Escribir documentación de usuario
Escribir documentación técnica
Crear guía de instalación
Crear video demo
Preparar release notes
Entregables:

Instaladores funcionando en todas las plataformas
Documentación completa
Release 1.0.0 lista
6. CONSIDERACIONES ADICIONALES6.1 Mantenibilidad Futura
Seguir principios SOLID en todo el código
Mantener componentes pequeños y con responsabilidad única
Documentar decisiones arquitectónicas importantes
Mantener dependencias actualizadas
Versionar cambios de base de datos con migraciones
6.2 Escalabilidad
La arquitectura permite migrar a cliente-servidor en futuro
Los servicios están desacoplados para facilitar distribución
El uso de TypeScript facilita refactoring seguro
El ORM permite cambiar de motor de BD si es necesario
6.3 Extensibilidad
Sistema de plugins futuro mediante eventos
API REST documentada para integraciones
Hooks personalizados para comportamiento extendido
Tema personalizable mediante CSS variables
6.4 Accesibilidad
Cumplir con WCAG 2.1 nivel AA mínimo
- Navegación completa por teclado
- Screen reader compatibility
- Contraste de colores apropiado
- Textos alternativos en imágenes

### 6.5 Mejores Prácticas de Desarrollo

#### 6.5.1 Convenciones de Código

**Nomenclatura de Archivos:**
- Componentes React: PascalCase (IncidentForm.tsx)
- Hooks: camelCase con prefijo 'use' (useIncidents.ts)
- Servicios: camelCase con sufijo '.service' (incidents.service.ts)
- Utilidades: camelCase (validators.ts)
- Constantes: UPPER_SNAKE_CASE en el archivo constants.ts

**Nomenclatura de Variables:**
- Variables y funciones: camelCase (getUserData, isActive)
- Constantes: UPPER_SNAKE_CASE (MAX_FILE_SIZE, API_BASE_URL)
- Interfaces y Types: PascalCase (UserData, IncidentFilters)
- Enums: PascalCase con valores UPPER_SNAKE_CASE

**Estructura de Componentes React:**
```typescript
// 1. Imports
import React from 'react';
import { useIncidents } from '../hooks/useIncidents';// 2. Types/Interfaces
interface IncidentListProps {
filters?: IncidentFilters;
onIncidentClick: (id: number) => void;
}// 3. Componente
export const IncidentList: React.FC<IncidentListProps> = ({ filters, onIncidentClick }) => {
// 3.1 Hooks
const { data, isLoading, error } = useIncidents(filters);
const [selectedId, setSelectedId] = useState<number | null>(null);// 3.2 Event Handlers
const handleClick = (id: number) => {
setSelectedId(id);
onIncidentClick(id);
};// 3.3 Effects
useEffect(() => {
// Effect logic
}, []);// 3.4 Render conditions
if (isLoading) return <Spinner />;
if (error) return <Error message={error.message} />;// 3.5 Render
return (
<div>
{/* Component JSX */}
</div>
);
};

**Estructura de Servicios:**
```typescript// src/features/incidents/services/incidents.service.ts
import { api } from '@/lib/api';
import { Incident, IncidentFilters } from '../types/incident.types';class IncidentsService {
private readonly baseUrl = '/api/incidents';async getAll(filters?: IncidentFilters): Promise<{ incidents: Incident[]; pagination: Pagination }> {
const response = await api.get(this.baseUrl, { params: filters });
return response.data;
}async getById(id: number): Promise<Incident> {
const response = await api.get(${this.baseUrl}/${id});
return response.data;
}async create(data: CreateIncidentDto): Promise<Incident> {
const response = await api.post(this.baseUrl, data);
return response.data;
}async update(id: number, data: UpdateIncidentDto): Promise<Incident> {
const response = await api.put(${this.baseUrl}/${id}, data);
return response.data;
}async delete(id: number): Promise<void> {
await api.delete(${this.baseUrl}/${id});
}
}export const incidentsService = new IncidentsService();

#### 6.5.2 Manejo de Errores

**Frontend - Error Boundaries:**
```typescript// src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';interface Props {
children: ReactNode;
fallback?: ReactNode;
}interface State {
hasError: boolean;
error: Error | null;
}export class ErrorBoundary extends Component<Props, State> {
public state: State = {
hasError: false,
error: null
};public static getDerivedStateFromError(error: Error): State {
return { hasError: true, error };
}public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
console.error('Uncaught error:', error, errorInfo);
// Log to error tracking service
}public render() {
if (this.state.hasError) {
return this.props.fallback || (
<div className="p-4 bg-red-50 border border-red-200 rounded">
<h2 className="text-red-800 font-semibold">Algo salió mal</h2>
<p className="text-red-600">{this.state.error?.message}</p>
</div>
);
}return this.props.children;
}
}

**Backend - Error Handler Middleware:**
```typescript// server/src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';export class AppError extends Error {
statusCode: number;
isOperational: boolean;constructor(message: string, statusCode: number) {
super(message);
this.statusCode = statusCode;
this.isOperational = true;
Error.captureStackTrace(this, this.constructor);
}
}export const errorHandler = (
err: Error | AppError,
req: Request,
res: Response,
next: NextFunction
) => {
if (err instanceof AppError) {
logger.error('Operational error:', {
message: err.message,
statusCode: err.statusCode,
stack: err.stack,
path: req.path
});return res.status(err.statusCode).json({
  success: false,
  message: err.message
});
}// Programming or unknown errors
logger.error('Unexpected error:', {
message: err.message,
stack: err.stack,
path: req.path
});return res.status(500).json({
success: false,
message: 'Internal server error'
});
};

#### 6.5.3 Validación de Datos

**Zod Schemas (Frontend):**
```typescript// src/features/incidents/schemas/incident.schema.ts
import { z } from 'zod';export const createIncidentSchema = z.object({
title: z.string()
.min(1, 'El título es obligatorio')
.max(200, 'El título no puede exceder 200 caracteres'),
description: z.string()
.min(10, 'La descripción debe tener al menos 10 caracteres'),
server_id: z.number({
required_error: 'Debe seleccionar un servidor'
}).positive(),
type: z.enum([
'performance', 'availability', 'data_corruption', 'backup_restore',
'replication', 'security', 'capacity', 'slow_query', 'deadlock', 'other'
]),
severity: z.enum(['critical', 'high', 'medium', 'low']),
impact: z.enum(['critical', 'high', 'medium', 'low']).optional(),
reported_by: z.string().optional(),
detected_at: z.date(),
tags: z.array(z.number()).optional()
});export type CreateIncidentDto = z.infer<typeof createIncidentSchema>;

**Express Validator (Backend):**
```typescript// server/src/validators/incidents.validator.ts
import { body, param, query } from 'express-validator';export const createIncidentValidator = [
body('title')
.trim()
.notEmpty().withMessage('Title is required')
.isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
body('description')
.trim()
.notEmpty().withMessage('Description is required')
.isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
body('server_id')
.isInt({ min: 1 }).withMessage('Valid server_id is required'),
body('type')
.isIn([
'performance', 'availability', 'data_corruption', 'backup_restore',
'replication', 'security', 'capacity', 'slow_query', 'deadlock', 'other'
]).withMessage('Invalid incident type'),
body('severity')
.isIn(['critical', 'high', 'medium', 'low']).withMessage('Invalid severity'),
body('detected_at')
.isISO8601().withMessage('Invalid date format')
];export const updateIncidentValidator = [
param('id').isInt({ min: 1 }).withMessage('Valid incident ID is required'),
body('title')
.optional()
.trim()
.isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
body('description')
.optional()
.trim()
.isLength({ min: 10 }).withMessage('Description must be at least 10 characters')
];export const getIncidentsValidator = [
query('page')
.optional()
.isInt({ min: 1 }).withMessage('Page must be a positive integer'),
query('limit')
.optional()
.isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

#### 6.5.4 Internacionalización (i18n)

**Configuración de i18next:**
```typescript// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import es from '../locales/es.json';i18n
.use(initReactI18next)
.init({
resources: {
en: { translation: en },
es: { translation: es }
},
lng: localStorage.getItem('language') || 'es',
fallbackLng: 'es',
interpolation: {
escapeValue: false
}
});export default i18n;

**Archivos de traducción:**
```json// src/locales/es.json
{
"common": {
"save": "Guardar",
"cancel": "Cancelar",
"delete": "Eliminar",
"edit": "Editar",
"search": "Buscar",
"loading": "Cargando...",
"error": "Error",
"success": "Éxito"
},
"incidents": {
"title": "Incidentes",
"new": "Nuevo Incidente",
"list": "Lista de Incidentes",
"detail": "Detalle del Incidente",
"severity": {
"critical": "Crítica",
"high": "Alta",
"medium": "Media",
"low": "Baja"
},
"status": {
"new": "Nuevo",
"in_progress": "En Progreso",
"waiting": "En Espera",
"resolved": "Resuelto",
"closed": "Cerrado"
},
"form": {
"title": "Título",
"description": "Descripción",
"server": "Servidor",
"type": "Tipo de Incidente",
"severity": "Severidad",
"detected_at": "Fecha de Detección"
}
}
}
```json// src/locales/en.json
{
"common": {
"save": "Save",
"cancel": "Cancel",
"delete": "Delete",
"edit": "Edit",
"search": "Search",
"loading": "Loading...",
"error": "Error",
"success": "Success"
},
"incidents": {
"title": "Incidents",
"new": "New Incident",
"list": "Incidents List",
"detail": "Incident Detail",
"severity": {
"critical": "Critical",
"high": "High",
"medium": "Medium",
"low": "Low"
},
"status": {
"new": "New",
"in_progress": "In Progress",
"waiting": "Waiting",
"resolved": "Resolved",
"closed": "Closed"
},
"form": {
"title": "Title",
"description": "Description",
"server": "Server",
"type": "Incident Type",
"severity": "Severity",
"detected_at": "Detection Date"
}
}
}

**Uso en componentes:**
```typescriptimport { useTranslation } from 'react-i18next';export const IncidentForm = () => {
const { t } = useTranslation();return (
<form>
<label>{t('incidents.form.title')}</label>
<input type="text" placeholder={t('incidents.form.title')} />  <label>{t('incidents.form.description')}</label>
  <textarea placeholder={t('incidents.form.description')} />  <button type="submit">{t('common.save')}</button>
  <button type="button">{t('common.cancel')}</button>
</form>
);
};

### 6.6 Configuraciones Adicionales

#### 6.6.1 TailwindCSS Configuration
```javascript// tailwind.config.js
/** @type {import('tailwindcss').Config} /
module.exports = {
content: [
"./index.html",
"./src/**/.{js,ts,jsx,tsx}",
],
darkMode: 'class',
theme: {
extend: {
colors: {
primary: {
50: '#eff6ff',
100: '#dbeafe',
200: '#bfdbfe',
300: '#93c5fd',
400: '#60a5fa',
500: '#3b82f6',
600: '#2563eb',
700: '#1d4ed8',
800: '#1e40af',
900: '#1e3a8a',
},
severity: {
critical: '#dc2626',
high: '#ea580c',
medium: '#f59e0b',
low: '#10b981',
}
},
fontFamily: {
sans: ['Inter', 'system-ui', 'sans-serif'],
mono: ['JetBrains Mono', 'monospace'],
},
spacing: {
'128': '32rem',
'144': '36rem',
},
animation: {
'spin-slow': 'spin 3s linear infinite',
'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
}
},
},
plugins: [
require('@tailwindcss/forms'),
require('@tailwindcss/typography'),
],
}

#### 6.6.2 ESLint Configuration
```javascript// .eslintrc.js
module.exports = {
root: true,
env: {
browser: true,
es2021: true,
node: true,
},
extends: [
'eslint:recommended',
'plugin:@typescript-eslint/recommended',
'plugin:react/recommended',
'plugin:react-hooks/recommended',
'airbnb',
'airbnb-typescript',
'prettier',
],
parser: '@typescript-eslint/parser',
parserOptions: {
ecmaFeatures: {
jsx: true,
},
ecmaVersion: 'latest',
sourceType: 'module',
project: './tsconfig.json',
},
plugins: [
'react',
'@typescript-eslint',
'react-hooks',
],
rules: {
'react/react-in-jsx-scope': 'off',
'react/prop-types': 'off',
'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
'@typescript-eslint/explicit-module-boundary-types': 'off',
'import/prefer-default-export': 'off',
'no-console': ['warn', { allow: ['warn', 'error'] }],
'react/require-default-props': 'off',
'react/jsx-props-no-spreading': 'off',
'max-len': ['error', { code: 120, ignoreStrings: true, ignoreTemplateLiterals: true }],
},
settings: {
react: {
version: 'detect',
},
},
};

#### 6.6.3 Prettier Configuration
```json// .prettierrc
{
"semi": true,
"trailingComma": "es5",
"singleQuote": true,
"printWidth": 100,
"tabWidth": 2,
"useTabs": false,
"arrowParens": "always",
"endOfLine": "lf",
"bracketSpacing": true,
"jsxBracketSameLine": false
}

#### 6.6.4 TypeScript Configuration
```json// tsconfig.json
{
"compilerOptions": {
"target": "ES2020",
"useDefineForClassFields": true,
"lib": ["ES2020", "DOM", "DOM.Iterable"],
"module": "ESNext",
"skipLibCheck": true,
"moduleResolution": "bundler",
"allowImportingTsExtensions": true,
"resolveJsonModule": true,
"isolatedModules": true,
"noEmit": true,
"jsx": "react-jsx",
"strict": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
"noFallthroughCasesInSwitch": true,
"baseUrl": ".",
"paths": {
"@/": ["./src/"],
"@/components/": ["./src/components/"],
"@/features/": ["./src/features/"],
"@/lib/": ["./src/lib/"],
"@/hooks/": ["./src/hooks/"],
"@/types/": ["./src/types/"]
}
},
"include": ["src"],
"references": [{ "path": "./tsconfig.node.json" }]
}
```json// server/tsconfig.json
{
"compilerOptions": {
"target": "ES2020",
"module": "commonjs",
"lib": ["ES2020"],
"outDir": "./dist",
"rootDir": "./src",
"strict": true,
"esModuleInterop": true,
"skipLibCheck": true,
"forceConsistentCasingInFileNames": true,
"resolveJsonModule": true,
"moduleResolution": "node",
"baseUrl": ".",
"paths": {
"@/": ["./src/"]
},
"types": ["node", "jest"]
},
"include": ["src/**/*"],
"exclude": ["node_modules", "dist", "tests"]
}

#### 6.6.5 Vite Configuration
```typescript// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';export default defineConfig({
plugins: [react()],
resolve: {
alias: {
'@': path.resolve(__dirname, './src'),
'@/components': path.resolve(__dirname, './src/components'),
'@/features': path.resolve(__dirname, './src/features'),
'@/lib': path.resolve(__dirname, './src/lib'),
'@/hooks': path.resolve(__dirname, './src/hooks'),
'@/types': path.resolve(__dirname, './src/types'),
},
},
server: {
port: 5173,
strictPort: true,
},
build: {
outDir: 'dist',
sourcemap: true,
rollupOptions: {
output: {
manualChunks: {
'react-vendor': ['react', 'react-dom', 'react-router-dom'],
'ui-vendor': ['@headlessui/react', '@heroicons/react'],
'form-vendor': ['react-hook-form', 'zod'],
'query-vendor': ['@tanstack/react-query'],
'chart-vendor': ['recharts'],
},
},
},
},
});

### 6.7 Scripts de Utilidad

#### 6.7.1 Script de Inicialización de Base de Datos
```javascript// scripts/init-database.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();async function initDatabase() {
const connection = await mysql.createConnection({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
});try {
console.log('Creating database...');
await connection.query(CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME});
console.log(Database ${process.env.DB_NAME} created successfully);await connection.query(`USE ${process.env.DB_NAME}`);// Read and execute migration files
const migrationsPath = path.join(__dirname, '../database/migrations');
const files = fs.readdirSync(migrationsPath).sort();for (const file of files) {
  if (file.endsWith('.sql')) {
    console.log(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsPath, file), 'utf8');
    const statements = sql.split(';').filter(stmt => stmt.trim());    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    console.log(`Migration ${file} completed`);
  }
}console.log('Database initialization completed successfully');
} catch (error) {
console.error('Error initializing database:', error);
throw error;
} finally {
await connection.end();
}
}initDatabase();

#### 6.7.2 Script de Seed de Datos de Prueba
```javascript// scripts/seed-data.js
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
require('dotenv').config();const sequelize = new Sequelize(
process.env.DB_NAME,
process.env.DB_USER,
process.env.DB_PASSWORD,
{
host: process.env.DB_HOST,
dialect: 'mysql',
logging: false,
}
);async function seedData() {
try {
await sequelize.authenticate();
console.log('Connected to database');// Create admin user
const hashedPassword = await bcrypt.hash('admin123', 10);
await sequelize.query(`
  INSERT INTO users (email, password, full_name, role, is_active, created_at, updated_at)
  VALUES ('admin@localhost', ?, 'Administrador', 'admin', true, NOW(), NOW())
  ON DUPLICATE KEY UPDATE email=email
`, {
  replacements: [hashedPassword]
});
console.log('Admin user created');// Create sample servers
const servers = [
  ['MySQL Production', 'prod-mysql-01.company.com', 3306, 'mysql', '8.0.35', 'production', 'Servidor principal de producción', 'active'],
  ['PostgreSQL Dev', 'dev-postgres-01.company.com', 5432, 'postgresql', '15.4', 'development', 'Servidor de desarrollo', 'active'],
  ['SQL Server QA', 'qa-sqlserver-01.company.com', 1433, 'sqlserver', '2022', 'qa', 'Servidor de QA', 'active'],
];for (const server of servers) {
  await sequelize.query(`
    INSERT INTO servers (name, host, port, engine_type, engine_version, environment, description, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE name=name
  `, {
    replacements: server
  });
}
console.log('Sample servers created');
// Create sample tags
    const tags = [
      ['Performance', '#f59e0b'],
      ['Backup', '#10b981'],
      ['Seguridad', '#dc2626'],
      ['Replicación', '#3b82f6'],
      ['Capacidad', '#8b5cf6'],
    ];

    for (const tag of tags) {
      await sequelize.query(`
        INSERT INTO tags (name, color, created_at, updated_at)
        VALUES (?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE name=name
      `, {
        replacements: tag
      });
    }
    console.log('Sample tags created');

    console.log('Seed data completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

seedData();
````

#### 6.7.3 Script de Backup Automático
````javascript
// scripts/backup-database.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = process.env.BACKUP_DIR || './backups';
  const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const command = `mysqldump -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > ${backupFile}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Backup failed:', error);
      return;
    }
    console.log(`Backup created successfully: ${backupFile}`);

    // Clean old backups
    cleanOldBackups(backupDir);
  });
}

function cleanOldBackups(backupDir) {
  const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  fs.readdir(backupDir, (err, files) => {
    if (err) {
      console.error('Error reading backup directory:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(backupDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;

        if (stats.isFile() && stats.mtime < cutoffDate) {
          fs.unlink(filePath, err => {
            if (err) {
              console.error(`Error deleting old backup ${file}:`, err);
            } else {
              console.log(`Deleted old backup: ${file}`);
            }
          });
        }
      });
    });
  });
}

backupDatabase();
````

### 6.8 Documentación para Desarrolladores

#### 6.8.1 README Principal
````markdown
# DBA Incident Manager

Sistema de gestión de incidentes para administradores de bases de datos.

## Requisitos Previos

- Node.js 20.10.0 o superior
- MySQL 8.0 o superior
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/your-org/dba-incident-manager.git
cd dba-incident-manager
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Inicializar base de datos:
```bash
npm run db:init
npm run db:migrate
npm run db:seed
```

5. Iniciar aplicación en modo desarrollo:
```bash
npm run dev
```

## Scripts Disponibles

- `npm run dev` - Inicia aplicación en modo desarrollo
- `npm run build` - Construye aplicación para producción
- `npm run build:win` - Genera instalador para Windows
- `npm run build:mac` - Genera instalador para macOS
- `npm run build:linux` - Genera instalador para Linux
- `npm run lint` - Ejecuta linter
- `npm run test` - Ejecuta tests
- `npm run db:migrate` - Ejecuta migraciones de BD
- `npm run db:seed` - Inserta datos de prueba

## Estructura del Proyecto

Ver archivo ARCHITECTURE.md para detalles completos de la arquitectura.

## Contribuir

Ver archivo CONTRIBUTING.md para guías de contribución.

## Licencia

MIT
````

#### 6.8.2 Guía de Contribución
````markdown
# CONTRIBUTING.md

## Proceso de Desarrollo

1. Fork el repositorio
2. Crear rama de feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## Estándares de Código

- Seguir guía de estilo de Airbnb
- Usar TypeScript para todos los archivos nuevos
- Escribir tests para nueva funcionalidad
- Mantener cobertura de tests > 70%
- Documentar funciones complejas con JSDoc

## Commit Messages

Usar Conventional Commits:

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan código)
- `refactor:` Refactoring de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

Ejemplo:
````
feat(incidents): agregar filtro por rango de fechas

- Implementar date picker para filtro
- Agregar validación de rango
- Actualizar tests
````

## Pull Request

- Descripción clara del cambio
- Screenshots si incluye cambios visuales
- Lista de tareas completadas
- Referencias a issues relacionados

## Code Review

Todo código debe ser revisado por al menos un maintainer antes de merge.
````

## 7. ANEXOS

### 7.1 Glosario de Términos

- **DBA**: Database Administrator (Administrador de Base de Datos)
- **Incidente**: Evento que interrumpe o degrada el servicio normal de una base de datos
- **Severidad**: Nivel de impacto de un incidente (Crítica, Alta, Media, Baja)
- **SLA**: Service Level Agreement (Acuerdo de Nivel de Servicio)
- **Resolución**: Tiempo transcurrido desde la detección hasta la solución del incidente
- **Tag**: Etiqueta para categorizar y filtrar incidentes
- **Plantilla**: Solución reutilizable predefinida para problemas comunes
- **Script**: Código SQL, Bash, PowerShell o Python almacenado en la biblioteca
- **Adjunto**: Archivo (log, captura, script) asociado a un incidente

### 7.2 Casos de Uso Detallados

#### Caso de Uso 1: Registro de Incidente Crítico

**Actor**: DBA Senior  
**Precondición**: Usuario autenticado en el sistema  
**Flujo Principal**:
1. DBA recibe alerta de sistema caído
2. Ingresa a aplicación y selecciona "Nuevo Incidente"
3. Completa formulario:
   - Título: "Base de datos producción no responde"
   - Servidor: prod-mysql-01
   - Tipo: Disponibilidad
   - Severidad: Crítica
   - Descripción: Detalla síntomas y contexto
4. Adjunta log de errores del servidor
5. Agrega tags: "producción", "downtime"
6. Guarda incidente
7. Sistema sugiere 3 incidentes similares previos
8. DBA revisa soluciones anteriores
9. Aplica solución basada en caso anterior
10. Documenta solución aplicada
11. Cambia estado a "Resuelto"
12. Sistema calcula tiempo de resolución: 27 minutos

**Postcondición**: Incidente documentado y resuelto, disponible para consulta futura

#### Caso de Uso 2: Generación de Reporte Mensual

**Actor**: DBA Senior  
**Precondición**: Datos de al menos un mes en el sistema  
**Flujo Principal**:
1. Usuario selecciona "Reportes" en menú
2. Selecciona rango: 01/01/2024 - 31/01/2024
3. Selecciona filtros:
   - Todos los servidores
   - Todas las severidades
   - Incluir gráficos: Sí
   - Incluir detalles: No
4. Selecciona formato: PDF
5. Hace clic en "Generar Reporte"
6. Sistema procesa datos y genera PDF
7. Archivo se descarga automáticamente
8. Usuario abre PDF y revisa:
   - Total incidentes: 47
   - Promedio resolución: 2.3 horas
   - Gráfico de tendencia mensual
   - Top 5 servidores problemáticos
9. Usuario envía reporte a gerencia

**Postcondición**: Reporte generado y disponible para distribución

### 7.3 Matriz de Trazabilidad

| ID Req | Descripción | Componente Frontend | API Endpoint | Tabla BD | Prioridad | Estado |
|--------|-------------|---------------------|--------------|----------|-----------|--------|
| RF-001 | Registro de usuario | RegisterForm.tsx | POST /api/auth/register | users | Alta | Planificado |
| RF-002 | Inicio de sesión | LoginForm.tsx | POST /api/auth/login | users | Alta | Planificado |
| RF-004 | Registro de servidores | ServerForm.tsx | POST /api/servers | servers | Alta | Planificado |
| RF-007 | Creación de incidentes | IncidentForm.tsx | POST /api/incidents | incidents | Alta | Planificado |
| RF-015 | Sugerencias automáticas | SimilarIncidents.tsx | GET /api/incidents/:id/similar | incidents | Media | Planificado |
| RF-017 | Ejecución de scripts | ScriptExecutor.tsx | POST /api/scripts/:id/execute | execution_history | Media | Planificado |
| RF-019 | Dashboard principal | Dashboard.tsx | GET /api/dashboard/* | incidents, servers | Alta | Planificado |
| RF-020 | Reportes personalizados | ReportGenerator.tsx | POST /api/reports/generate | incidents | Media | Planificado |

### 7.4 Estimación de Recursos

#### Equipo Recomendado

**Opción 1: Equipo Completo**
- 1 Tech Lead / Arquitecto (20% tiempo)
- 2 Desarrolladores Full Stack Senior (100% tiempo)
- 1 Desarrollador Frontend (100% tiempo)
- 1 QA Engineer (50% tiempo)
- Total: 3.7 FTE x 12 semanas = 44.4 semanas-persona

**Opción 2: Equipo Reducido**
- 1 Desarrollador Full Stack Senior (100% tiempo)
- 1 Desarrollador Full Stack Mid (100% tiempo)
- Total: 2 FTE x 12 semanas = 24 semanas-persona

#### Costos Estimados (Opción 2)

- Desarrollo: 24 semanas x $1,500/semana = $36,000
- Infraestructura de desarrollo: $500
- Herramientas y licencias: $1,000
- Buffer (15%): $5,625
- **Total Estimado: $43,125**

### 7.5 Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Retraso en implementación de Electron | Media | Alto | Prototipo temprano, consultar documentación oficial |
| Problemas de performance con grandes datasets | Media | Medio | Implementar paginación, índices BD, lazy loading |
| Dificultad en ejecución remota de scripts SQL | Alta | Alto | Implementar primero ejecución local, remoto en fase posterior |
| Complejidad en algoritmo de similitud | Media | Bajo | Usar búsqueda full-text simple primero, mejorar después |
| Incompatibilidad con versiones antiguas de MySQL | Baja | Medio | Documentar requisito mínimo MySQL 8.0 |

### 7.6 Roadmap Futuro (Post v1.0)

#### Versión 1.1 (Q2 2024)
- Integración con sistemas de monitoreo (Prometheus, Grafana)
- Notificaciones push de incidentes críticos
- Modo colaborativo multi-usuario en tiempo real

#### Versión 1.2 (Q3 2024)
- Conexión remota a servidores de BD
- Ejecución remota de scripts
- Terminal SSH integrado

#### Versión 2.0 (Q4 2024)
- Versión web (cliente-servidor)
- API pública REST
- Integración con Slack/Teams
- Dashboard ejecutivo con BI
- Machine Learning para predicción de incidentes

### 7.7 Criterios de Aceptación Global

El proyecto será considerado completo cuando:

1. Todos los requerimientos funcionales RF-001 a RF-025 estén implementados
2. Cobertura de tests unitarios >= 70%
3. Todos los tests de integración pasen exitosamente
4. Instaladores funcionen en Windows, macOS y Linux
5. Documentación de usuario y técnica completa
6. Performance cumpla con RNF-001
7. Auditoría de seguridad sin vulnerabilidades críticas
8. Aprobación de UAT (User Acceptance Testing) por 3 DBAs

---

**Versión del Documento**: 1.0  
**Fecha**: Diciembre 2024  
**Autor**: Equipo de Desarrollo DBA Tools  
**Estado**: Aprobado para Desarrollo