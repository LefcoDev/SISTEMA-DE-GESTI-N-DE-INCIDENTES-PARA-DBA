# Sistema de Notificaciones Unificado - DBA Incident Manager

## 📋 Resumen

El sistema de notificaciones ahora está **unificado** y soporta múltiples canales:

### Canales Implementados
✅ **Notificaciones de escritorio** (Windows/Electron)  
✅ **Notificaciones por email** (SMTP)  
✅ **Notificaciones en la app** (Badge + Panel)  

### Canales Preparados (Futura Implementación)
🔄 **WhatsApp** (Twilio o WhatsApp Business API)  
🔄 **SMS** (Twilio)  

---

## 🔧 Configuración Actual

### 1. Email (SMTP)

Agrega estas variables al archivo `.env`:

```env
# Email / SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-correo@gmail.com
SMTP_PASSWORD=tu-contraseña-o-app-password
SMTP_FROM_NAME=DBA Incident Manager

# App URL (para links en emails)
APP_URL=http://localhost:5173
```

**Para Gmail:**
1. Ve a https://myaccount.google.com/apppasswords
2. Crea una "Contraseña de aplicación"
3. Usa esa contraseña en `SMTP_PASSWORD`

**Nota:** Si no configuras SMTP, el sistema funcionará normalmente pero sin enviar emails.

---

## 🚀 Tipos de Notificaciones

El sistema ahora notifica automáticamente sobre:

| Tipo | Descripción | Prioridad | Canales |
|------|-------------|-----------|---------|
| `monitoring_alert` | Servidor/BD caído o recuperado | Alta | Email + Desktop + App |
| `incident_created` | Nuevo incidente registrado | Media-Alta | Email + App |
| `incident_assigned` | Incidente asignado a ti | Media | Email + App |
| `reminder` | Recordatorio programado | Configurable | Email + Desktop + App |

---

## 📧 Templates de Email

El `EmailService` incluye 3 templates profesionales:

### 1. Alerta de Monitoreo
```typescript
emailService.sendMonitoringAlert(emails, {
  serverName: 'Oracle 19c Production',
  serverType: 'oracle',
  status: 'Offline',
  message: 'Connection timeout after 5000ms',
  timestamp: new Date()
});
```

### 2. Notificación de Incidente
```typescript
emailService.sendIncidentNotification(emails, {
  id: 123,
  title: 'Tablespace USERS al 98%',
  severity: 'critical',
  description: 'El tablespace USERS está casi lleno',
  assigned_to: 'Juan Pérez'
});
```

### 3. Recordatorio
```typescript
emailService.sendReminderNotification(email, {
  title: 'Backup mensual',
  description: 'Ejecutar backup completo',
  scheduled_at: new Date()
});
```

---

## 📱 WhatsApp (Preparación Futura)

Para integrar WhatsApp, existen dos opciones:

### Opción A: Twilio (Recomendado)

**Ventajas:**
- Fácil integración
- API bien documentada
- Sandbox gratuito para pruebas
- Soporta SMS también

**Pasos:**
1. Crear cuenta en https://www.twilio.com
2. Verificar número de teléfono
3. Obtener credenciales:
   - Account SID
   - Auth Token
   - WhatsApp number

**Código de ejemplo:**
```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  from: 'whatsapp:+14155238886', // Twilio sandbox number
  to: 'whatsapp:+529xxxxxxxxx',
  body: '🚨 Alerta: Servidor Oracle 19c caído'
});
```

**Variables .env:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=+14155238886
```

### Opción B: WhatsApp Business API

**Ventajas:**
- Control total
- Sin límites de mensajes
- Marca verificada

**Desventajas:**
- Requiere aplicación y aprobación de Facebook
- Proceso más complejo
- Puede tardar semanas

**Pasos:**
1. Tener una empresa registrada
2. Aplicar en https://business.whatsapp.com
3. Esperar aprobación
4. Configurar webhooks

---

## 🔔 Notificaciones de Windows

Las notificaciones de escritorio ya están implementadas en:

**Frontend:** `src/hooks/useNotifications.ts`
```typescript
const showDesktopNotification = async (notification) => {
  if (window.electron?.showNotification) {
    await window.electron.showNotification({
      title: notification.title,
      body: notification.message,
      urgency: notification.priority === 'critical' ? 'critical' : 'normal'
    });
  }
};
```

**Electron:** `electron/preload.ts`
```typescript
showNotification: async (options) => {
  return ipcRenderer.invoke('show-notification', options);
}
```

---

## 🎨 UI de Notificaciones

### Estado Actual
- ✅ Badge en el menú con contador
- ✅ Hook `useNotifications()` para consumir
- ✅ Polling cada 30 segundos

### Por Implementar
- 🔄 Panel desplegable con lista de notificaciones
- 🔄 Botón "marcar como leída"
- 🔄 Filtros por tipo
- 🔄 Configuración de preferencias por usuario

---

## 📊 Flujo de Notificaciones

```
┌─────────────────┐
│ Evento Ocurre   │
│ (Server down,   │
│  Incident, etc) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ NotificationSvc │
│ .create...()    │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌────────────────┐  ┌─────────────┐
│ Guardar en DB  │  │ EmailService│
│ (NotifQueue)   │  │ .send...()  │
└────────┬───────┘  └──────┬──────┘
         │                 │
         ▼                 ▼
