import nodemailer from 'nodemailer';
import logger from '../utils/logger';
import twilio from 'twilio';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  priority?: 'low' | 'normal' | 'high';
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private twilioClient: any = null;
  private enabled: boolean = false;
  private smsEnabled: boolean = false;
  private smsProvider: 'email-gateway' | 'twilio' = 'email-gateway';
  private initializing: boolean = false;
  private initialized: boolean = false;

  constructor() {
    // Initialize synchronously without async
    this.initializeSync();
  }

  private initializeSync() {
    try {
      const emailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      };

      // Only enable email if credentials are provided
      if (emailConfig.auth.user && emailConfig.auth.pass) {
        this.transporter = nodemailer.createTransport(emailConfig);
        this.enabled = true;
        this.initialized = true;
        logger.info('Email service initialized successfully');
        logger.info(`SMTP configured: ${emailConfig.auth.user} -> ${emailConfig.host}:${emailConfig.port}`);
        
        // Verify connection asynchronously (don't wait)
        this.transporter.verify()
          .then(() => {
            logger.info('SMTP connection verified successfully');
          })
          .catch((error) => {
            logger.error('SMTP verification failed (emails may not send):', error);
            // Don't disable, let it try to send anyway
          });
      } else {
        logger.warn('Email service disabled: SMTP credentials not provided');
        logger.warn(`SMTP_USER: ${emailConfig.auth.user ? 'SET' : 'NOT SET'}`);
        logger.warn(`SMTP_PASSWORD: ${emailConfig.auth.pass ? 'SET' : 'NOT SET'}`);
      }

      // Initialize SMS service (Twilio or email-gateway)
      this.smsEnabled = process.env.SMS_ENABLED !== 'false';
      this.smsProvider = (process.env.SMS_PROVIDER as any) || 'email-gateway';

      if (this.smsEnabled && this.smsProvider === 'twilio') {
        const twilioSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

        if (twilioSid && twilioToken && twilioPhone) {
          this.twilioClient = twilio(twilioSid, twilioToken);
          logger.info('Twilio SMS service initialized successfully');
          logger.info(`Twilio configured with number: ${twilioPhone}`);
        } else {
          logger.warn('Twilio credentials incomplete, SMS disabled');
          logger.warn(`TWILIO_ACCOUNT_SID: ${twilioSid ? 'SET' : 'NOT SET'}`);
          logger.warn(`TWILIO_AUTH_TOKEN: ${twilioToken ? 'SET' : 'NOT SET'}`);
          logger.warn(`TWILIO_PHONE_NUMBER: ${twilioPhone ? 'SET' : 'NOT SET'}`);
          this.smsEnabled = false;
        }
      } else if (this.smsEnabled && this.smsProvider === 'email-gateway') {
        logger.info('SMS via email-gateway enabled (Movistar Chile)');
      }
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      this.enabled = false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      logger.warn('Email service not enabled, skipping email');
      return false;
    }

    try {
      const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME || 'DBA Incident Manager'} <${process.env.SMTP_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        html: options.html,
        priority: options.priority || 'normal',
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  // Send SMS using Twilio or email-to-SMS gateway
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    // Check if SMS is disabled
    if (!this.smsEnabled) {
      logger.info('SMS disabled, skipping');
      return false;
    }

    // Clean phone number
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
    
    console.log(`[SMS] Provider: ${this.smsProvider}`);
    console.log(`[SMS] Original: ${phoneNumber} -> Clean: ${cleanNumber}`);
    console.log(`[SMS] Message (${message.length} chars): ${message.substring(0, 160)}`);

    try {
      if (this.smsProvider === 'twilio') {
        return await this.sendViaTwilio(cleanNumber, message);
      } else {
        return await this.sendViaEmailGateway(cleanNumber, message);
      }
    } catch (error) {
      logger.error(`Error sending SMS to ${phoneNumber}:`, error);
      console.error(`[SMS] Failed to send:`, error);
      return false;
    }
  }

  // Send SMS via Twilio API
  private async sendViaTwilio(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.twilioClient) {
      logger.error('Twilio client not initialized');
      return false;
    }

    try {
      // Ensure phone number has country code
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+56${phoneNumber}`;
      
      const twilioMessage = await this.twilioClient.messages.create({
        body: message.substring(0, 160),
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedNumber
      });

      logger.info(`SMS sent via Twilio to ${phoneNumber}: ${twilioMessage.sid}`);
      console.log(`[SMS] Twilio message sent - SID: ${twilioMessage.sid}, Status: ${twilioMessage.status}`);
      return true;
    } catch (error: any) {
      logger.error(`Twilio SMS error:`, error);
      console.error(`[SMS] Twilio error: ${error.message}`);
      return false;
    }
  }

  // Send SMS via Movistar Chile email-to-SMS gateway
  private async sendViaEmailGateway(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      logger.warn('Email service not enabled, skipping SMS gateway');
      return false;
    }

    // Remove + and country code if present (gateway expects only local number)
    const localNumber = phoneNumber.replace(/^\+?56/, ''); // Remove +56 or 56 prefix
    
    // Movistar Chile format: numero@movistar.cl
    const smsGateway = `${localNumber}@movistar.cl`;

    console.log(`[SMS] Gateway: ${smsGateway}`);

    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: smsGateway,
        subject: '', // SMS gateways typically ignore subject
        text: message.substring(0, 160), // Limit to 160 characters for SMS
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`SMS sent via email gateway to ${phoneNumber}: ${info.messageId}`);
      console.log(`[SMS] Email gateway accepted message for ${smsGateway}`);
      console.log(`[SMS] Note: Email-to-SMS delivery not guaranteed by carrier`);
      return true;
    } catch (error) {
      logger.error(`Email gateway SMS error:`, error);
      console.error(`[SMS] Gateway error:`, error);
      return false;
    }
  }

  // Send both email and SMS
  async sendEmailAndSMS(
    email: string,
    phoneNumber: string | null | undefined,
    subject: string,
    html: string,
    smsMessage: string
  ): Promise<{ email: boolean; sms: boolean }> {
    const results = {
      email: false,
      sms: false,
    };

    // Send email
    results.email = await this.sendEmail({
      to: email,
      subject,
      html,
    });

    // Send SMS if phone number is provided
    if (phoneNumber) {
      results.sms = await this.sendSMS(phoneNumber, smsMessage);
    }

    return results;
  }

  // Template for incident notification
  async sendIncidentNotification(
    to: string | string[],
    phoneNumber: string | null | undefined,
    incidentData: {
      id: number;
      title: string;
      severity: string;
      description?: string;
      assigned_to?: string;
    }
  ) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #374151;
              background-color: #ffffff;
              margin: 0;
              padding: 0;
            }
            .email-wrapper { 
              background-color: #f3f4f6; 
              padding: 40px 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
              color: white; 
              padding: 32px 24px; 
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 22px;
              font-weight: 600;
              letter-spacing: -0.3px;
            }
            .content { 
              background: white; 
              padding: 32px 24px;
            }
            .incident-id {
              font-size: 12px;
              font-weight: 700;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 12px;
            }
            .incident-title {
              font-size: 20px;
              font-weight: 600;
              color: #111827;
              margin: 0 0 16px 0;
              line-height: 1.3;
            }
            .badge { 
              display: inline-block; 
              padding: 6px 14px; 
              border-radius: 4px; 
              font-size: 11px; 
              font-weight: 700; 
              text-transform: uppercase;
              letter-spacing: 0.8px;
              margin-bottom: 20px;
            }
            .badge-critical { background: #374151; color: white; }
            .badge-high { background: #6b7280; color: white; }
            .badge-medium { background: #9ca3af; color: white; }
            .badge-low { background: #d1d5db; color: #374151; }
            .info-section {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 20px;
              margin-top: 16px;
            }
            .info-label {
              font-weight: 600;
              color: #6b7280;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            .info-value {
              color: #111827;
              font-size: 14px;
              line-height: 1.6;
            }
            .footer { 
              background: #f9fafb; 
              padding: 20px 24px; 
              text-align: center; 
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 4px 0;
              font-size: 12px;
              color: #9ca3af;
            }
            .footer strong {
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <h1>🚨 Nuevo Incidente</h1>
              </div>
              <div class="content">
                <div class="incident-id">Incidente #${incidentData.id}</div>
                <h2 class="incident-title">${incidentData.title}</h2>
                <div>
                  <span class="badge badge-${incidentData.severity.toLowerCase()}">${incidentData.severity}</span>
                </div>
                ${incidentData.description ? `
                  <div class="info-section">
                    <div class="info-label">Descripción</div>
                    <div class="info-value">${incidentData.description}</div>
                  </div>
                ` : ''}
                ${incidentData.assigned_to ? `
                  <div class="info-section">
                    <div class="info-label">Asignado a</div>
                    <div class="info-value">${incidentData.assigned_to}</div>
                  </div>
                ` : ''}
              </div>
              <div class="footer">
                <p><strong>DBA Incident Manager</strong></p>
                <p>Sistema automático de gestión de incidentes</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const smsMessage = `🚨 Incidente #${incidentData.id}: ${incidentData.title}. Severidad: ${incidentData.severity}`;
    
    if (phoneNumber) {
      const emailTo = Array.isArray(to) ? to[0] : to;
      const results = await this.sendEmailAndSMS(emailTo, phoneNumber, `🚨 Incidente #${incidentData.id}: ${incidentData.title}`, html, smsMessage);
      return { email: results.email, sms: results.sms };
    }
    
    const emailSent = await this.sendEmail({
      to,
      subject: `🚨 Incidente #${incidentData.id}: ${incidentData.title}`,
      html,
      priority: incidentData.severity === 'critical' ? 'high' : 'normal',
    });
    return { email: emailSent, sms: false };
  }

  // Template for server/database monitoring alert
  async sendMonitoringAlert(
    to: string | string[],
    phoneNumber: string | null | undefined,
    alertData: {
      serverName: string;
      serverType: string;
      status: string;
      message: string;
      timestamp: Date;
    }
  ) {
    const isOffline = alertData.status.toLowerCase() === 'offline';
    const statusColor = isOffline ? '#4b5563' : '#6b7280';
    const statusBg = isOffline ? '#f9fafb' : '#ffffff';
    const statusBorder = isOffline ? '#9ca3af' : '#d1d5db';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #374151;
              background-color: #ffffff;
              margin: 0;
              padding: 0;
            }
            .email-wrapper { 
              background-color: #f3f4f6; 
              padding: 40px 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
              color: white; 
              padding: 32px 24px; 
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 22px;
              font-weight: 600;
              letter-spacing: -0.3px;
            }
            .header p {
              margin: 8px 0 0 0;
              font-size: 14px;
              opacity: 0.95;
              font-weight: 500;
            }
            .content { 
              background: white; 
              padding: 32px 24px;
            }
            .alert-box { 
              background: ${statusBg}; 
              border: 1px solid ${statusBorder}; 
              padding: 24px; 
              margin: 0;
              border-radius: 6px;
            }
            .alert-box h3 {
              margin: 0 0 20px 0;
              font-size: 18px;
              font-weight: 600;
              color: #111827;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 12px;
            }
            .info-row {
              display: flex;
              padding: 12px 0;
              border-bottom: 1px solid #f3f4f6;
            }
            .info-row:last-child {
              border-bottom: none;
              padding-bottom: 0;
            }
            .info-label {
              font-weight: 600;
              color: #6b7280;
              min-width: 110px;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-value {
              color: #111827;
              font-size: 14px;
              font-weight: 500;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 14px;
              background: ${isOffline ? '#374151' : '#6b7280'};
              color: white;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.8px;
            }
            .footer { 
              background: #f9fafb; 
              padding: 20px 24px; 
              text-align: center; 
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 4px 0;
              font-size: 12px;
              color: #9ca3af;
            }
            .footer strong {
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <h1>${isOffline ? '⚠️' : '✅'} Alerta de Monitoreo</h1>
                <p>${alertData.serverName}</p>
              </div>
              <div class="content">
                <div class="alert-box">
                  <h3>${alertData.serverName}</h3>
                  <div class="info-row">
                    <div class="info-label">Tipo:</div>
                    <div class="info-value">${alertData.serverType.toUpperCase()}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Estado:</div>
                    <div class="info-value">
                      <span class="status-badge">${alertData.status}</span>
                    </div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Mensaje:</div>
                    <div class="info-value">${alertData.message}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Fecha y Hora:</div>
                    <div class="info-value">${alertData.timestamp.toLocaleString('es-ES', { 
                      dateStyle: 'full', 
                      timeStyle: 'short' 
                    })}</div>
                  </div>
                </div>
              </div>
              <div class="footer">
                <p><strong>DBA Incident Manager</strong></p>
                <p>Sistema automático de monitoreo</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const smsMessage = `⚠️ ${alertData.serverName}: ${alertData.status}. ${alertData.message}`;
    
    if (phoneNumber) {
      const emailTo = Array.isArray(to) ? to[0] : to;
      const results = await this.sendEmailAndSMS(emailTo, phoneNumber, `⚠️ Alerta: ${alertData.serverName} - ${alertData.status}`, html, smsMessage);
      return { email: results.email, sms: results.sms };
    }
    
    const emailSent = await this.sendEmail({
      to,
      subject: `⚠️ Alerta: ${alertData.serverName} - ${alertData.status}`,
      html,
      priority: 'high',
    });
    return { email: emailSent, sms: false };
  }

  // Template for reminder notification
  async sendReminderNotification(
    to: string,
    reminderData: {
      title: string;
      description?: string;
      scheduled_at: Date;
    }
  ) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Recordatorio</h1>
            </div>
            <div class="content">
              <h2>${reminderData.title}</h2>
              ${reminderData.description ? `<p>${reminderData.description}</p>` : ''}
              <p><strong>Programado para:</strong> ${reminderData.scheduled_at.toLocaleString('es-ES')}</p>
            </div>
            <div class="footer">
              <p>Este es un mensaje automático del sistema DBA Incident Manager</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `🔔 Recordatorio: ${reminderData.title}`,
      html,
    });
  }
}

export default new EmailService();
