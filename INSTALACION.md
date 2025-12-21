# DBA Incident Manager - Guía de Instalación

## 📋 Requisitos Previos

Antes de instalar DBA Incident Manager, asegúrate de tener:

### 1. MySQL Server Instalado
- Descargar desde: https://dev.mysql.com/downloads/installer/
- Versión recomendada: MySQL 8.0 o superior
- Durante la instalación, anota la contraseña del usuario `root`

### 2. Crear Base de Datos
Abre MySQL Workbench o el cliente MySQL y ejecuta:

```sql
CREATE DATABASE dba_incident_manager;
```

### 3. Verificar que MySQL esté Corriendo
Abre PowerShell y ejecuta:
```powershell
netstat -ano | findstr :3306
```
Deberías ver una línea indicando que el puerto 3306 está en uso.

## 🚀 Instalación

1. Ejecuta `DBA Incident Manager Setup 1.0.0.exe`
2. Sigue el asistente de instalación
3. Al finalizar, marca "Ejecutar DBA Incident Manager"

## 🔧 Configuración Inicial

### Si MySQL usa contraseña diferente a "Linkindark16-":

1. Ve a la carpeta de instalación:
   ```
   C:\Users\TuUsuario\AppData\Local\Programs\dba-incident-manager\resources\
   ```

2. Edita el archivo `.env` con un editor de texto

3. Cambia la línea:
   ```
   DB_PASSWORD=Linkindark16-
   ```
   Por tu contraseña de MySQL

4. Guarda el archivo y reinicia la aplicación

### Si MySQL está en otro puerto u host:

Edita también estas líneas en el `.env`:
```
DB_HOST=localhost
DB_PORT=3306
```

## 👤 Primer Inicio de Sesión

Al abrir la aplicación por primera vez:

- **Email:** `admin@localhost.com`
- **Contraseña:** `admin123`

**IMPORTANTE:** Cambia la contraseña después del primer inicio.

## ❌ Solución de Problemas

### "Error al iniciar el servidor"
✅ Verifica que MySQL esté corriendo
✅ Verifica que existe la base de datos `dba_incident_manager`
✅ Verifica las credenciales en el archivo `.env`

### "Error de conexión" o pantalla en blanco
✅ Espera 10 segundos después de abrir la app (el servidor tarda en iniciar)
✅ Verifica el firewall de Windows no esté bloqueando el puerto 3001

### La aplicación no carga
✅ Cierra completamente la app desde el administrador de tareas
✅ Vuelve a abrirla
✅ Si persiste, reinstala la aplicación

## 📞 Soporte

Para más información, consulta la documentación en:
`C:\Users\TuUsuario\AppData\Local\Programs\dba-incident-manager\resources\documentacion.md`