┌────────────────┐  ┌─────────────┐
│ Frontend poll  │  │ Email SMTP  │
│ /api/notifs    │  │ enviado     │
└────────┬───────┘  └─────────────┘
         │
         ▼
┌────────────────┐
│ Desktop Notif  │
│ (Electron)     │
└────────────────┘
```

---

## 🛠️ Próximos Pasos

### Paso 4: Configuración de Usuario (En progreso)

Agregar a la tabla `users` o crear tabla `user_notification_preferences`:

```sql
CREATE TABLE user_notification_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  desktop_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  whatsapp_number VARCHAR(20),
  notification_types JSON, -- Qué tipos quiere recibir
  quiet_hours_start TIME, -- Ej: 22:00
  quiet_hours_end TIME,   -- Ej: 08:00
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Paso 5: Endpoint para WhatsApp

Crear `server/src/services/whatsapp.service.ts`:

```typescript
import twilio from 'twilio';
import logger from '../utils/logger';

export class WhatsAppService {
  private client: any;
  private enabled: boolean = false;

  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.enabled = true;
      logger.info('WhatsApp service initialized');
    } else {
      logger.warn('WhatsApp service disabled: Twilio credentials not provided');
    }
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      await this.client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        to: `whatsapp:${to}`,
        body: message
      });
      logger.info(`WhatsApp sent to ${to}`);
      return true;
    } catch (error) {
      logger.error('WhatsApp send error:', error);
      return false;
    }
  }
}

export default new WhatsAppService();
```

### Paso 6: Panel UI de Notificaciones

Crear componente `src/components/NotificationPanel.tsx` con:
- Dropdown desde el header
- Lista de notificaciones (últimas 10)
- Botón "Ver todas"
- Botón "Marcar como leída"
- Iconos según tipo de notificación

---

## 📝 Notas Importantes

1. **Privacy:** Los números de WhatsApp deben ser validados y con consentimiento del usuario
2. **Rate Limits:** Twilio y WhatsApp tienen límites de mensajes por día
3. **Costos:** WhatsApp via Twilio tiene costo por mensaje (~$0.005 USD)
4. **Testing:** Usa el Twilio Sandbox para pruebas sin costo

---

## 🔐 Seguridad

- ✅ Nunca exponer credenciales de SMTP/Twilio en el código
- ✅ Usar variables de entorno
- ✅ Validar números de teléfono antes de enviar
- ✅ Implementar rate limiting (máximo X notificaciones por minuto)
- ✅ Logs de todas las notificaciones enviadas

---

## 📦 Dependencias Requeridas

### Para Email (Ya instalado)
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

### Para WhatsApp (Futuro)
```bash
npm install twilio
```

### Para SMS (Futuro)
```bash
npm install twilio  # Mismo paquete que WhatsApp
```

---

## ✅ Checklist de Implementación

- [x] Extender tipos de notificación en modelo
- [x] Crear EmailService con templates HTML
- [x] Integrar notificaciones en monitoring.service
- [x] Integrar notificaciones en incident.service
- [x] Configurar variables .env
- [ ] Agregar tabla de preferencias de usuario
- [ ] Crear WhatsAppService (Twilio)
- [ ] Crear componente NotificationPanel UI
- [ ] Agregar configuración en perfil de usuario
- [ ] Implementar quiet hours (no molestar)
- [ ] Agregar rate limiting

---

## 🆘 Troubleshooting

### Email no se envía
1. Verificar credenciales SMTP en `.env`
2. Para Gmail, usar "App Password" no la contraseña normal
3. Revisar logs: `server console` mostrará errores de SMTP

### Notificaciones de escritorio no aparecen
1. Verificar que `window.electron.showNotification` existe
2. En Windows, verificar que las notificaciones están habilitadas
3. Ejecutar desde Electron, no desde navegador

### WhatsApp (Futuro)
1. Verificar que el número está en formato: `+52xxxxxxxxxx`
2. En Sandbox, el destinatario debe enviar código de activación primero
3. Revisar límites de mensajes en Twilio Console

---

## 📞 Contacto y Soporte

Para dudas sobre la implementación:
- Email Service: Ver `server/src/services/email.service.ts`
- Notification Service: Ver `server/src/services/notification.service.ts`
- Frontend Hook: Ver `src/hooks/useNotifications.ts`
