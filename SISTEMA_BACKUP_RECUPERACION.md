# DOCUMENTO TÉCNICO - SISTEMA DE BACKUP Y RECUPERACIÓN
## DBA Incident Manager - Backup & Disaster Recovery System

---

## 1. INFORMACIÓN GENERAL DEL MÓDULO

### 1.1 Nombre del Módulo
**Sistema de Backup y Recuperación (Backup & Disaster Recovery System)**

### 1.2 Descripción
Sistema integral de respaldo y recuperación de datos para DBA Incident Manager que garantiza la protección, disponibilidad y recuperabilidad de toda la información crítica del sistema. Incluye múltiples capas de protección con backups automáticos locales, sincronización opcional en la nube, y herramientas de restauración con verificación de integridad.

El sistema opera de manera transparente para el usuario, ejecutando backups programados automáticamente mientras proporciona controles manuales avanzados para administradores que requieren mayor control sobre sus datos.

### 1.3 Objetivos

- **Proteger datos críticos** contra pérdida por fallas de hardware, software o error humano
- **Minimizar tiempo de inactividad** mediante restauración rápida y confiable
- **Cumplir con buenas prácticas** de gestión de datos y continuidad operacional
- **Proporcionar múltiples capas de protección** (local y nube)
- **Automatizar procesos** de backup reduciendo intervención manual
- **Garantizar integridad** mediante verificación de backups
- **Facilitar migración** entre dispositivos y sistemas
- **Optimizar almacenamiento** mediante compresión y políticas de retención
- **Documentar historial** completo de backups y restauraciones

### 1.4 Alcance

**Incluye:**
- Sistema de backups automáticos locales (diario, semanal, mensual)
- Backup manual on-demand
- Compresión y empaquetado de datos
- Múltiples estrategias de almacenamiento
- Sincronización opcional con servicios cloud (Google Drive, Dropbox, OneDrive)
- Restauración completa y selectiva
- Verificación de integridad de backups
- Gestión de retención y limpieza automática
- Exportación portable (SQL + archivos)
- Importación desde backups externos
- Logs de auditoría de operaciones
- Notificaciones de estado de backups
- Interfaz de usuario para gestión
- Recuperación ante desastres

**No Incluye:**
- Backup en tiempo real (continuous data protection)
- Replicación activa entre servidores
- Versionado granular tipo Git
- Backup incremental diferencial
- Cifrado militar-grade (solo compresión estándar)
- Integración con sistemas empresariales de backup (Veeam, Acronis, etc.)

### 1.5 Importancia Crítica

En un sistema de gestión de incidentes de bases de datos, la pérdida de información puede significar:
- ❌ Pérdida de histórico de resolución de problemas
- ❌ Desaparición de conocimiento documentado
- ❌ Imposibilidad de análisis de tendencias
- ❌ Pérdida de scripts críticos
- ❌ Falta de trazabilidad en auditorías
- ❌ Incapacidad de demostrar SLA cumplidos

Un sistema de backup robusto es **esencial** para la continuidad operacional.

---

## 2. REQUERIMIENTOS FUNCIONALES

### 2.1 Módulo de Backups Automáticos

#### RF-B001: Backup Automático Programado

El sistema debe ejecutar backups automáticos con las siguientes frecuencias:

**Backup Diario:**
- Ejecutar cada día a las 2:00 AM (hora local)
- Nombrado: `backup-daily-YYYY-MM-DD-HHmmss.zip`
- Retención: 7 días
- Incluye: Base de datos + uploads + configuración

**Backup Semanal:**
- Ejecutar cada domingo a las 3:00 AM
- Nombrado: `backup-weekly-YYYY-MM-DD-HHmmss.zip`
- Retención: 30 días (4 semanas)
- Incluye: Base de datos + uploads + configuración + logs

**Backup Mensual:**
- Ejecutar día 1 de cada mes a las 4:00 AM
- Nombrado: `backup-monthly-YYYY-MM-DD-HHmmss.zip`
- Retención: 365 días (12 meses)
- Incluye: Todo + metadata de estadísticas

**Características:**
- Horarios configurables por usuario
- Desactivable individualmente por tipo
- Notificación en caso de fallo
- Reintento automático tras fallo (máximo 3 intentos)
- Verificación de integridad post-backup
- Registro en log de auditoría

**Validaciones:**
- Espacio en disco suficiente (mínimo 2x tamaño estimado)
- No ejecutar múltiples backups simultáneos
- Detección de backups en curso
- Timeout de 30 minutos máximo

#### RF-B002: Backup Manual On-Demand

El sistema debe permitir crear backup manual en cualquier momento con:
- Botón "Crear Backup Ahora" en interfaz
- Atajo de teclado: `Ctrl+Shift+B`
- Desde línea de comandos (CLI)
- Nombrado: `backup-manual-YYYY-MM-DD-HHmmss.zip`
- Retención: Infinita (usuario debe eliminar manualmente)
- Progreso visible en tiempo real
- Cancelable durante ejecución
- Metadata personalizable (descripción, tags)

**Casos de uso:**
- Antes de actualizaciones mayores
- Antes de operaciones críticas
- Para migración a otro dispositivo
- Backup ad-hoc por auditoría

#### RF-B003: Contenido del Backup

Cada backup debe incluir:

**Obligatorio:**
- Base de datos completa (dump SQL o copia .db)
- Carpeta `/uploads` completa con todos los adjuntos
- Archivo `backup-manifest.json` con metadata

**Opcional (configurable):**
- Configuración de aplicación (`app_settings`)
- Logs de aplicación (últimos 30 días)
- Historial de ejecución de scripts
- Plantillas personalizadas
- Preferencias de usuario

**Metadata en manifest.json:**
```json
{
  "backup_id": "uuid",
  "backup_type": "daily|weekly|monthly|manual",
  "backup_name": "backup-daily-2024-12-18-020000",
  "created_at": "2024-12-18T02:00:00Z",
  "created_by": "user_id",
  "app_version": "1.0.0",
  "database_type": "sqlite|mysql",
  "database_size_bytes": 52428800,
  "uploads_count": 1234,
  "uploads_size_bytes": 104857600,
  "total_size_bytes": 157286400,
  "compression_ratio": 0.65,
  "checksums": {
    "database": "sha256_hash",
    "uploads": "sha256_hash",
    "full": "sha256_hash"
  },
  "tables_backup": [
    { "table": "users", "rows": 15 },
    { "table": "incidents", "rows": 2345 },
    { "table": "servers", "rows": 45 }
  ],
  "notes": "Manual backup before major update"
}
```

#### RF-B004: Compresión y Optimización

El sistema debe:
- Comprimir backups usando ZIP con nivel 9 (máxima compresión)
- Calcular ratio de compresión y mostrarlo
- Excluir archivos temporales y caché
- Deduplicar archivos idénticos en uploads (por hash)
- Optimizar tamaño de dumps SQL:
  - Excluir tablas temporales
  - Limpiar logs antiguos antes de backup
  - Compactar base de datos (VACUUM para SQLite)

**Optimizaciones específicas:**
- Archivos ya comprimidos (.zip, .gz): No recomprimir
- Imágenes: Almacenar tal cual (ya comprimidas)
- Logs: Comprimir con gzip antes de incluir
- Base de datos: Dump comprimido si MySQL, copia directa si SQLite

#### RF-B005: Verificación de Integridad

Después de cada backup, el sistema debe:
- Calcular checksum SHA-256 del archivo completo
- Verificar que el ZIP no está corrupto
- Probar extracción de archivos críticos (BD)
- Validar estructura de manifest.json
- Registrar resultado de verificación
- Alertar si verificación falla

**Proceso de verificación:**
1. Calcular hash del archivo ZIP
2. Intentar abrir ZIP
3. Listar contenido y verificar archivos esperados
4. Extraer archivo de BD a temp
5. Validar dump SQL o integridad de .db
6. Limpiar archivos temporales
7. Registrar resultado en `backup_verification_log`

### 2.2 Módulo de Gestión de Backups

#### RF-B006: Listado de Backups

El sistema debe mostrar todos los backups disponibles con:

**Vista Principal:**
- Lista ordenada por fecha (más reciente primero)
- Información por backup:
  - Nombre del archivo
  - Tipo (daily/weekly/monthly/manual)
  - Fecha y hora de creación
  - Tamaño del archivo (formateado)
  - Estado (válido, corrupto, no verificado)
  - Ubicación (local, cloud)
  - Descripción/notas

**Filtros:**
- Por tipo de backup
- Por rango de fechas
- Por estado
- Por ubicación
- Búsqueda por nombre/descripción

**Acciones disponibles:**
- Ver detalles completos
- Restaurar
- Descargar
- Eliminar
- Verificar integridad
- Subir a cloud
- Renombrar
- Agregar notas

#### RF-B007: Detalle de Backup

Al seleccionar un backup, mostrar vista detallada con:
- Toda la metadata del manifest.json
- Gráfico de distribución de tamaño (BD vs Uploads vs Otros)
- Lista de tablas incluidas con cantidad de registros
- Historial de verificaciones
- Log de creación
- Tiempo de creación
- Ratio de compresión
- Checksums
- Compatibilidad con versión actual

**Opciones avanzadas:**
- Ver contenido del ZIP sin extraer
- Comparar con otro backup (diff)
- Exportar metadata como JSON/PDF
- Copiar a ubicación externa

#### RF-B008: Políticas de Retención

El sistema debe aplicar políticas de retención automáticas:

**Configuración por defecto:**
- Diarios: Mantener últimos 7
- Semanales: Mantener últimos 4 (1 mes)
- Mensuales: Mantener últimos 12 (1 año)
- Manuales: No eliminar automáticamente

**Políticas personalizables:**
- Usuario puede configurar retención por tipo
- Límite de espacio total (ej: máximo 10GB)
- Límite de cantidad total (ej: máximo 50 backups)
- Política "3-2-1": 3 copias, 2 tipos diferentes, 1 offsite

**Limpieza automática:**
- Ejecutar diariamente a las 5:00 AM
- Identificar backups que exceden retención
- Eliminar archivos físicos
- Eliminar registros de metadata
- Registrar eliminaciones en log
- Notificar si se eliminaron backups importantes

**Protecciones:**
- No eliminar último backup válido
- No eliminar backups con tags "importante" o "auditoría"
- Confirmar antes de eliminar backups manuales con notas
- Mantener siempre al menos 1 backup de cada tipo

#### RF-B009: Búsqueda y Filtrado Avanzado

El sistema debe permitir:
- Búsqueda por nombre de archivo
- Búsqueda por descripción/notas
- Filtro por rango de fechas
- Filtro por tamaño (min/max)
- Filtro por estado de verificación
- Búsqueda de backups que contengan datos específicos:
  - "Backups que contengan incidente #123"
  - "Backups que incluyan scripts de usuario X"
  - "Backups antes de fecha Y"

**Vista de timeline:**
- Visualización de backups en línea de tiempo
- Agrupación por mes/semana
- Indicadores visuales de gaps (períodos sin backup)
- Alertas de períodos sin protección

### 2.3 Módulo de Restauración

#### RF-B010: Restauración Completa

El sistema debe permitir restaurar sistema completo desde backup:

**Proceso de restauración:**
1. Seleccionar backup a restaurar
2. Mostrar advertencia de sobrescritura
3. Crear backup automático del estado actual ("punto de rollback")
4. Verificar integridad del backup seleccionado
5. Detener servicios de backend
6. Extraer contenido del backup
7. Restaurar base de datos
8. Restaurar archivos de uploads
9. Restaurar configuración
10. Verificar integridad de datos restaurados
11. Reiniciar servicios
12. Validar funcionamiento
13. Registrar operación en log

**Validaciones antes de restaurar:**
- Backup debe estar verificado y válido
- Espacio en disco suficiente
- Versión de app compatible
- No hay operaciones críticas en curso
- Usuario tiene permisos de admin

**Opciones de restauración:**
- Restauración completa (por defecto)
- Restauración con prueba previa (test mode)
- Restauración con preservación de configuración actual
- Restauración selectiva (ver RF-B011)

**Manejo de errores:**
- Si falla, intentar rollback automático
- Registrar error detallado
- Mantener backup de seguridad
- Notificar al usuario con instrucciones
- Ofrecer modo de recuperación manual

#### RF-B011: Restauración Selectiva

El sistema debe permitir restaurar componentes específicos:

**Opciones selectivas:**
- Solo base de datos
- Solo archivos uploads
- Solo configuración
- Solo tablas específicas
- Solo registros específicos (por filtro)

**Casos de uso:**
- Recuperar incidente eliminado accidentalmente
- Restaurar archivos adjuntos perdidos
- Revertir cambios en configuración
- Recuperar scripts eliminados
- Restaurar usuarios específicos

**Interfaz de selección:**
- Vista de árbol del contenido del backup
- Checkboxes para seleccionar elementos
- Preview de datos a restaurar
- Comparación con datos actuales
- Opciones de merge o sobrescritura

#### RF-B012: Punto de Restauración (Rollback)

Antes de cada restauración, crear punto de rollback:
- Backup automático nombrado `rollback-before-restore-timestamp.zip`
- Metadata indica que es punto de rollback
- Retención: 7 días
- Acceso rápido desde "Operaciones Recientes"
- Opción "Deshacer Restauración" disponible 24 horas

**Funcionalidad "Deshacer":**
- Botón visible si última operación fue restauración
- Revierte a estado pre-restauración
- Sin confirmación adicional (ya es rollback)
- Elimina backup de rollback tras éxito

#### RF-B013: Modo de Recuperación

En caso de corrupción severa o imposibilidad de iniciar:

**Modo recovery:**
- Detectable al inicio si DB está corrupta
- Pantalla especial de recuperación
- Lista automática de backups disponibles
- Restauración simplificada con 1 clic
- Bypass de autenticación
- Logging detallado de proceso
- Soporte para restauración desde archivos externos

**Acceso al modo recovery:**
- Automático si detecta corrupción
- Manual con flag: `--recovery-mode`
- Atajo de teclado al inicio: `F8`

### 2.4 Módulo de Backup en la Nube

#### RF-B014: Configuración de Cloud Backup

El sistema debe soportar sincronización con servicios cloud:

**Proveedores soportados:**
- Google Drive
- Dropbox
- Microsoft OneDrive
- AWS S3 (opcional)
- Servidor FTP/SFTP personalizado

**Configuración por proveedor:**

**Google Drive:**
- Autenticación OAuth 2.0
- Carpeta: "DBA Incident Manager Backups"
- Permisos: Solo archivos creados por la app
- Sincronización: Automática o manual

**Dropbox:**
- App Token o OAuth
- Carpeta: `/Apps/DBA-Backups/`
- Sincronización selectiva

**OneDrive:**
- Microsoft Account OAuth
- Carpeta: "Documentos/DBA Backups"

**Configuración general:**
- Habilitar/deshabilitar sincronización
- Seleccionar proveedor
- Frecuencia de sincronización (inmediata, cada 6h, diaria)
- Tipos de backup a sincronizar (solo manuales, todos)
- Límite de ancho de banda
- Solo sincronizar con Wi-Fi
- Notificaciones de sincronización

#### RF-B015: Sincronización Automática

El sistema debe sincronizar automáticamente con la nube:

**Proceso de sincronización:**
1. Detectar nuevo backup local
2. Verificar conexión a internet
3. Verificar espacio disponible en cloud
4. Calcular checksum
5. Iniciar upload
6. Mostrar progreso
7. Verificar integridad post-upload
8. Registrar en log
9. Actualizar estado del backup

**Sincronización inteligente:**
- Reintentar si falla (máximo 3 intentos)
- Reanudar uploads interrumpidos
- Upload en background sin bloquear UI
- Priorizar backups más recientes
- Comprimir aún más si tamaño excede límite

**Políticas en la nube:**
- Retención independiente de local (configurable)
- Por defecto: mantener últimos 30 días en cloud
- Opción de mantener indefinidamente backups manuales
- Limpieza automática de backups antiguos en cloud

#### RF-B016: Descarga desde Cloud

El sistema debe permitir:
- Listar backups disponibles en la nube
- Comparar con backups locales
- Descargar backup desde cloud
- Restaurar directamente desde cloud
- Sincronizar: descargar backups que faltan localmente

**Vista de backups cloud:**
- Indicador visual: local ✓, cloud ☁️, ambos ✓☁️
- Tamaño en cada ubicación
- Fecha de última sincronización
- Estado de sincronización (pendiente, en progreso, completado)

**Descarga inteligente:**
- Verificar si ya existe localmente (por checksum)
- Reanudar descargas interrumpidas
- Validar integridad post-descarga
- Opción de eliminar de cloud tras descargar

#### RF-B017: Gestión de Espacio Cloud

El sistema debe:
- Mostrar espacio usado vs disponible
- Alertar cuando espacio se agota (< 10% restante)
- Sugerir limpieza de backups antiguos
- Calcular proyección de espacio (cuándo se llenará)
- Opción de comprimir aún más backups en cloud
- Sugerir upgrade de plan si necesario

### 2.5 Módulo de Exportación e Importación

#### RF-B018: Exportación Portable

El sistema debe permitir exportar datos en formato portable:

**Formato de exportación:**
- `export-YYYY-MM-DD.zip` conteniendo:
  - `database.sql` (dump completo)
  - `/uploads/` (todos los archivos)
  - `export-manifest.json` (metadata)
  - `README.txt` (instrucciones de importación)

**Opciones de export:**
- Exportar todo
- Exportar rango de fechas
- Exportar solo ciertos módulos (incidentes, servidores, scripts, notas)
- Exportar sin archivos adjuntos (solo BD)
- Formato: ZIP, TAR.GZ, o carpeta sin comprimir

**Casos de uso:**
- Migración a nuevo dispositivo
- Compartir datos con otro DBA
- Auditoría externa
- Análisis en otro sistema
- Archivo histórico

#### RF-B019: Importación desde Export

El sistema debe permitir importar exports:
- Detectar formato del export
- Validar compatibilidad de versión
- Opciones de importación:
  - Sobrescribir todo (con backup previo)
  - Merge con datos existentes
  - Solo tablas específicas
  - Evitar duplicados (por ID/fecha)

**Validaciones:**
- Estructura de manifest válida
- Dump SQL compatible
- Archivos íntegros
- Sin conflictos de IDs
- Relaciones intactas

#### RF-B020: Migración entre Dispositivos

El sistema debe facilitar migración completa:

**Asistente de migración:**
1. En dispositivo origen: Crear export completo
2. Guardar en USB o subir a cloud
3. En dispositivo destino: Importar export
4. Validar integridad
5. Configurar preferencias de nuevo entorno

**Transferencia directa:**
- Generar código QR con configuración
- Transferencia por red local (si ambos están en misma red)
- Sincronización inicial desde cloud

### 2.6 Módulo de Verificación y Auditoría

#### RF-B021: Verificación de Integridad

El sistema debe verificar integridad de backups:

**Verificación automática:**
- Inmediatamente después de creación
- Semanalmente para todos los backups
- Antes de restauración
- Bajo demanda por usuario

**Proceso de verificación:**
1. Calcular checksum actual
2. Comparar con checksum registrado
3. Intentar abrir archivo ZIP
4. Validar estructura interna
5. Verificar manifest.json
6. Test de extracción de muestra
7. Registrar resultado
8. Actualizar estado del backup

**Estados de verificación:**
- ✅ Verificado OK
- ⚠️ No verificado
- ❌ Corrupto
- 🔄 Verificación en progreso
- ⏱️ Pendiente de verificación

#### RF-B022: Logs de Auditoría

El sistema debe mantener log detallado de:

**Eventos registrados:**
- Creación de backups (tipo, tamaño, duración)
- Verificaciones de integridad (resultado)
- Restauraciones (completas o selectivas)
- Eliminaciones de backups (manual o automática)
- Sincronizaciones con cloud (éxito/fallo)
- Errores y reintentos
- Cambios de configuración
- Accesos a backups

**Información por evento:**
```json
{
  "event_id": "uuid",
  "timestamp": "2024-12-18T02:00:15Z",
  "event_type": "backup_created",
  "user_id": 1,
  "details": {
    "backup_name": "backup-daily-2024-12-18-020000.zip",
    "backup_type": "daily",
    "size_bytes": 157286400,
    "duration_seconds": 45,
    "tables_count": 15,
    "rows_total": 25634,
    "compression_ratio": 0.65
  },
  "result": "success",
  "error": null
}
```

**Acceso a logs:**
- Vista en interfaz con filtros
- Export a CSV/JSON
- Búsqueda por fecha, tipo, usuario
- Gráficos de tendencias

#### RF-B023: Reportes de Backup

El sistema debe generar reportes:

**Reporte de Estado General:**
- Total de backups disponibles
- Espacio total usado
- Último backup exitoso
- Cobertura de backup (días sin gaps)
- Tasa de éxito de backups
- Backups en cloud vs local
- Alertas de problemas

**Reporte de Salud del Sistema:**
- Backups fallidos (últimos 30 días)
- Backups corruptos detectados
- Tiempo promedio de backup
- Tendencia de tamaño de backups
- Proyección de espacio necesario
- Estado de sincronización cloud

**Reporte de Cumplimiento:**
- Políticas de retención: Cumplidas ✓ / Incumplidas ✗
- Frecuencia de backups: OK / Insuficiente
- Última restauración de prueba
- Backups offsite disponibles
- Recomendaciones

**Formatos de reporte:**
- Vista en pantalla
- PDF descargable
- JSON para integración
- Email programado (semanal/mensual)

### 2.7 Módulo de Configuración

#### RF-B024: Configuración General

El sistema debe permitir configurar:

**Rutas y Almacenamiento:**
- Directorio de backups locales
- Directorio temporal para operaciones
- Límite de espacio usado (GB)
- Límite de cantidad de backups

**Programación:**
- Habilitar/deshabilitar backups automáticos
- Horarios personalizados (diario, semanal, mensual)
- Zona horaria
- Ejecutar solo si PC está enchufado
- Ejecutar solo si PC está inactivo (opcional)

**Retención:**
- Días a mantener por tipo de backup
- Política de espacio (eliminar más antiguos si excede límite)
- Protección de backups importantes

**Notificaciones:**
- Notificar cuando backup completa
- Notificar cuando backup falla
- Notificar cuando espacio es insuficiente
- Notificar sincronización cloud
- Canal de notificación (in-app, email, ambos)

**Optimización:**
- Nivel de compresión (1-9)
- Incluir logs en backups
- Compactar BD antes de backup
- Verificar automáticamente tras crear

#### RF-B025: Configuración Avanzada

**Exclusiones:**
- Excluir tablas específicas (ej: logs temporales)
- Excluir tipos de archivos en uploads (ej: videos)
- Excluir archivos mayores a X MB
- Patrones de exclusión (wildcards)

**Performance:**
- Límite de CPU durante backup (%)
- Límite de ancho de banda para cloud (KB/s)
- Prioridad de proceso (normal, baja)
- Pausar backups durante alta carga

**Seguridad:**
- Cifrar backups con contraseña (opcional)
- Algoritmo de cifrado: AES-256
- Cifrar solo backups en cloud
- Requerir contraseña para restaurar

**Avanzado:**
- Modo debug (logging verboso)
- Reintentos automáticos (cantidad)
- Timeout de operaciones (minutos)
- Usar compresión multi-thread
- Verificación con múltiples algoritmos (SHA-256 + MD5)

#### RF-B026: Perfiles de Backup

El sistema debe permitir crear perfiles personalizados:

**Perfiles predefinidos:**
- "Mínimo" - Solo BD, sin archivos
- "Estándar" - BD + uploads < 10MB
- "Completo" - Todo incluido
- "Auditoría" - Todo + logs extendidos

**Perfiles personalizados:**
- Nombre del perfil
- Qué incluir/excluir
- Frecuencia
- Retención
- Destino (local/cloud/ambos)

**Uso de perfiles:**
- Seleccionar perfil para backup manual
- Asignar perfil a backups automáticos
- Cambiar perfil sin perder configuración

### 2.8 Módulo de Notificaciones

#### RF-B027: Notificaciones de Backup

El sistema debe notificar eventos importantes:

**Notificaciones exitosas:**
- "✅ Backup diario creado exitosamente (157 MB)"
- "☁️ Backup sincronizado con Google Drive"
- "✅ Restauración completada sin errores"

**Notificaciones de advertencia:**
- "⚠️ Espacio de backups casi lleno (85% usado)"
- "⚠️ No se ha creado backup en 3 días"
- "⚠️ Backup verificado con advertencias menores"

**Notificaciones de error:**
- "❌ Backup diario falló: Espacio insuficiente"
- "❌ Sincronización cloud falló: Sin conexión"
- "❌ Backup corrupto detectado: backup-2024-12-15.zip"

**Canales de notificación:**
- In-app (toast notification)
- Notificación sistema operativo
- Email (configurable)
- Centro de notificaciones de la app

**Opciones:**
- Silenciar notificaciones de éxito
- Solo notificar fallos
- Frecuencia máxima (evitar spam)
- No molestar en horarios específicos

---

## 3. REQUERIMIENTOS NO FUNCIONALES

### 3.1 Rendimiento

**RNF-B001: Tiempos de Ejecución**
- Backup de BD pequeña (<100MB): < 30 segundos
- Backup de BD mediana (100MB-1GB): < 5 minutos
- Backup de BD grande (>1GB): < 15 minutos
- Verificación de integridad: < 10 segundos para backups <500MB
- Restauración completa: < 3 minutos para backups <1GB
- Listado de backups: < 1 segundo
- Sincronización cloud: Depende de ancho de banda, pero progreso visible

**RNF-B002: Uso de Recursos**
- Uso de CPU durante backup: < 50% en promedio
- Uso de RAM: < 500MB adicionales durante operación
- No bloquear interfaz durante backups en background
- Operaciones cancellables en cualquier momento
- Liberar recursos inmediatamente tras completar

**RNF-B003: Concurrencia**
- Solo 1 backup puede ejecutarse a la vez
- Operaciones de lectura (listar, verificar) no bloquean creación
- Restauración bloquea todas las operaciones
- Queue de operaciones si hay múltiples solicitudes

### 3.2 Confiabilidad

**RNF-B004: Integridad de Datos**
- 100% de datos restaurados deben ser idénticos a originales
- Checksums SHA-256 para verificación
- Validación de integridad antes y después de cada operación
- Detección automática de corrupción
- Rollback automático si restauración falla

**RNF-B005: Disponibilidad**
- Sistema de backup debe estar disponible 24/7
- Backups automáticos deben ejecutarse aunque app esté cerrada (servicio background)
- Recuperación ante fallos: Modo recovery siempre accesible
- Degradación elegante: Si cloud falla, continuar con local

**RNF-B006: Tolerancia a Fallos**
- Reintentos automáticos en fallos transitorios (red, disco)
- Preservación de estado en caso de crash
- No perder backups parciales
- Continuar desde último punto en reintentos
- Log detallado de todos los errores

### 3.3 Usabilidad

**RNF-B007: Facilidad de Uso**
- Backup manual con máximo 2 clics
- Restauración con asistente paso a paso
- Terminología clara y en español
- Progreso visible en todo momento
- Estimación de tiempo restante
- Confirmaciones claras en operaciones destructivas

**RNF-B008: Feedback Visual**
- Progreso de backup: Barra de progreso + porcentaje + paso actual
- Estado de backups: Íconos claros (✓, ✗, ⚠️, 🔄)
- Notificaciones no intrusivas
- Colores consistentes (verde=éxito, rojo=error, amarillo=advertencia)
- Animaciones suaves

**RNF-B009: Documentación**
- Ayuda contextual en cada pantalla
- Tooltips en opciones avanzadas
- Guía de recuperación ante desastres
- Videos tutoriales embebidos
- FAQs integradas

### 3.4 Seguridad

**RNF-B010: Protección de Datos**
- Backups almacenados con permisos restrictivos (solo app)
- Cifrado opcional de backups en cloud
- No almacenar credenciales de cloud en texto plano
- Logs de auditoría inmutables
- Verificación de integridad criptográfica

**RNF-B011: Control de Acceso**
- Solo administradores pueden restaurar
- Solo administradores pueden eliminar backups
- Usuarios pueden crear backups manuales
- Usuarios pueden ver lista de backups
- Log de quién accedió a qué backup

**RNF-B012: Privacidad**
- Backups locales permanecen locales por defecto
- Sincronización cloud es opcional y explícita
- Usuario controla qué sube a cloud
- Opción de eliminar todos los datos cloud
- No telemetría de contenido de backups

### 3.5 Mantenibilidad

**RNF-B013: Código**
- Arquitectura modular (servicios independientes)
- Tests unitarios para lógica crítica (>80% cobertura)
- Tests de integración para flujos completos
- Logging estructurado (JSON)
- Métricas de performance instrumentadas

**RNF-B014: Monitoreo**
- Dashboard de salud del sistema
- Alertas proactivas de problemas
- Estadísticas de uso
- Detección de tendencias (crecimiento de datos)
- Capacidad de diagnóstico remoto

### 3.6 Compatibilidad

**RNF-B015: Formatos**
- Backups compatibles entre versiones (forward/backward)
- Detección automática de versión de backup
- Migración automática de formatos antiguos
- Export en formatos estándar (SQL, ZIP)
- Importación de backups generados externamente

**RNF-B016: Plataformas**
- Funcional en Windows, macOS, Linux
- Rutas de archivos portables
- Detección automática de sistema de archivos
- Soporte de caracteres especiales en nombres

### 3.7 Escalabilidad

**RNF-B017: Crecimiento de Datos**
- Debe manejar hasta 100GB de datos
- Hasta 10,000 archivos en uploads
- Hasta 1,000,000 de registros en BD
- Hasta 500 backups históricos
- Performance no debe degradarse linealmente

**RNF-B018: Cloud Storage**
- Soporte para múltiples cuentas cloud
- Distribución de backups entre proveedores
- Failover automático entre proveedores
- Manejo de límites de API rate limiting

---

## 4. ESPECIFICACIONES TÉCNICAS

### 4.1 Stack Tecnológico

#### 4.1.1 Dependencias Principales

```json
{
  "dependencies": {
    // Compresión y archivo
    "archiver": "^6.0.1",           // Crear ZIP
    "adm-zip": "^0.5.10",           // Leer ZIP
    "tar-stream": "^3.1.6",         // TAR.GZ opcional
    
    // Base de datos
    "mysqldump": "^3.2.0",          // Dump MySQL
    "better-sqlite3": "^9.2.2",     // SQLite nativo
    
    // Filesystem
    "fs-extra": "^11.2.0",          // Operaciones de archivos
    "glob": "^10.3.10",             // Pattern matching
    "chokidar": "^3.5.3",           // File watching
    
    // Cron y scheduling
    "node-cron": "^3.0.3",          // Tareas programadas
    "cron-parser": "^4.9.0",        // Validar expresiones cron
    
    // Cloud storage
    "googleapis": "^128.0.0",       // Google Drive API
    "dropbox": "^10.34.0",          // Dropbox SDK
    "@microsoft/microsoft-graph-client": "^3.0.7",  // OneDrive
    "aws-sdk": "^2.1498.0",         // S3 opcional
    
    // Checksums y crypto
    "crypto": "built-in",           // SHA-256, MD5
    "node-forge": "^1.3.1",         // Cifrado AES-256
    
    // Utilities
    "bytes": "^3.1.2",              // Formatear tamaños
    "filesize": "^10.1.0",          // Alternative formatter
    "date-fns": "^3.0.0",           // Manejo de fechas
    "uuid": "^9.0.1"                // IDs únicos
  }
}
```

### 4.2 Arquitectura del Sistema

#### 4.2.1 Estructura de Directorios

```
server/src/
├── services/
│   ├── backup/
│   │   ├── backup.service.ts              # Servicio principal
│   │   ├── backupScheduler.service.ts     # Cron jobs
│   │   ├── backupVerification.service.ts  # Verificación
│   │   ├── backupCompression.service.ts   # Compresión
│   │   ├── backupManifest.service.ts      # Metadata
│   │   └── backupRetention.service.ts     # Políticas retención
│   │
│   ├── restore/
│   │   ├── restore.service.ts             # Servicio principal
│   │   ├── restoreValidation.service.ts   # Validaciones
│   │   ├── restoreRollback.service.ts     # Rollback
│   │   └── restoreSelective.service.ts    # Restauración selectiva
│   │
│   ├── cloud/
│   │   ├── cloudBackup.service.ts         # Base para cloud
│   │   ├── googleDrive.service.ts         # Google Drive
│   │   ├── dropbox.service.ts             # Dropbox
│   │   ├── onedrive.service.ts            # OneDrive
│   │   ├── s3.service.ts                  # AWS S3
│   │   └── cloudSync.service.ts           # Sincronización
│   │
│   ├── export/
│   │   ├── export.service.ts              # Exportación
│   │   └── import.service.ts              # Importación
│   │
│   └── monitoring/
│       ├── backupHealth.service.ts        # Salud del sistema
│       ├── backupMetrics.service.ts       # Métricas
│       └── backupAudit.service.ts         # Auditoría
│
├── models/
│   ├── Backup.ts                          # Modelo de backup
│   ├── BackupLog.ts                       # Log de operaciones
│   ├── BackupVerification.ts              # Verificaciones
│   └── CloudSyncStatus.ts                 # Estado sync
│
├── controllers/
│   ├── backup.controller.ts               # API backups
│   ├── restore.controller.ts              # API restauración
│   ├── cloudBackup.controller.ts          # API cloud
│   └── backupConfig.controller.ts         # API configuración
│
├── routes/
│   ├── backup.routes.ts
│   ├── restore.routes.ts
│   ├── cloudBackup.routes.ts
│   └── backupConfig.routes.ts
│
├── validators/
│   ├── backup.validator.ts
│   └── restore.validator.ts
│
├── utils/
│   ├── checksums.utils.ts                 # Cálculo checksums
│   ├── compression.utils.ts               # Utilidades compresión
│   ├── filesystem.utils.ts                # Operaciones archivos
│   └── pathSanitizer.utils.ts             # Sanitización rutas
│
└── workers/
    ├── backupWorker.ts                    # Worker para backups
    └── syncWorker.ts                      # Worker para sync

src/features/backup/
├── components/
│   ├── BackupDashboard.tsx                # Dashboard principal
│   ├── BackupList.tsx                     # Lista de backups
│   ├── BackupDetail.tsx                   # Detalle de backup
│   ├── BackupCreate.tsx                   # Crear backup manual
│   ├── BackupRestore.tsx                  # Restaurar
│   ├── BackupSettings.tsx                 # Configuración
│   ├── BackupProgress.tsx                 # Barra de progreso
│   ├── BackupVerification.tsx             # Estado verificación
│   ├── CloudBackupSetup.tsx               # Config cloud
│   ├── CloudBackupSync.tsx                # Sincronización
│   ├── BackupLogs.tsx                     # Logs
│   ├── BackupReports.tsx                  # Reportes
│   ├── BackupTimeline.tsx                 # Timeline
│   └── RecoveryMode.tsx                   # Modo recuperación
│
├── hooks/
│   ├── useBackup.ts
│   ├── useRestore.ts
│   ├── useCloudBackup.ts
│   ├── useBackupProgress.ts
│   └── useBackupHealth.ts
│
├── services/
│   ├── backup.service.ts
│   ├── restore.service.ts
│   └── cloudBackup.service.ts
│
├── store/
│   ├── backupStore.ts
│   └── cloudBackupStore.ts
│
└── types/
    └── backup.types.ts
```

### 4.3 Modelos de Base de Datos

#### Tabla: backups

```sql
CREATE TABLE backups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Identificación
  backup_name VARCHAR(255) NOT NULL UNIQUE,
  backup_type ENUM('daily', 'weekly', 'monthly', 'manual', 'auto') NOT NULL,
  
  -- Ubicación
  file_path VARCHAR(1000) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT NULL,
  app_version VARCHAR(20) NOT NULL,
  database_type ENUM('sqlite', 'mysql') NOT NULL,
  
  -- Contenido
  database_size_bytes BIGINT NOT NULL,
  uploads_size_bytes BIGINT NOT NULL,
  uploads_count INT NOT NULL,
  tables_count INT NOT NULL,
  total_rows INT NOT NULL,
  
  -- Compresión
  compression_ratio DECIMAL(4,2) NOT NULL,
  compression_level INT DEFAULT 9,
  
  -- Checksums
  checksum_sha256 VARCHAR(64) NOT NULL,
  checksum_md5 VARCHAR(32) NULL,
  
  -- Estado
  status ENUM('creating', 'completed', 'failed', 'corrupted', 'verified') NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  last_verified_at TIMESTAMP NULL,
  verification_result TEXT NULL,
  
  -- Cloud
  is_synced_cloud BOOLEAN DEFAULT FALSE,
  cloud_provider VARCHAR(50) NULL,
  cloud_file_id VARCHAR(255) NULL,
  cloud_synced_at TIMESTAMP NULL,
  
  -- Metadata adicional
  description TEXT NULL,
  tags JSON NULL,
  manifest_json JSON NULL,
  
  -- Retención
  retention_days INT NULL,
  expires_at DATE NULL,
  is_protected BOOLEAN DEFAULT FALSE,
  
  -- Auditoría
  deleted_at TIMESTAMP NULL,
  deleted_by INT NULL,
  
  INDEX idx_backup_type (backup_type),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status),
  INDEX idx_is_verified (is_verified),
  INDEX idx_cloud_synced (is_synced_cloud),
  INDEX idx_expires (expires_at),
  
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (deleted_by) REFERENCES users(id)
);
```

#### Tabla: backup_logs

```sql
CREATE TABLE backup_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  backup_id INT NULL,
  
  -- Evento
  event_type ENUM(
    'backup_started', 'backup_completed', 'backup_failed',
    'verification_started', 'verification_completed', 'verification_failed',
    'restore_started', 'restore_completed', 'restore_failed',
    'sync_started', 'sync_completed', 'sync_failed',
    'backup_deleted', 'config_changed'
  ) NOT NULL,
  
  -- Detalles
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT NULL,
  
  -- Contexto
  details JSON NULL,
  error_message TEXT NULL,
  stack_trace TEXT NULL,
  
  -- Performance
  duration_seconds INT NULL,
  
  -- Resultado
  result ENUM('success', 'failure', 'warning') NOT NULL,
  
  INDEX idx_backup (backup_id),
  INDEX idx_event_type (event_type),
  INDEX idx_timestamp (timestamp),
  INDEX idx_result (result),
  
  FOREIGN KEY (backup_id) REFERENCES backups(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Tabla: backup_verifications

```sql
CREATE TABLE backup_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  backup_id INT NOT NULL,
  
  -- Verificación
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verification_type ENUM('automatic', 'manual', 'pre_restore') NOT NULL,
  
  -- Resultados
  status ENUM('passed', 'failed', 'warning') NOT NULL,
  
  -- Checks realizados
  checksum_valid BOOLEAN NOT NULL,
  zip_structure_valid BOOLEAN NOT NULL,
  manifest_valid BOOLEAN NOT NULL,
  database_valid BOOLEAN NOT NULL,
  files_count_match BOOLEAN NOT NULL,
  
  -- Detalles
  issues_found JSON NULL,
  duration_seconds INT NOT NULL,
  
  -- Metadata
  performed_by INT NULL,
  
  INDEX idx_backup (backup_id),
  INDEX idx_verified_at (verified_at),
  INDEX idx_status (status),
  
  FOREIGN KEY (backup_id) REFERENCES backups(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id)
);
```

#### Tabla: restore_operations

```sql
CREATE TABLE restore_operations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  backup_id INT NOT NULL,
  
  -- Operación
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  
  -- Tipo
  restore_type ENUM('full', 'selective', 'database_only', 'files_only') NOT NULL,
  
  -- Estado
  status ENUM('in_progress', 'completed', 'failed', 'rolled_back') NOT NULL,
  
  -- Rollback
  rollback_backup_id INT NULL,
  rollback_performed BOOLEAN DEFAULT FALSE,
  
  -- Resultados
  tables_restored INT NULL,
  rows_restored INT NULL,
  files_restored INT NULL,
  
  -- Performance
  duration_seconds INT NULL,
  
  -- Detalles
  selective_options JSON NULL,
  error_message TEXT NULL,
  
  -- Auditoría
  performed_by INT NOT NULL,
  notes TEXT NULL,
  
  INDEX idx_backup (backup_id),
  INDEX idx_started_at (started_at),
  INDEX idx_status (status),
  
  FOREIGN KEY (backup_id) REFERENCES backups(id),
  FOREIGN KEY (rollback_backup_id) REFERENCES backups(id),
  FOREIGN KEY (performed_by) REFERENCES users(id)
);
```

#### Tabla: cloud_sync_status

```sql
CREATE TABLE cloud_sync_status (
  id INT PRIMARY KEY AUTO_INCREMENT,
  backup_id INT NOT NULL,
  
  -- Provider
  cloud_provider ENUM('google_drive', 'dropbox', 'onedrive', 's3') NOT NULL,
  cloud_file_id VARCHAR(255) NOT NULL,
  cloud_file_url VARCHAR(1000) NULL,
  
  -- Sync
  sync_started_at TIMESTAMP NOT NULL,
  sync_completed_at TIMESTAMP NULL,
  
  -- Estado
  status ENUM('pending', 'uploading', 'completed', 'failed') NOT NULL,
  
  -- Progress
  bytes_uploaded BIGINT DEFAULT 0,
  total_bytes BIGINT NOT NULL,
  progress_percentage INT DEFAULT 0,
  
  -- Resultado
  error_message TEXT NULL,
  retry_count INT DEFAULT 0,
  
  -- Metadata
  cloud_checksum VARCHAR(64) NULL,
  cloud_file_size BIGINT NULL,
  
  INDEX idx_backup (backup_id),
  INDEX idx_status (status),
  INDEX idx_provider (cloud_provider),
  
  FOREIGN KEY (backup_id) REFERENCES backups(id) ON DELETE CASCADE
);
```

#### Tabla: backup_config

```sql
CREATE TABLE backup_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  -- General
  backup_enabled BOOLEAN DEFAULT TRUE,
  backup_location VARCHAR(1000) NOT NULL,
  temp_location VARCHAR(1000) NULL,
  
  -- Programación
  daily_enabled BOOLEAN DEFAULT TRUE,
  daily_time TIME DEFAULT '02:00:00',
  weekly_enabled BOOLEAN DEFAULT TRUE,
  weekly_day INT DEFAULT 0, -- 0=Sunday
  weekly_time TIME DEFAULT '03:00:00',
  monthly_enabled BOOLEAN DEFAULT TRUE,
  monthly_day INT DEFAULT 1,
  monthly_time TIME DEFAULT '04:00:00',
  
  -- Retención
  daily_retention_days INT DEFAULT 7,
  weekly_retention_days INT DEFAULT 30,
  monthly_retention_days INT DEFAULT 365,
  
  -- Límites
  max_total_size_gb INT DEFAULT 50,
  max_backup_count INT DEFAULT 100,
  
  -- Compresión
  compression_level INT DEFAULT 9,
  include_logs BOOLEAN DEFAULT TRUE,
  
  -- Verificación
  auto_verify BOOLEAN DEFAULT TRUE,
  weekly_verification BOOLEAN DEFAULT TRUE,
  
  -- Notificaciones
  notify_on_success BOOLEAN DEFAULT FALSE,
  notify_on_failure BOOLEAN DEFAULT TRUE,
  notify_email VARCHAR(255) NULL,
  
  -- Cloud
  cloud_sync_enabled BOOLEAN DEFAULT FALSE,
  cloud_provider VARCHAR(50) NULL,
  cloud_sync_frequency ENUM('immediate', '6hours', 'daily') DEFAULT 'daily',
  cloud_retention_days INT DEFAULT 30,
  
  -- Avanzado
  run_on_battery BOOLEAN DEFAULT FALSE,
  run_when_idle_only BOOLEAN DEFAULT FALSE,
  cpu_limit_percentage INT DEFAULT 50,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_config (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4.4 APIs y Endpoints

#### 4.4.1 Backups

**GET /api/backups**
- Query: `?type=&status=&from_date=&to_date=&cloud_synced=&page=&limit=`
- Response: `{ success, data: { backups, pagination, stats } }`

**GET /api/backups/:id**
- Response: `{ success, data: { backup, manifest, verifications, logs } }`

**POST /api/backups**
- Body: `{ type: 'manual', description?, tags?, include_logs?, notify? }`
- Response: `{ success, data: { backup_id, status: 'started' } }`

**DELETE /api/backups/:id**
- Query: `?permanent=false`
- Response: `{ success, message }`

**POST /api/backups/:id/verify**
- Response: `{ success, data: { verification_result } }`

**GET /api/backups/:id/download**
- Response: File download

**POST /api/backups/:id/duplicate**
- Body: `{ new_name?, new_location? }`
- Response: `{ success, data: { new_backup } }`

**GET /api/backups/health**
- Response: `{ success, data: { health_status, issues, recommendations } }`

**GET /api/backups/stats**
- Query: `?period=30days`
- Response: `{ success, data: { total_size, count, success_rate, avg_duration } }`

#### 4.4.2 Restauración

**GET /api/restore/validate/:backupId**
- Response: `{ success, data: { is_valid, compatibility, warnings } }`

**POST /api/restore**
- Body: `{ backup_id, restore_type, selective_options?, create_rollback?, dry_run? }`
- Response: `{ success, data: { operation_id, estimated_duration } }`

**GET /api/restore/status/:operationId**
- Response: `{ success, data: { status, progress, current_step } }`

**POST /api/restore/:operationId/rollback**
- Response: `{ success, message }`

**GET /api/restore/history**
- Query: `?limit=20&page=1`
- Response: `{ success, data: { operations, pagination } }`

#### 4.4.3 Cloud Backup

**GET /api/cloud-backup/providers**
- Response: `{ success, data: { providers: ['google_drive', 'dropbox', 'onedrive'] } }`

**POST /api/cloud-backup/authenticate**
- Body: `{ provider, credentials }`
- Response: `{ success, data: { access_token, refresh_token } }`

**POST /api/cloud-backup/sync/:backupId**
- Body: `{ provider?, force? }`
- Response: `{ success, data: { sync_status } }`

**GET /api/cloud-backup/list**
- Query: `?provider=google_drive`
- Response: `{ success, data: { cloud_backups } }`

**POST /api/cloud-backup/download/:cloudFileId**
- Body: `{ provider }`
- Response: `{ success, data: { download_url, expires_at } }`

**DELETE /api/cloud-backup/:cloudFileId**
- Query: `?provider=google_drive`
- Response: `{ success, message }`

**GET /api/cloud-backup/status**
- Response: `{ success, data: { is_configured, provider, last_sync, pending_syncs } }`

**POST /api/cloud-backup/disconnect**
- Body: `{ provider }`
- Response: `{ success, message }`

#### 4.4.4 Configuración

**GET /api/backup-config**
- Response: `{ success, data: { config } }`

**PUT /api/backup-config**
- Body: `{ ...config_fields }`
- Response: `{ success, data: { config } }`

**POST /api/backup-config/test-schedule**
- Body: `{ schedule_config }`
- Response: `{ success, data: { next_executions: [...] } }`

**GET /api/backup-config/storage-info**
- Response: `{ success, data: { total_space, used_space, available_space, backup_space } }`

#### 4.4.5 Logs y Auditoría

**GET /api/backup-logs**
- Query: `?event_type=&from_date=&to_date=&result=&page=&limit=`
- Response: `{ success, data: { logs, pagination } }`

**GET /api/backup-logs/export**
- Query: `?format=csv|json`
- Response: File download

**GET /api/backup-logs/summary**
- Query: `?period=7days`
- Response: `{ success, data: { summary_stats, events_breakdown } }`

#### 4.4.6 Reportes

**GET /api/backup-reports/health**
- Response: `{ success, data: { health_report } }`

**GET /api/backup-reports/compliance**
- Response: `{ success, data: { compliance_report } }`

**POST /api/backup-reports/generate**
- Body: `{ report_type, format: 'pdf'|'json', period?, include_charts? }`
- Response: File download

### 4.5 Lógica de Negocio Crítica

#### 4.5.1 Servicio Principal de Backup

```typescript
// server/src/services/backup/backup.service.ts
import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import crypto from 'crypto';
import { app } from 'electron';
import logger from '../../utils/logger';
import { backupManifestService } from './backupManifest.service';
import { backupVerificationService } from './backupVerification.service';
import { Backup } from '../../models/Backup';
import { BackupLog } from '../../models/BackupLog';

interface BackupOptions {
  type: 'daily' | 'weekly' | 'monthly' | 'manual' | 'auto';
  description?: string;
  tags?: string[];
  includeLogs?: boolean;
  notify?: boolean;
  createdBy?: number;
}

class BackupService {
  private backupDir: string;
  private uploadsDir: string;
  private dbPath: string;
  private isBackupInProgress: boolean = false;
  private currentBackupId: number | null = null;

  constructor() {
    const userData = app.getPath('userData');
    this.backupDir = path.join(userData, 'backups');
    this.uploadsDir = path.join(userData, 'uploads');
    this.dbPath = path.join(userData, 'dba-manager.db');
    
    fs.ensureDirSync(this.backupDir);
  }

  /**
   * Crear backup completo
   */
  async createBackup(options: BackupOptions): Promise<number> {
    if (this.isBackupInProgress) {
      throw new Error('Ya hay un backup en progreso');
    }

    this.isBackupInProgress = true;
    const startTime = Date.now();
    let backupId: number | null = null;

    try {
      // 1. Validaciones previas
      await this.validatePreConditions();

      // 2. Generar nombre y paths
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const backupName = `backup-${options.type}-${timestamp}`;
      const backupPath = path.join(this.backupDir, `${backupName}.zip`);

      logger.info(`Starting backup: ${backupName}`);

      // 3. Crear registro en BD
      backupId = await this.createBackupRecord(backupName, options);
      this.currentBackupId = backupId;

      // 4. Emitir evento de inicio
      this.emitBackupProgress(backupId, 'started', 0);

      // 5. Compactar BD si es necesario (SQLite)
      if (process.env.DB_TYPE === 'sqlite') {
        await this.compactDatabase();
        this.emitBackupProgress(backupId, 'compacting', 10);
      }

      // 6. Crear archivos temporales
      const tempDir = path.join(this.backupDir, `temp-${backupName}`);
      await fs.ensureDir(tempDir);

      // 7. Copiar/Dump base de datos
      const dbBackupPath = await this.backupDatabase(tempDir);
      this.emitBackupProgress(backupId, 'database_backed_up', 30);

      // 8. Calcular tamaños y estadísticas
      const dbStats = await this.calculateDatabaseStats(dbBackupPath);
      const uploadsStats = await this.calculateUploadsStats();

      // 9. Crear manifest
      const manifest = await backupManifestService.createManifest({
        backupName,
        backupType: options.type,
        description: options.description,
        tags: options.tags,
        databaseStats: dbStats,
        uploadsStats,
        createdBy: options.createdBy
      });

      await fs.writeJson(path.join(tempDir, 'backup-manifest.json'), manifest, { spaces: 2 });
      this.emitBackupProgress(backupId, 'manifest_created', 40);

      // 10. Copiar archivos de uploads
      if (await fs.pathExists(this.uploadsDir)) {
        await fs.copy(this.uploadsDir, path.join(tempDir, 'uploads'));
      }
      this.emitBackupProgress(backupId, 'files_copied', 60);

      // 11. Incluir logs si está configurado
      if (options.includeLogs) {
        await this.includeLogsInBackup(tempDir);
      }

      // 12. Comprimir todo en ZIP
      const compressedSize = await this.compressBackup(tempDir, backupPath);
      this.emitBackupProgress(backupId, 'compressed', 80);

      // 13. Calcular checksums
      const checksum = await this.calculateChecksum(backupPath);

      // 14. Actualizar registro en BD
      await this.updateBackupRecord(backupId, {
        file_path: backupPath,
        file_size_bytes: compressedSize,
        database_size_bytes: dbStats.sizeBytes,
        uploads_size_bytes: uploadsStats.totalSizeBytes,
        uploads_count: uploadsStats.filesCount,
        tables_count: dbStats.tablesCount,
        total_rows: dbStats.totalRows,
        compression_ratio: this.calculateCompressionRatio(
          dbStats.sizeBytes + uploadsStats.totalSizeBytes,
          compressedSize
        ),
        checksum_sha256: checksum,
        manifest_json: manifest,
        status: 'completed'
      });

      this.emitBackupProgress(backupId, 'completed', 100);

      // 15. Limpiar archivos temporales
      await fs.remove(tempDir);

      // 16. Verificar integridad
      if (await this.getConfig('auto_verify')) {
        await backupVerificationService.verifyBackup(backupId, 'automatic');
      }

      // 17. Log de éxito
      const duration = Math.floor((Date.now() - startTime) / 1000);
      await this.logBackupEvent(backupId, 'backup_completed', {
        duration_seconds: duration,
        size_bytes: compressedSize
      }, 'success', options.createdBy);

      logger.info(`Backup completed: ${backupName} (${duration}s)`);

      // 18. Notificar si está configurado
      if (options.notify || await this.getConfig('notify_on_success')) {
        await this.notifyBackupSuccess(backupName, compressedSize, duration);
      }

      return backupId;

    } catch (error) {
      logger.error('Backup failed:', error);

      if (backupId) {
        await this.updateBackupRecord(backupId, { status: 'failed' });
        await this.logBackupEvent(backupId, 'backup_failed', {
          error_message: error.message,
          stack_trace: error.stack
        }, 'failure', options.createdBy);
      }

      this.emitBackupProgress(backupId || 0, 'failed', 0);

      if (await this.getConfig('notify_on_failure')) {
        await this.notifyBackupFailure(error.message);
      }

      throw error;

    } finally {
      this.isBackupInProgress = false;
      this.currentBackupId = null;
    }
  }

  /**
   * Validar condiciones previas
   */
  private async validatePreConditions(): Promise<void> {
    // Verificar espacio en disco
    const requiredSpace = await this.estimateBackupSize() * 2; // 2x para seguridad
    const availableSpace = await this.getAvailableSpace();

    if (availableSpace < requiredSpace) {
      throw new Error(`Espacio insuficiente. Requerido: ${this.formatBytes(requiredSpace)}, Disponible: ${this.formatBytes(availableSpace)}`);
    }

    // Verificar que BD esté accesible
    if (!await fs.pathExists(this.dbPath)) {
      throw new Error('Base de datos no encontrada');
    }

    // Verificar que no haya otro backup en curso
    if (this.isBackupInProgress) {
      throw new Error('Ya hay un backup en progreso');
    }
  }

  /**
   * Backup de base de datos
   */
  private async backupDatabase(targetDir: string): Promise<string> {
    const dbType = process.env.DB_TYPE || 'sqlite';

    if (dbType === 'sqlite') {
      // SQLite: Copiar archivo directamente
      const targetPath = path.join(targetDir, 'database.db');
      await fs.copy(this.dbPath, targetPath);
      return targetPath;

    } else if (dbType === 'mysql') {
      // MySQL: Dump SQL
      const mysqldump = require('mysqldump');
      const targetPath = path.join(targetDir, 'database.sql');

      await mysqldump({
        connection: {
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
        },
        dumpToFile: targetPath,
        dump: {
          schema: {
            table: {
              dropIfExist: true,
              charset: true,
            },
          },
          data: {
            maxRowsPerInsertStatement: 1000,
          },
        },
      });

      return targetPath;
    }

    throw new Error(`Database type not supported: ${dbType}`);
  }

  /**
   * Comprimir backup en ZIP
   */
  private async compressBackup(sourceDir: string, targetPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(targetPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Máxima compresión
      });

      let totalSize = 0;

      output.on('close', () => {
        totalSize = archive.pointer();
        resolve(totalSize);
      });

      archive.on('error', reject);
      archive.on('progress', (progress) => {
        const percentage = Math.floor((progress.fs.processedBytes / progress.fs.totalBytes) * 100);
        this.emitBackupProgress(this.currentBackupId!, 'compressing', 60 + (percentage * 0.2));
      });

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  /**
   * Calcular checksum SHA-256
   */
  private async calculateChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Calcular estadísticas de la base de datos
   */
  private async calculateDatabaseStats(dbPath: string): Promise<any> {
    const stats = await fs.stat(dbPath);
    
    // Obtener conteo de tablas y filas desde la BD
    const db = require('better-sqlite3')(this.dbPath);
    
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();

    let totalRows = 0;
    const tableStats = [];

    for (const table of tables) {
      const result = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      totalRows += result.count;
      tableStats.push({
        table: table.name,
        rows: result.count
      });
    }

    db.close();

    return {
      sizeBytes: stats.size,
      tablesCount: tables.length,
      totalRows,
      tableStats
    };
  }

  /**
   * Calcular estadísticas de uploads
   */
  private async calculateUploadsStats(): Promise<any> {
    if (!await fs.pathExists(this.uploadsDir)) {
      return { filesCount: 0, totalSizeBytes: 0 };
    }

    const files = await this.getAllFiles(this.uploadsDir);
    let totalSize = 0;

    for (const file of files) {
      const stats = await fs.stat(file);
      totalSize += stats.size;
    }

    return {
      filesCount: files.length,
      totalSizeBytes: totalSize
    };
  }

  /**
   * Obtener todos los archivos recursivamente
   */
  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const items = await fs.readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        files.push(...await this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Compactar base de datos SQLite
   */
  private async compactDatabase(): Promise<void> {
    const db = require('better-sqlite3')(this.dbPath);
    db.prepare('VACUUM').run();
    db.close();
    logger.info('Database compacted');
  }

  /**
   * Calcular ratio de compresión
   */
  private calculateCompressionRatio(originalSize: number, compressedSize: number): number {
    return parseFloat((compressedSize / originalSize).toFixed(2));
  }

  /**
   * Estimar tamaño del backup
   */
  private async estimateBackupSize(): Promise<number> {
    const dbStats = await fs.stat(this.dbPath);
    let uploadsSize = 0;

    if (await fs.pathExists(this.uploadsDir)) {
      const files = await this.getAllFiles(this.uploadsDir);
      for (const file of files) {
        const stats = await fs.stat(file);
        uploadsSize += stats.size;
      }
    }

    // Estimar con ratio de compresión promedio de 0.7
    return (dbStats.size + uploadsSize) * 0.7;
  }

  /**
   * Obtener espacio disponible en disco
   */
  private async getAvailableSpace(): Promise<number> {
    const checkDiskSpace = require('check-disk-space').default;
    const diskSpace = await checkDiskSpace(this.backupDir);
    return diskSpace.free;
  }

  /**
   * Crear registro de backup en BD
   */
  private async createBackupRecord(name: string, options: BackupOptions): Promise<number> {
    const backup = await Backup.create({
      backup_name: name,
      backup_type: options.type,
      status: 'creating',
      app_version: app.getVersion(),
      database_type: process.env.DB_TYPE || 'sqlite',
      description: options.description,
      tags: options.tags ? JSON.stringify(options.tags) : null,
      created_by: options.createdBy || null
    });

    return backup.id;
  }

  /**
   * Actualizar registro de backup
   */
  private async updateBackupRecord(backupId: number, data: any): Promise<void> {
    await Backup.update(data, { where: { id: backupId } });
  }

  /**
   * Registrar evento en log
   */
  private async logBackupEvent(
    backupId: number | null,
    eventType: string,
    details: any,
    result: 'success' | 'failure' | 'warning',
    userId?: number
  ): Promise<void> {
    await BackupLog.create({
      backup_id: backupId,
      event_type: eventType,
      user_id: userId || null,
      details: JSON.stringify(details),
      result,
      duration_seconds: details.duration_seconds || null
    });
  }

  /**
   * Emitir progreso de backup (para frontend)
   */
  private emitBackupProgress(backupId: number, step: string, percentage: number): void {
    // Enviar a través de IPC a frontend
    if (typeof window !== 'undefined' && window.electron) {
      window.electron.send('backup-progress', {
        backupId,
        step,
        percentage
      });
    }
  }

  /**
   * Notificar éxito de backup
   */
  private async notifyBackupSuccess(name: string, size: number, duration: number): Promise<void> {
    const notification = {
      title: '✅ Backup completado',
      body: `${name} (${this.formatBytes(size)}) creado en ${duration}s`,
      urgency: 'normal'
    };

    if (typeof window !== 'undefined' && window.electron) {
      window.electron.send('show-notification', notification);
    }
  }

  /**
   * Notificar fallo de backup
   */
  private async notifyBackupFailure(errorMessage: string): Promise<void> {
    const notification = {
      title: '❌ Backup falló',
      body: errorMessage,
      urgency: 'critical'
    };

    if (typeof window !== 'undefined' && window.electron) {
      window.electron.send('show-notification', notification);
    }
  }

  /**
   * Formatear bytes a string legible
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Obtener configuración
   */
  private async getConfig(key: string): Promise<any> {
    // Implementar lógica para obtener configuración
    return true; // Placeholder
  }

  /**
   * Incluir logs en backup
   */
  private async includeLogsInBackup(targetDir: string): Promise<void> {
    const logsDir = path.join(app.getPath('userData'), 'logs');
    if (await fs.pathExists(logsDir)) {
      await fs.copy(logsDir, path.join(targetDir, 'logs'));
    }
  }
}

export const backupService = new BackupService();
```

#### 4.5.2 Servicio de Restauración

```typescript
// server/src/services/restore/restore.service.ts
import fs from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import { app } from 'electron';
import logger from '../../utils/logger';
import { Backup } from '../../models/Backup';
import { RestoreOperation } from '../../models/RestoreOperation';
import { backupService } from '../backup/backup.service';

interface RestoreOptions {
  backupId: number;
  restoreType: 'full' | 'selective' | 'database_only' | 'files_only';
  selectiveOptions?: {
    tables?: string[];
    filePatterns?: string[];
    preserveConfig?: boolean;
  };
  createRollback?: boolean;
  dryRun?: boolean;
  performedBy: number;
}

class RestoreService {
  private restoreInProgress: boolean = false;
  private currentOperationId: number | null = null;
  private dbPath: string;
  private uploadsDir: string;

  constructor() {
    const userData = app.getPath('userData');
    this.dbPath = path.join(userData, 'dba-manager.db');
    this.uploadsDir = path.join(userData, 'uploads');
  }

  /**
   * Restaurar desde backup
   */
  async restoreFromBackup(options: RestoreOptions): Promise<number> {
    if (this.restoreInProgress) {
      throw new Error('Ya hay una restauración en progreso');
    }

    this.restoreInProgress = true;
    const startTime = Date.now();
    let operationId: number | null = null;
    let rollbackBackupId: number | null = null;

    try {
      // 1. Validar backup
      await this.validateBackup(options.backupId);
      this.emitRestoreProgress('validating', 5);

      // 2. Crear registro de operación
      operationId = await this.createRestoreOperation(options);
      this.currentOperationId = operationId;

      // 3. Crear backup de rollback si está habilitado
      if (options.createRollback !== false) {
        logger.info('Creating rollback backup...');
        rollbackBackupId = await backupService.createBackup({
          type: 'auto',
          description: `Rollback point before restore operation #${operationId}`,
          notify: false
        });
        
        await this.updateOperation(operationId, { rollback_backup_id: rollbackBackupId });
        this.emitRestoreProgress('rollback_created', 15);
      }

      // 4. Extraer backup
      const backup = await Backup.findByPk(options.backupId);
      const extractPath = await this.extractBackup(backup.file_path);
      this.emitRestoreProgress('extracted', 30);

      // 5. Validar integridad del backup extraído
      await this.validateExtractedBackup(extractPath);
      this.emitRestoreProgress('validated', 35);

      if (options.dryRun) {
        logger.info('Dry run completed successfully');
        await this.updateOperation(operationId, { 
          status: 'completed',
          completed_at: new Date()
        });
        await fs.remove(extractPath);
        return operationId;
      }

      // 6. Detener servicios
      await this.stopServices();
      this.emitRestoreProgress('services_stopped', 40);

      // 7. Restaurar según tipo
      let stats: any = {};

      if (options.restoreType === 'full' || options.restoreType === 'database_only') {
        stats = await this.restoreDatabase(extractPath, options);
        this.emitRestoreProgress('database_restored', 70);
      }

      if (options.restoreType === 'full' || options.restoreType === 'files_only') {
        const fileStats = await this.restoreFiles(extractPath, options);
        stats = { ...stats, ...fileStats };
        this.emitRestoreProgress('files_restored', 85);
      }

      // 8. Reiniciar servicios
      await this.startServices();
      this.emitRestoreProgress('services_started', 90);

      // 9. Verificar integridad post-restauración
      await this.verifyRestoredData();
      this.emitRestoreProgress('verified', 95);

      // 10. Actualizar operación
      const duration = Math.floor((Date.now() - startTime) / 1000);
      await this.updateOperation(operationId, {
        status: 'completed',
        completed_at: new Date(),
        duration_seconds: duration,
        ...stats
      });

      // 11. Limpiar archivos temporales
      await fs.remove(extractPath);
      this.emitRestoreProgress('completed', 100);

      logger.info(`Restore completed in ${duration}s`);

      // 12. Notificar éxito
      await this.notifyRestoreSuccess(backup.backup_name);

      return operationId;

    } catch (error) {
      logger.error('Restore failed:', error);

      if (operationId) {
        await this.updateOperation(operationId, {
          status: 'failed',
          error_message: error.message
        });
      }

      this.emitRestoreProgress('failed', 0);

      // Intentar rollback automático si está disponible
      if (rollbackBackupId && options.createRollback !== false) {
        logger.warn('Attempting automatic rollback...');
        try {
          await this.performRollback(operationId!);
        } catch (rollbackError) {
          logger.error('Rollback failed:', rollbackError);
        }
      }

      await this.notifyRestoreFailure(error.message);
      throw error;

    } finally {
      this.restoreInProgress = false;
      this.currentOperationId = null;
      await this.startServices(); // Asegurar que servicios estén corriendo
    }
  }

  /**
   * Validar backup antes de restaurar
   */
  private async validateBackup(backupId: number): Promise<void> {
    const backup = await Backup.findByPk(backupId);

    if (!backup) {
      throw new Error('Backup no encontrado');
    }

    if (backup.status === 'corrupted') {
      throw new Error('Backup está corrupto. No se puede restaurar.');
    }

    if (!await fs.pathExists(backup.file_path)) {
      throw new Error('Archivo de backup no existe en el disco');
    }

    // Verificar checksum
    const currentChecksum = await this.calculateChecksum(backup.file_path);
    if (currentChecksum !== backup.checksum_sha256) {
      throw new Error('Checksum no coincide. El archivo puede estar corrupto.');
    }

    // Verificar compatibilidad de versión
    const manifest = backup.manifest_json;
    const currentVersion = app.getVersion();
    
    if (this.isVersionIncompatible(manifest.app_version, currentVersion)) {
      throw new Error(`Backup de versión ${manifest.app_version} no es compatible con versión actual ${currentVersion}`);
    }
  }

  /**
   * Extraer contenido del backup
   */
  private async extractBackup(backupPath: string): Promise<string> {
    const extractPath = path.join(
      path.dirname(backupPath),
      `temp-restore-${Date.now()}`
    );

    await fs.ensureDir(extractPath);

    const zip = new AdmZip(backupPath);
    zip.extractAllTo(extractPath, true);

    logger.info(`Backup extracted to: ${extractPath}`);
    return extractPath;
  }

  /**
   * Validar backup extraído
   */
  private async validateExtractedBackup(extractPath: string): Promise<void> {
    // Verificar manifest
    const manifestPath = path.join(extractPath, 'backup-manifest.json');
    if (!await fs.pathExists(manifestPath)) {
      throw new Error('Manifest no encontrado en backup');
    }

    const manifest = await fs.readJson(manifestPath);

    // Verificar estructura esperada
    const dbType = process.env.DB_TYPE || 'sqlite';
    const expectedDbFile = dbType === 'sqlite' ? 'database.db' : 'database.sql';
    const dbPath = path.join(extractPath, expectedDbFile);

    if (!await fs.pathExists(dbPath)) {
      throw new Error(`Archivo de base de datos no encontrado: ${expectedDbFile}`);
    }

    logger.info('Extracted backup validated successfully');
  }

  /**
   * Restaurar base de datos
   */
  private async restoreDatabase(extractPath: string, options: RestoreOptions): Promise<any> {
    const dbType = process.env.DB_TYPE || 'sqlite';
    let stats: any = {};

    if (dbType === 'sqlite') {
      // SQLite: Reemplazar archivo
      const sourcePath = path.join(extractPath, 'database.db');
      
      // Backup del actual antes de sobrescribir
      if (await fs.pathExists(this.dbPath)) {
        await fs.copy(this.dbPath, `${this.dbPath}.pre-restore`);
      }

      await fs.copy(sourcePath, this.dbPath, { overwrite: true });
      
      // Contar tablas y filas
      const db = require('better-sqlite3')(this.dbPath);
      const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).all();
      
      let totalRows = 0;
      for (const table of tables) {
        const result = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
        totalRows += result.count;
      }
      db.close();

      stats = {
        tables_restored: tables.length,
        rows_restored: totalRows
      };

    } else if (dbType === 'mysql') {
      // MySQL: Importar SQL dump
      const sourcePath = path.join(extractPath, 'database.sql');
      stats = await this.importMySQLDump(sourcePath, options);
    }

    logger.info('Database restored successfully');
    return stats;
  }

  /**
   * Restaurar archivos
   */
  private async restoreFiles(extractPath: string, options: RestoreOptions): Promise<any> {
    const uploadsSource = path.join(extractPath, 'uploads');
    
    if (!await fs.pathExists(uploadsSource)) {
      logger.warn('No uploads directory in backup');
      return { files_restored: 0 };
    }

    // Backup de uploads actuales
    if (await fs.pathExists(this.uploadsDir)) {
      await fs.copy(this.uploadsDir, `${this.uploadsDir}.pre-restore`);
    }

    // Aplicar filtros si es restauración selectiva
    if (options.restoreType === 'selective' && options.selectiveOptions?.filePatterns) {
      await this.restoreSelectiveFiles(uploadsSource, options.selectiveOptions.filePatterns);
    } else {
      await fs.copy(uploadsSource, this.uploadsDir, { overwrite: true });
    }

    const files = await this.countFiles(this.uploadsDir);

    logger.info(`${files} files restored`);
    return { files_restored: files };
  }

  /**
   * Restaurar archivos selectivos
   */
  private async restoreSelectiveFiles(source: string, patterns: string[]): Promise<void> {
    const glob = require('glob');
    
    for (const pattern of patterns) {
      const files = glob.sync(pattern, { cwd: source });
      
      for (const file of files) {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(this.uploadsDir, file);
        
        await fs.ensureDir(path.dirname(targetPath));
        await fs.copy(sourcePath, targetPath, { overwrite: true });
      }
    }
  }

  /**
   * Importar dump MySQL
   */
  private async importMySQLDump(sqlFile: string, options: RestoreOptions): Promise<any> {
    const mysql = require('mysql2/promise');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
    });

    const sql = await fs.readFile(sqlFile, 'utf8');
    
    // Si es selectivo, filtrar solo tablas específicas
    let sqlToExecute = sql;
    if (options.restoreType === 'selective' && options.selectiveOptions?.tables) {
      sqlToExecute = this.filterSQLByTables(sql, options.selectiveOptions.tables);
    }

    await connection.query(sqlToExecute);
    
    // Contar registros restaurados
    const [rows] = await connection.query(`
      SELECT SUM(table_rows) as total
      FROM information_schema.tables
      WHERE table_schema = ?
    `, [process.env.DB_NAME]);

    await connection.end();

    return {
      tables_restored: options.selectiveOptions?.tables?.length || 'all',
      rows_restored: rows[0].total
    };
  }

  /**
   * Filtrar SQL por tablas específicas
   */
  private filterSQLByTables(sql: string, tables: string[]): string {
    // Implementación simple - en producción usar parser SQL robusto
    const lines = sql.split('\n');
    const filtered: string[] = [];
    let inTargetTable = false;

    for (const line of lines) {
      for (const table of tables) {
        if (line.includes(`CREATE TABLE \`${table}\``)) {
          inTargetTable = true;
        }
        if (line.includes(`INSERT INTO \`${table}\``)) {
          inTargetTable = true;
        }
      }

      if (inTargetTable) {
        filtered.push(line);
      }

      if (line.trim() === '') {
        inTargetTable = false;
      }
    }

    return filtered.join('\n');
  }

  /**
   * Realizar rollback
   */
  async performRollback(operationId: number): Promise<void> {
    const operation = await RestoreOperation.findByPk(operationId);
    
    if (!operation || !operation.rollback_backup_id) {
      throw new Error('No hay backup de rollback disponible');
    }

    logger.info(`Performing rollback using backup ${operation.rollback_backup_id}`);

    // Restaurar desde el backup de rollback
    await this.restoreFromBackup({
      backupId: operation.rollback_backup_id,
      restoreType: 'full',
      createRollback: false, // No crear otro rollback
      dryRun: false,
      performedBy: operation.performed_by
    });

    await this.updateOperation(operationId, {
      status: 'rolled_back',
      rollback_performed: true
    });

    logger.info('Rollback completed successfully');
  }

  /**
   * Detener servicios
   */
  private async stopServices(): Promise<void> {
    // Cerrar conexiones a BD
    // Detener workers
    // Pausar cron jobs
    logger.info('Services stopped');
  }

  /**
   * Iniciar servicios
   */
  private async startServices(): Promise<void> {
    // Reiniciar conexiones a BD
    // Reiniciar workers
    // Reanudar cron jobs
    logger.info('Services started');
  }

  /**
   * Verificar datos restaurados
   */
  private async verifyRestoredData(): Promise<void> {
    const dbType = process.env.DB_TYPE || 'sqlite';

    if (dbType === 'sqlite') {
      const db = require('better-sqlite3')(this.dbPath);
      
      // Verificar integridad
      const result = db.prepare('PRAGMA integrity_check').get();
      
      if (result.integrity_check !== 'ok') {
        throw new Error('Database integrity check failed');
      }
      
      db.close();
    }

    logger.info('Restored data verified successfully');
  }

  /**
   * Crear registro de operación
   */
  private async createRestoreOperation(options: RestoreOptions): Promise<number> {
    const operation = await RestoreOperation.create({
      backup_id: options.backupId,
      restore_type: options.restoreType,
      status: 'in_progress',
      selective_options: options.selectiveOptions ? 
        JSON.stringify(options.selectiveOptions) : null,
      performed_by: options.performedBy
    });

    return operation.id;
  }

  /**
   * Actualizar operación
   */
  private async updateOperation(operationId: number, data: any): Promise<void> {
    await RestoreOperation.update(data, { where: { id: operationId } });
  }

  /**
   * Contar archivos en directorio
   */
  private async countFiles(dir: string): Promise<number> {
    if (!await fs.pathExists(dir)) return 0;

    let count = 0;
    const items = await fs.readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        count += await this.countFiles(fullPath);
      } else {
        count++;
      }
    }

    return count;
  }

  /**
   * Calcular checksum
   */
  private async calculateChecksum(filePath: string): Promise<string> {
    const crypto = require('crypto');
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Verificar incompatibilidad de versión
   */
  private isVersionIncompatible(backupVersion: string, currentVersion: string): boolean {
    const bMajor = parseInt(backupVersion.split('.')[0]);
    const cMajor = parseInt(currentVersion.split('.')[0]);

    // Solo incompatible si major version es diferente
    return bMajor !== cMajor;
  }

  /**
   * Emitir progreso
   */
  private emitRestoreProgress(step: string, percentage: number): void {
    if (typeof window !== 'undefined' && window.electron) {
      window.electron.send('restore-progress', {
        operationId: this.currentOperationId,
        step,
        percentage
      });
    }
  }

  /**
   * Notificar éxito
   */
  private async notifyRestoreSuccess(backupName: string): Promise<void> {
    if (typeof window !== 'undefined' && window.electron) {
      window.electron.send('show-notification', {
        title: '✅ Restauración completada',
        body: `Sistema restaurado desde ${backupName}`,
        urgency: 'normal'
      });
    }
  }

  /**
   * Notificar fallo
   */
  private async notifyRestoreFailure(error: string): Promise<void> {
    if (typeof window !== 'undefined' && window.electron) {
      window.electron.send('show-notification', {
        title: '❌ Restauración falló',
        body: error,
        urgency: 'critical'
      });
    }
  }
}

export const restoreService = new RestoreService();
```

#### 4.5.3 Servicio de Cloud Backup - Google Drive

```typescript
// server/src/services/cloud/googleDrive.service.ts
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import logger from '../../utils/logger';
import { CloudSyncStatus } from '../../models/CloudSyncStatus';

class GoogleDriveService {
  private drive: any = null;
  private auth: any = null;
  private folderId: string | null = null;
  private isAuthenticated: boolean = false;

  /**
   * Autenticar con Google Drive
   */
  async authenticate(credentials: any): Promise<void> {
    try {
      this.auth = new google.auth.OAuth2(
        credentials.client_id,
        credentials.client_secret,
        credentials.redirect_uri
      );

      this.auth.setCredentials({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token
      });

      this.drive = google.drive({ version: 'v3', auth: this.auth });
      
      // Crear/obtener carpeta de backups
      this.folderId = await this.ensureBackupFolder();
      
      this.isAuthenticated = true;
      logger.info('Google Drive authenticated successfully');

    } catch (error) {
      logger.error('Google Drive authentication failed:', error);
      throw error;
    }
  }

  /**
   * Asegurar que existe carpeta de backups
   */
  private async ensureBackupFolder(): Promise<string> {
    const folderName = 'DBA Incident Manager Backups';

    // Buscar carpeta existente
    const response = await this.drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Crear carpeta
    const folder = await this.drive.files.create({
      resource: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id'
    });

    logger.info(`Google Drive folder created: ${folder.data.id}`);
    return folder.data.id;
  }

  /**
   * Subir backup a Google Drive
   */
  async uploadBackup(backupId: number, backupPath: string): Promise<string> {
    if (!this.isAuthenticated) {
      throw new Error('Google Drive no está autenticado');
    }

    const fileName = path.basename(backupPath);
    const fileSize = fs.statSync(backupPath).size;

    // Crear registro de sync
    const syncRecord = await CloudSyncStatus.create({
      backup_id: backupId,
      cloud_provider: 'google_drive',
      status: 'uploading',
      total_bytes: fileSize,
      sync_started_at: new Date()
    });

    try {
      logger.info(`Uploading ${fileName} to Google Drive...`);

      // Subir archivo
      const response = await this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: [this.folderId]
        },
        media: {
          mimeType: 'application/zip',
          body: fs.createReadStream(backupPath)
        },
        fields: 'id, name, size, createdTime, md5Checksum'
      }, {
        onUploadProgress: (evt: any) => {
          const progress = Math.round((evt.bytesRead / fileSize) * 100);
          this.updateSyncProgress(syncRecord.id, evt.bytesRead, progress);
        }
      });

      // Actualizar sync record
      await CloudSyncStatus.update({
        cloud_file_id: response.data.id,
        cloud_file_url: `https://drive.google.com/file/d/${response.data.id}`,
        cloud_file_size: parseInt(response.data.size),
        cloud_checksum: response.data.md5Checksum,
        bytes_uploaded: fileSize,
        progress_percentage: 100,
        status: 'completed',
        sync_completed_at: new Date()
      }, {
        where: { id: syncRecord.id }
      });

      logger.info(`Upload completed: ${response.data.name} (${response.data.size} bytes)`);
      return response.data.id;

    } catch (error) {
      logger.error('Upload failed:', error);

      await CloudSyncStatus.update({
        status: 'failed',
        error_message: error.message,
        retry_count: syncRecord.retry_count + 1
      }, {
        where: { id: syncRecord.id }
      });

      throw error;
    }
  }

  /**
   * Descargar backup desde Google Drive
   */
  async downloadBackup(cloudFileId: string, destinationPath: string): Promise<void> {
    if (!this.isAuthenticated) {
      throw new Error('Google Drive no está autenticado');
    }

    try {
      logger.info(`Downloading file ${cloudFileId}...`);

      const dest = fs.createWriteStream(destinationPath);

      const response = await this.drive.files.get(
        { fileId: cloudFileId, alt: 'media' },
        { responseType: 'stream' }
      );

      return new Promise((resolve, reject) => {
        response.data
          .on('end', () => {
            logger.info('Download completed');
            resolve();
          })
          .on('error', (err: any) => {
            logger.error('Download failed:', err);
            reject(err);
          })
          .pipe(dest);
      });

    } catch (error) {
      logger.error('Download failed:', error);
      throw error;
    }
  }

  /**
   * Listar backups en Google Drive
   */
  async listBackups(): Promise<any[]> {
    if (!this.isAuthenticated) {
      throw new Error('Google Drive no está autenticado');
    }

    const response = await this.drive.files.list({
      q: `'${this.folderId}' in parents and trashed=false and mimeType='application/zip'`,
      fields: 'files(id, name, size, createdTime, modifiedTime, md5Checksum)',
      orderBy: 'createdTime desc',
      pageSize: 100
    });

    return response.data.files;
  }

  /**
   * Eliminar backup de Google Drive
   */
  async deleteBackup(cloudFileId: string): Promise<void> {
    if (!this.isAuthenticated) {
      throw new Error('Google Drive no está autenticado');
    }

    await this.drive.files.delete({ fileId: cloudFileId });
    logger.info(`File ${cloudFileId} deleted from Google Drive`);
  }

  /**
   * Limpiar backups antiguos
   */
  async cleanOldBackups(daysToKeep: number): Promise<number> {
    const backups = await this.listBackups();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let deletedCount = 0;

    for (const backup of backups) {
      const backupDate = new Date(backup.createdTime);
      
      if (backupDate < cutoffDate) {
        await this.deleteBackup(backup.id);
        deletedCount++;
      }
    }

    logger.info(`Cleaned ${deletedCount} old backups from Google Drive`);
    return deletedCount;
  }

  /**
   * Obtener información de espacio
   */
  async getStorageInfo(): Promise<any> {
    if (!this.isAuthenticated) {
      throw new Error('Google Drive no está autenticado');
    }

    const response = await this.drive.about.get({
      fields: 'storageQuota'
    });

    const quota = response.data.storageQuota;

    return {
      total: parseInt(quota.limit),
      used: parseInt(quota.usage),
      available: parseInt(quota.limit) - parseInt(quota.usage),
      usedByBackups: await this.calculateBackupsSize()
    };
  }

  /**
   * Calcular tamaño total de backups
   */
  private async calculateBackupsSize(): Promise<number> {
    const backups = await this.listBackups();
    return backups.reduce((total, backup) => total + parseInt(backup.size || '0'), 0);
  }

  /**
   * Actualizar progreso de sync
   */
  private async updateSyncProgress(syncId: number, bytesUploaded: number, percentage: number): Promise<void> {
    await CloudSyncStatus.update({
      bytes_uploaded: bytesUploaded,
      progress_percentage: percentage
    }, {
      where: { id: syncId }
    });
  }

  /**
   * Verificar autenticación
   */
  isAuthenticatedCheck(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Desconectar
   */
  disconnect(): void {
    this.auth = null;
    this.drive = null;
    this.folderId = null;
    this.isAuthenticated = false;
    logger.info('Google Drive disconnected');
  }
}

export const googleDriveService = new GoogleDriveService();
```

#### 4.5.4 Scheduler de Backups Automáticos

```typescript
// server/src/services/backup/backupScheduler.service.ts
import cron from 'node-cron';
import logger from '../../utils/logger';
import { backupService } from './backup.service';
import { backupRetentionService } from './backupRetention.service';
import { BackupConfig } from '../../models/BackupConfig';

class BackupSchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private isInitialized: boolean = false;

  /**
   * Inicializar scheduler
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Backup scheduler already initialized');
      return;
    }

    try {
      logger.info('Initializing backup scheduler...');

      // Cargar configuración
      const config = await this.loadConfig();

      // Programar backups automáticos
      if (config.backup_enabled) {
        await this.scheduleDailyBackup(config);
        await this.scheduleWeeklyBackup(config);
        await this.scheduleMonthlyBackup(config);
      }

      // Programar limpieza de backups antiguos
      await this.scheduleRetentionCleanup();

      // Programar verificación semanal
      if (config.weekly_verification) {
        await this.scheduleWeeklyVerification();
      }

      this.isInitialized = true;
      logger.info('Backup scheduler initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize backup scheduler:', error);
      throw error;
    }
  }

  /**
   * Programar backup diario
   */
  private async scheduleDailyBackup(config: any): Promise<void> {
    if (!config.daily_enabled) return;

    const time = config.daily_time || '02:00:00';
    const [hours, minutes] = time.split(':');
    const cronExpression = `${minutes} ${hours} * * *`;

    const job = cron.schedule(cronExpression, async () => {
      logger.info('Running scheduled daily backup...');
      
      try {
        await backupService.createBackup({
          type: 'daily',
          notify: true
        });
      } catch (error) {
        logger.error('Scheduled daily backup failed:', error);
      }
    }, {
      scheduled: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    this.jobs.set('daily', job);
    logger.info(`Daily backup scheduled: ${cronExpression}`);
  }

  /**
   * Programar backup semanal
   */
  private async scheduleWeeklyBackup(config: any): Promise<void> {
    if (!config.weekly_enabled) return;

    const time = config.weekly_time || '03:00:00';
    const day = config.weekly_day || 0; // 0 = Sunday
    const [hours, minutes] = time.split(':');
    const cronExpression = `${minutes} ${hours} * * ${day}`;

    const job = cron.schedule(cronExpression, async () => {
      logger.info('Running scheduled weekly backup...');
      
      try {
        await backupService.createBackup({
          type: 'weekly',
          notify: true
        });
      } catch (error) {
        logger.error('Scheduled weekly backup failed:', error);
      }
    }, {
      scheduled: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    this.jobs.set('weekly', job);
    logger.info(`Weekly backup scheduled: ${cronExpression}`);
  }

  /**
   * Programar backup mensual
   */
  private async scheduleMonthlyBackup(config: any): Promise<void> {
    if (!config.monthly_enabled) return;

    const time = config.monthly_time || '04:00:00';
    const day = config.monthly_day || 1;
    const [hours, minutes] = time.split(':');
    const cronExpression = `${minutes} ${hours} ${day} * *`;

    const job = cron.schedule(cronExpression, async () => {
      logger.info('Running scheduled monthly backup...');
      
      try {
        await backupService.createBackup({
          type: 'monthly',
          notify: true
        });
      } catch (error) {
        logger.error('Scheduled monthly backup failed:', error);
      }
    }, {
      scheduled: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    this.jobs.set('monthly', job);
    logger.info(`Monthly backup scheduled: ${cronExpression}`);
  }

  /**
   * Programar limpieza de backups antiguos
   */
  private async scheduleRetentionCleanup(): Promise<void> {
    // Ejecutar diariamente a las 5:00 AM
    const job = cron.schedule('0 5 * * *', async () => {
      logger.info('Running retention cleanup...');
      
      try {
        await backupRetentionService.cleanOldBackups();
      } catch (error) {
        logger.error('Retention cleanup failed:', error);
      }
    }, {
      scheduled: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    this.jobs.set('retention', job);
    logger.info('Retention cleanup scheduled: Daily at 05:00');
  }

  /**
   * Programar verificación semanal
   */
  private async scheduleWeeklyVerification(): Promise<void> {
    // Ejecutar cada domingo a las 6:00 AM
    const job = cron.schedule('0 6 * * 0', async () => {
      logger.info('Running weekly verification...');
      
      try {
        // Implementar lógica de verificación
      } catch (error) {
        logger.error('Weekly verification failed:', error);
      }
    }, {
      scheduled: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    this.jobs.set('verification', job);
    logger.info('Weekly verification scheduled: Sundays at 06:00');
  }

  /**
   * Recargar configuración
   */
  async reloadConfig(): Promise<void> {
    logger.info('Reloading backup scheduler configuration...');
    
    // Detener todos los jobs
    this.stopAll();
    
    // Re-inicializar
    this.isInitialized = false;
    await this.initialize();
  }

  /**
   * Detener job específico
   */
  stopJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      logger.info(`Backup job stopped: ${name}`);
    }
  }

  /**
   * Detener todos los jobs
   */
  stopAll(): void {
    for (const [name, job] of this.jobs) {
      job.stop();
      logger.info(`Backup job stopped: ${name}`);
    }
    this.jobs.clear();
    this.isInitialized = false;
  }

  /**
   * Obtener próximas ejecuciones
   */
  getNextExecutions(): any[] {
    const executions: any[] = [];

    for (const [name, job] of this.jobs) {
      // Calcular próxima ejecución
      // Nota: node-cron no expone esto directamente
      executions.push({
        name,
        nextExecution: 'Calculando...' // Implementar lógica
      });
    }

    return executions;
  }

  /**
   * Cargar configuración
   */
  private async loadConfig(): Promise<any> {
    // Cargar desde BD o usar defaults
    const config = await BackupConfig.findOne({ where: { user_id: 1 } });
    
    return config || {
      backup_enabled: true,
      daily_enabled: true,
      daily_time: '02:00:00',
      weekly_enabled: true,
      weekly_day: 0,
      weekly_time: '03:00:00',
      monthly_enabled: true,
      monthly_day: 1,
      monthly_time: '04:00:00',
      weekly_verification: true
    };
  }
}

export const backupSchedulerService = new BackupSchedulerService();
```

### 4.6 Integración con Electron

#### 4.6.1 Main Process - Handlers IPC

```typescript
// electron/ipc/backup.handlers.ts
import { ipcMain, dialog, Notification } from 'electron';
import { backupService } from '../../server/src/services/backup/backup.service';
import { restoreService } from '../../server/src/services/restore/restore.service';
import { googleDriveService } from '../../server/src/services/cloud/googleDrive.service';

export function setupBackupHandlers() {
  
  // Crear backup
  ipcMain.handle('backup:create', async (event, options) => {
    try {
      const backupId = await backupService.createBackup(options);
      return { success: true, data: { backupId } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Listar backups
  ipcMain.handle('backup:list', async (event, filters) => {
    try {
      const backups = await backupService.listBackups(filters);
      return { success: true, data: backups };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Restaurar backup
  ipcMain.handle('backup:restore', async (event, options) => {
    try {
      // Mostrar confirmación
      const choice = await dialog.showMessageBox({
        type: 'warning',
        title: 'Confirmar Restauración',
        message: '¿Está seguro de que desea restaurar este backup?',
        detail: 'Esto sobrescribirá todos los datos actuales. Se creará un backup de rollback automáticamente.',
        buttons: ['Cancelar', 'Restaurar'],
        defaultId: 0,
        cancelId: 0
      });

      if (choice.response === 0) {
        return { success: false, error: 'Operación cancelada por el usuario' };
      }

      const operationId = await restoreService.restoreFromBackup(options);
      return { success: true, data: { operationId } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Seleccionar ubicación de backup
  ipcMain.handle('backup:select-location', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    });

    if (result.canceled) {
      return { success: false, error: 'Cancelado' };
    }

    return { success: true, data: { path: result.filePaths[0] } };
  });

  // Mostrar backup en explorador de archivos
  ipcMain.handle('backup:show-in-folder', async (event, backupPath) => {
    const { shell } = require('electron');
    shell.showItemInFolder(backupPath);
    return { success: true };
  });

  // Autenticar con Google Drive
  ipcMain.handle('cloud:google-auth', async (event, credentials) => {
    try {
      await googleDriveService.authenticate(credentials);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Sincronizar con cloud
  ipcMain.handle('cloud:sync', async (event, backupId, backupPath) => {
    try {
      const fileId = await googleDriveService.uploadBackup(backupId, backupPath);
      return { success: true, data: { fileId } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Progreso de backup (para enviar al renderer)
  ipcMain.on('backup-progress', (event, data) => {
    event.sender.send('backup-progress-update', data);
  });

  // Progreso de restauración
  ipcMain.on('restore-progress', (event, data) => {
    event.sender.send('restore-progress-update', data);
  });

  // Mostrar notificación del sistema
  ipcMain.on('show-notification', (event, options) => {
    const notification = new Notification({
      title: options.title,
      body: options.body,
      urgency: options.urgency || 'normal'
    });

    notification.show();
  });
}
```

#### 4.6.2 Preload Script

```typescript
// electron/preload.ts (fragmento para backups)
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('backup', {
  create: (options: any) => ipcRenderer.invoke('backup:create', options),
  list: (filters: any) => ipcRenderer.invoke('backup:list', filters),
  restore: (options: any) => ipcRenderer.invoke('backup:restore', options),
  selectLocation: () => ipcRenderer.invoke('backup:select-location'),
  showInFolder: (path: string) => ipcRenderer.invoke('backup:show-in-folder', path),
  
  onProgress: (callback: any) => {
    ipcRenderer.on('backup-progress-update', (event, data) => callback(data));
  },
  
  onRestoreProgress: (callback: any) => {
    ipcRenderer.on('restore-progress-update', (event, data) => callback(data));
  }
});

contextBridge.exposeInMainWorld('cloud', {
  googleAuth: (credentials: any) => ipcRenderer.invoke('cloud:google-auth', credentials),
  sync: (backupId: number, path: string) => ipcRenderer.invoke('cloud:sync', backupId, path)
});
```

---

## 5. PLAN DE IMPLEMENTACIÓN

### 5.1 Fase 1: Infraestructura Base (Semana 1)

**Objetivos:**
- Configurar estructura de proyecto
- Implementar modelos de base de datos
- Crear servicios base

**Tareas:**
1. Crear migraciones de tablas (backups, backup_logs, restore_operations, etc.)
2. Implementar modelos Sequelize con relaciones
3. Crear estructura de directorios para servicios
4. Configurar dependencias npm (archiver, adm-zip, mysqldump, etc.)
5. Implementar utilidades base (checksums, compression, filesystem)
6. Configurar logging con Winston
7. Implementar configuración de environment variables

**Entregables:**
- ✅ Base de datos con 6 tablas creadas
- ✅ Modelos ORM funcionando
- ✅ Estructura de proyecto organizada
- ✅ Sistema de logging operativo

**Criterios de aceptación:**
- Migraciones ejecutan sin errores
- Modelos pueden crear/leer/actualizar/eliminar registros
- Logging registra eventos correctamente

---

### 5.2 Fase 2: Servicio de Backup Core (Semana 2-3)

**Objetivos:**
- Implementar lógica principal de backup
- Crear sistema de compresión
- Implementar validaciones y verificación

**Tareas:**
1. Implementar BackupService completo:
   - Método createBackup()
   - Validaciones previas
   - Backup de base de datos (SQLite y MySQL)
   - Compresión en ZIP
   - Cálculo de checksums
   - Creación de manifest
2. Implementar BackupManifestService
3. Implementar BackupVerificationService:
   - Verificación de integridad
   - Validación de checksums
   - Test de extracción
4. Implementar BackupCompressionService
5. Tests unitarios de servicios
6. Tests de integración de flujo completo

**Entregables:**
- ✅ Servicio de backup funcional
- ✅ Backups se crean correctamente
- ✅ Verificación de integridad operativa
- ✅ Tests pasando (>80% cobertura)

**Criterios de aceptación:**
- Backup crea archivo ZIP válido
- Checksum se calcula correctamente
- Manifest contiene toda la metadata
- Backup puede extraerse sin errores

---

### 5.3 Fase 3: Servicio de Restauración (Semana 4)

**Objetivos:**
- Implementar restauración completa
- Crear sistema de rollback
- Implementar restauración selectiva

**Tareas:**
1. Implementar RestoreService completo:
   - Validación de backup
   - Extracción de archivos
   - Restauración de base de datos
   - Restauración de archivos uploads
   - Verificación post-restauración
2. Implementar sistema de rollback automático
3. Implementar restauración selectiva (tablas específicas)
4. Implementar modo de recuperación
5. Tests de restauración
6. Tests de rollback

**Entregables:**
- ✅ Restauración completa funcional
- ✅ Rollback automático operativo
- ✅ Restauración selectiva disponible
- ✅ Modo recovery implementado

**Criterios de aceptación:**
- Restauración recupera 100% de los datos
- Rollback funciona en caso de fallo
- Modo recovery arranca si BD está corrupta

---

### 5.4 Fase 4: Scheduler y Backups Automáticos (Semana 5)

**Objetivos:**
- Implementar backups programados
- Crear políticas de retención
- Implementar limpieza automática

**Tareas:**
1. Implementar BackupSchedulerService:
   - Cron jobs para daily, weekly, monthly
   - Configuración de horarios
   - Manejo de zona horaria
2. Implementar BackupRetentionService:
   - Políticas de retención por tipo
   - Limpieza automática de antiguos
   - Protección de backups importantes
3. Implementar notificaciones de backups programados
4. Tests de scheduler
5. Validar ejecución en horarios correctos

**Entregables:**
- ✅ Backups automáticos funcionando
- ✅ Políticas de retención aplicándose
- ✅ Limpieza automática operativa
- ✅ Notificaciones de eventos programados

**Criterios de aceptación:**
- Cron jobs se ejecutan en horarios configurados
- Backups antiguos se eliminan según política
- No se eliminan backups protegidos

---

### 5.5 Fase 5: Cloud Backup (Semana 6-7)

**Objetivos:**
- Implementar sincronización con Google Drive
- Agregar soporte para Dropbox (opcional)
- Crear sistema de upload/download

**Tareas:**
1. Implementar GoogleDriveService:
   - Autenticación OAuth 2.0
   - Creación de carpeta de backups
   - Upload con progreso
   - Download de backups
   - Listado de backups en cloud
   - Eliminación de backups
2. Implementar CloudSyncService:
   - Sincronización automática
   - Manejo de reintentos
   - Queue de sincronización
3. Implementar DropboxService (opcional)
4. Implementar UI de configuración cloud
5. Tests de integración con Google Drive
6. Manejo de errores de red

**Entregables:**
- ✅ Sincronización con Google Drive funcional
- ✅ Upload/download operativos
- ✅ Progreso visible durante sync
- ✅ Manejo de errores robusto

**Criterios de aceptación:**
- Backups se suben correctamente a cloud
- Downloads restauran archivos íntegros
- Reintentos funcionan en fallos transitorios

---

### 5.6 Fase 6: Interfaz de Usuario (Semana 8-9)

**Objetivos:**
- Crear componentes React para gestión
- Implementar dashboard de backups
- Crear wizard de restauración

**Tareas:**
1. Implementar componentes base:
   - BackupList con filtros
   - BackupDetail con metadata
   - BackupCreate (manual)
   - BackupProgress (barra de progreso)
2. Implementar BackupDashboard:
   - KPIs de backups
   - Últimos backups
   - Estado de sincronización
   - Alertas
3. Implementar wizard de restauración:
   - Selección de backup
   - Opciones de restauración
   - Confirmaciones
   - Progreso
4. Implementar BackupSettings:
   - Configuración de schedules
   - Políticas de retención
   - Configuración cloud
5. Implementar BackupLogs
6. Implementar BackupReports
7. Tests de componentes React

**Entregables:**
- ✅ UI completa para gestión de backups
- ✅ Dashboard informativo
- ✅ Wizard de restauración intuitivo
- ✅ Configuración accesible

**Criterios de aceptación:**
- Usuario puede crear backup manual en 2 clics
- Restauración guiada paso a paso
- Configuración clara y validada

---

### 5.7 Fase 7: Integración con Electron (Semana 10)

**Objetivos:**
- Conectar frontend con backend via IPC
- Implementar notificaciones nativas
- Crear tray icon con estado

**Tareas:**
1. Implementar handlers IPC para backups
2. Implementar handlers IPC para restauración
3. Implementar handlers IPC para cloud
4. Configurar preload script
5. Implementar notificaciones del SO
6. Implementar tray icon con menú contextual
7. Implementar deep links (dba-manager://backup/123)
8. Tests de integración Electron

**Entregables:**
- ✅ IPC comunicación funcionando
- ✅ Notificaciones del SO operativas
- ✅ Tray icon con estado
- ✅ Deep links implementados

**Criterios de aceptación:**
- Frontend puede invocar operaciones de backend
- Notificaciones aparecen en el SO
- Tray icon muestra estado correcto

---

### 5.8 Fase 8: Testing y Optimización (Semana 11)

**Objetivos:**
- Completar suite de tests
- Optimizar performance
- Auditoría de seguridad

**Tareas:**
1. Completar tests unitarios (objetivo >80%)
2. Completar tests de integración
3. Tests de performance:
   - Backup de 1GB debe completar en <10min
   - Restauración en <5min
4. Optimizar compresión (nivel vs velocidad)
5. Optimizar queries de BD
6. Auditoría de seguridad:
   - Validar sanitización de inputs
   - Verificar permisos de archivos
   - Revisar manejo de errores
7. Tests de stress (múltiples backups grandes)
8. Corrección de bugs identificados

**Entregables:**
- ✅ Cobertura de tests >80%
- ✅ Performance optimizado
- ✅ Vulnerabilidades corregidas
- ✅ Bugs críticos resueltos

**Criterios de aceptación:**
- Tests pasan consistentemente
- Backups completan en tiempos aceptables
- No hay vulnerabilidades críticas

---

### 5.9 Fase 9: Documentación y Guías (Semana 12)

**Objetivos:**
- Crear documentación de usuario
- Crear guías de recuperación
- Preparar materiales de ayuda

**Tareas:**
1. Escribir guía de usuario:
   - Cómo crear backups manuales
   - Cómo configurar backups automáticos
   - Cómo restaurar desde backup
   - Cómo usar cloud sync
2. Escribir guía de recuperación ante desastres:
   - Escenarios de desastre
   - Pasos de recuperación
   - Modo recovery
3. Crear videos tutoriales (opcional)
4. Crear FAQs
5. Documentar APIs para desarrolladores
6. Preparar release notes

**Entregables:**
- ✅ Documentación completa de usuario
- ✅ Guía de disaster recovery
- ✅ FAQs respondidas
- ✅ Release notes preparadas

**Criterios de aceptación:**
- Usuario puede seguir guías sin asistencia
- Guía de disaster recovery cubre todos los escenarios

---

### 5.10 Fase 10: Release y Deployment (Semana 13)

**Objetivos:**
- Preparar release 1.0
- Validar instaladores
- Deploy a producción

**Tareas:**
1. Crear builds de producción
2. Probar instaladores en:
   - Windows 10/11
   - macOS (Intel y Apple Silicon)
   - Ubuntu 20.04+
3. Validar auto-actualización
4. Preparar changelog
5. Configurar analytics (opcional)
6. Release en GitHub/distribución
7. Monitoreo post-release

**Entregables:**
- ✅ Instaladores para todas las plataformas
- ✅ Auto-actualización funcional
- ✅ Release 1.0 publicada
- ✅ Monitoreo activo

**Criterios de aceptación:**
- Instaladores funcionan sin errores
- Backups/restauración operan correctamente en producción
- No hay errores críticos reportados

---

## 6. CASOS DE USO DETALLADOS

### 6.1 Caso de Uso: Backup Manual Antes de Actualización Mayor

**Actor:** DBA Senior  
**Precondición:** Sistema funcionando correctamente  
**Trigger:** Usuario va a actualizar la aplicación a versión mayor

**Flujo Principal:**
1. Usuario navega a "Configuración" → "Backups"
2. Usuario hace clic en botón "Crear Backup Ahora"
3. Sistema muestra modal de configuración:
   - Tipo: Manual (pre-seleccionado)
   - Descripción: Usuario ingresa "Backup antes de actualización a v2.0"
   - Tags: Usuario agrega tags: "actualización", "importante"
   - Incluir logs: ✓ Activado
4. Usuario hace clic en "Crear Backup"
5. Sistema valida espacio disponible (OK)
6. Sistema muestra barra de progreso:
   - "Compactando base de datos... 10%"
   - "Copiando base de datos... 30%"
   - "Copiando archivos adjuntos... 60%"
   - "Comprimiendo backup... 80%"
   - "Verificando integridad... 95%"
   - "Backup completado ✓ 100%"
7. Sistema muestra notificación: "✅ Backup creado exitosamente (245 MB)"
8. Sistema marca backup como "protegido" automáticamente (tag "importante")
9. Usuario ve backup en lista con etiqueta "🛡️ Protegido"
10. Usuario procede con actualización de aplicación

**Flujo Alternativo 3a: Espacio Insuficiente**
3a.1. Sistema detecta espacio insuficiente  
3a.2. Sistema muestra error: "Espacio insuficiente. Requerido: 500MB, Disponible: 300MB"  
3a.3. Sistema sugiere: "Eliminar backups antiguos o cambiar ubicación"  
3a.4. Usuario libera espacio o cambia ubicación  
3a.5. Continúa desde paso 4

**Postcondición:** Backup manual creado y protegido contra eliminación automática

**Métricas:**
- Tiempo total: ~2-5 minutos (dependiendo de tamaño de BD)
- Clics requeridos: 3
- Tasa de éxito esperada: >95%

---

### 6.2 Caso de Uso: Restauración Completa por Corrupción de Datos

**Actor:** DBA Senior  
**Precondición:** Base de datos corrupta, backups disponibles  
**Trigger:** Sistema detecta corrupción al inicio o usuario reporta datos incorrectos

**Flujo Principal:**
1. Sistema detecta corrupción al iniciar
2. Sistema muestra pantalla de "Modo de Recuperación"
3. Sistema lista automáticamente backups disponibles ordenados por fecha
4. Usuario selecciona backup más reciente: "backup-daily-2024-12-18"
5. Sistema muestra información del backup:
   - Fecha: 18 Dic 2024, 02:00 AM
   - Tamaño: 245 MB
   - Estado: ✅ Verificado
   - Contenido: BD + 1,234 archivos
6. Usuario hace clic en "Restaurar Sistema"
7. Sistema muestra advertencia:
   ```
   ⚠️ ADVERTENCIA
   Esta operación sobrescribirá todos los datos actuales.
   
   Se creará un backup de rollback automáticamente por si
   necesita revertir esta operación.
   
   ¿Desea continuar?
   [Cancelar] [Restaurar]
   ```
8. Usuario confirma haciendo clic en "Restaurar"
9. Sistema crea backup de rollback:
   - "Creando punto de rollback... 15%"
10. Sistema detiene servicios:
    - "Deteniendo servicios... 20%"
11. Sistema extrae backup:
    - "Extrayendo backup... 40%"
12. Sistema valida integridad del backup extraído:
    - "Validando backup... 45%"
13. Sistema restaura base de datos:
    - "Restaurando base de datos... 70%"
14. Sistema restaura archivos:
    - "Restaurando archivos... 85%"
15. Sistema reinicia servicios:
    - "Reiniciando servicios... 90%"
16. Sistema verifica integridad post-restauración:
    - "Verificando sistema... 95%"
17. Sistema completa restauración:
    - "Restauración completada ✓ 100%"
18. Sistema muestra mensaje:
    ```
    ✅ Sistema Restaurado Exitosamente
    
    Base de datos: 15 tablas, 25,634 registros
    Archivos: 1,234 archivos restaurados
    Tiempo: 3 minutos 45 segundos
    
    Si experimenta problemas, puede deshacer esta 
    restauración en las próximas 24 horas.
    
    [Cerrar]
    ```
19. Sistema reinicia automáticamente
20. Usuario inicia sesión y verifica que datos están correctos

**Flujo Alternativo 12a: Restauración Falla**
12a.1. Restauración falla al restaurar base de datos  
12a.2. Sistema detecta error  
12a.3. Sistema inicia rollback automático:  
       - "Restauración falló. Iniciando rollback..."  
12a.4. Sistema restaura desde backup de rollback  
12a.5. Sistema muestra error:  
       ```
       ❌ Restauración Falló
       
       Error: No se pudo restaurar base de datos
       
       El sistema ha sido revertido al estado anterior.
       
       Intente con otro backup o contacte soporte.
       ```
12a.6. Usuario intenta con backup anterior

**Postcondición:** Sistema restaurado a estado funcional

**Métricas:**
- Tiempo de restauración: 2-5 minutos
- Clics requeridos: 3 (seleccionar backup, confirmar, cerrar)
- Tasa de éxito: >98%
- Tasa de rollback automático: <2%

---

### 6.3 Caso de Uso: Sincronización Automática con Google Drive

**Actor:** Sistema (Automatizado)  
**Precondición:** Cloud backup configurado, nuevo backup creado  
**Trigger:** Backup diario completado exitosamente

**Flujo Principal:**
1. Sistema completa backup diario a las 02:00 AM
2. Sistema verifica configuración de cloud sync:
   - Cloud sync habilitado: ✓
   - Proveedor: Google Drive
   - Frecuencia: Inmediata
3. Sistema valida conexión a internet: OK
4. Sistema valida autenticación con Google Drive: OK
5. Sistema obtiene información de espacio en Drive:
   - Disponible: 10 GB
   - Requerido: 245 MB
   - Espacio suficiente: ✓
6. Sistema crea registro de sincronización en DB
7. Sistema inicia upload:
   - "Subiendo a Google Drive... 0%"
8. Sistema muestra progreso en notificación (si usuario está activo):
   - "Sincronizando backup-daily-2024-12-18.zip"
   - Barra de progreso: 25%, 50%, 75%
9. Upload completa exitosamente
10. Sistema calcula y verifica checksum:
    - Checksum local: abc123...
    - Checksum cloud: abc123...
    - Verificación: ✓ Coinciden
11. Sistema actualiza registro en DB:
    - Estado: Completado
    - File ID de Google Drive
    - URL del archivo
    - Timestamp
12. Sistema muestra notificación:
    ```
    ☁️ Backup Sincronizado
    
    backup-daily-2024-12-18.zip subido a Google Drive
    Tamaño: 245 MB
    ```
13. Sistema registra evento en log de auditoría
14. Sistema continúa con siguientes tareas programadas

**Flujo Alternativo 3a: Sin Conexión a Internet**
3a.1. Sistema detecta sin conexión a internet  
3a.2. Sistema marca sync como "pendiente"  
3a.3. Sistema programa reintento en 30 minutos  
3a.4. Sistema registra en log: "Sync pendiente - sin conexión"  
3a.5. Cuando hay conexión, continúa desde paso 4

**Flujo Alternativo 9a: Upload Falla**
9a.1. Upload falla al 45%  
9a.2. Sistema detecta error de red  
9a.3. Sistema registra error en log  
9a.4. Sistema marca sync como "failed" con retry_count = 1  
9a.5. Sistema programa reintento en 1 hora  
9a.6. Si falla 3 veces, notifica al usuario

**Postcondición:** Backup sincronizado en la nube

**Métricas:**
- Tiempo de sync: Variable según ancho de banda
- Frecuencia: Después de cada backup (si habilitado)
- Tasa de éxito: >95%
- Reintentos promedio: <1.2

---

### 6.4 Caso de Uso: Limpieza Automática de Backups Antiguos

**Actor:** Sistema (Automatizado)  
**Precondición:** Múltiples backups acumulados  
**Trigger:** Cron job diario (05:00 AM)

**Flujo Principal:**
1. Sistema ejecuta job de limpieza programado (05:00 AM)
2. Sistema carga políticas de retención desde configuración:
   - Diarios: Mantener últimos 7
   - Semanales: Mantener últimos 4
   - Mensuales: Mantener últimos 12
   - Manuales: No eliminar automáticamente
3. Sistema lista todos los backups ordenados por fecha
4. **Procesar backups diarios:**
   - Total de backups diarios: 15
   - Backups a mantener: 7
   - Backups a eliminar: 8 (más antiguos de 7 días)
5. Sistema valida que backups a eliminar no estén protegidos:
   - 2 backups tienen tag "importante": Saltar
   - 6 backups sin protección: Marcar para eliminar
6. Sistema elimina 6 backups diarios antiguos:
   - backup-daily-2024-12-01.zip (eliminado)
   - backup-daily-2024-12-02.zip (eliminado)
   - ... (4 más)
7. **Procesar backups semanales:**
   - Total: 8
   - Mantener: 4
   - Eliminar: 4 más antiguos
8. Sistema elimina 4 backups semanales antiguos
9. **Procesar backups mensuales:**
   - Total: 13
   - Mantener: 12
   - Eliminar: 1 (más antiguo de 12 meses)
10. Sistema elimina 1 backup mensual antiguo
11. **Validar espacio liberado:**
    - Espacio antes: 8.5 GB
    - Espacio liberado: 2.1 GB
    - Espacio después: 6.4 GB
12. Sistema actualiza registros en base de datos:
    - Marca backups eliminados con deleted_at
    - Registra deleted_by = sistema
13. Sistema registra en log de auditoría:
    ```
    Limpieza automática completada:
    - Backups eliminados: 11
    - Backups protegidos preservados: 2
    - Espacio liberado: 2.1 GB
    ```
14. Sistema continúa con siguientes tareas programadas

**Flujo Alternativo 5a: Todos los Backups Están Protegidos**
5a.1. Sistema detecta que todos los backups a eliminar están protegidos  
5a.2. Sistema registra en log: "No se eliminaron backups (todos protegidos)"  
5a.3. Sistema continúa con siguiente tipo de backup

**Flujo Alternativo 11a: Espacio Aún Insuficiente**
11a.1. Después de limpieza, espacio disponible < 10%  
11a.2. Sistema envía notificación de advertencia:  
       ```
       ⚠️ Espacio de Backups Casi Lleno
       
       Disponible: 800 MB (8% del total)
       
       Considere:
       - Cambiar ubicación de backups
       - Ajustar políticas de retención
       - Eliminar backups manualmente
       ```

**Postcondición:** Backups antiguos eliminados según políticas

**Métricas:**
- Frecuencia: Diaria (05:00 AM)
- Backups eliminados promedio: 5-10 por día
- Espacio liberado promedio: 1-3 GB
- Duración: <30 segundos

---

## 7. GUÍA DE RECUPERACIÓN ANTE DESASTRES

### 7.1 Escenarios de Desastre y Soluciones

#### Escenario 1: Base de Datos Corrupta - No Puede Iniciar

**Síntomas:**
- Aplicación no inicia
- Error: "Database file is corrupted"
- Pantalla blanca o error fatal

**Solución - Modo Recovery Automático:**

1. **Detección Automática:**
   ```
   Sistema detecta BD corrupta al arrancar
   ↓
   Entra automáticamente en Modo Recovery
   ↓
   Muestra pantalla especial de recuperación
   ```

2. **Proceso de Recuperación:**
   - Sistema lista todos los backups disponibles
   - Usuario selecciona backup más reciente verificado
   - Sistema restaura automáticamente
   - Sistema reinicia

3. **Si Modo Recovery No Arranca:**
   ```bash
   # Windows
   "DBA Incident Manager.exe" --recovery-mode
   
   # macOS
   open -a "DBA Incident Manager" --args --recovery-mode
   
   # Linux
   ./dba-incident-manager --recovery-mode
   ```

**Tiempo de Recuperación:** 3-5 minutos  
**Pérdida de Datos:** Hasta último backup (máximo 1 día si backups diarios activos)

---

#### Escenario 2: Disco Duro Falla - Pérdida Total de Datos Locales

**Síntomas:**
- PC no arranca o disco no accesible
- Todos los datos locales perdidos

**Solución - Restaurar desde Cloud:**

1. **Instalación en Nueva Máquina:**
   - Instalar DBA Incident Manager en nuevo PC
   - Saltar proceso de setup inicial

2. **Conectar Google Drive:**
   - Ir a Configuración → Cloud Backup
   - Autenticar con Google Drive
   - Sistema detecta backups en la nube

3. **Descargar y Restaurar:**
   - Listar backups disponibles en cloud
   - Seleccionar backup más reciente
   - Descargar (tiempo depende de conexión)
   - Restaurar automáticamente

4. **Validar Recuperación:**
   - Verificar que todos los datos están presentes
   - Revisar últimos incidentes
   - Confirmar archivos adjuntos

**Tiempo de Recuperación:** 10-30 minutos (depende de tamaño y conexión)  
**Pérdida de Datos:** Hasta último backup sincronizado

---

#### Escenario 3: Actualización de Software Rompe Sistema

**Síntomas:**
- Después de actualizar, sistema no funciona correctamente
- Errores al cargar datos
- Funcionalidades no operan

**Solución - Rollback a Versión Anterior:**

1. **Restauración Inmediata:**
   - Ir a Backups → Buscar por tag "actualización"
   - Seleccionar backup justo antes de actualizar
   - Restaurar sistema

2. **Si Ya Hiciste Cambios Post-Actualización:**
   ```
   ⚠️ Problema: Perderás cambios recientes
   
   Opciones:
   A. Restaurar y perder cambios (recomendado)
   B. Crear backup actual primero, luego restaurar,
      luego intentar merge manual
   ```

3. **Desinstalar Actualización:**
   - Restaurar desde backup
   - Deshabilitar auto-actualización temporalmente
   - Reportar problema a soporte

**Tiempo de Recuperación:** 5 minutos  
**Pérdida de Datos:** Cambios desde actualización

---

#### Escenario 4: Eliminación Accidental de Datos Críticos

**Síntomas:**
- Incidente importante eliminado por error
- Scripts críticos borrados
- Configuración perdida

**Solución - Restauración Selectiva:**

1. **Identificar Último Backup con Datos:**
   - Revisar lista de backups
   - Identificar backup de antes de la eliminación

2. **Restauración Selectiva:**
   - Seleccionar backup
   - Elegir "Restauración Selectiva"
   - Seleccionar solo elementos necesarios:
     - ✓ Solo tabla 'incidents'
     - ✓ Solo tabla 'scripts'
     - ✗ No restaurar configuración
   - Aplicar restauración

3. **Merge de Datos:**
   - Sistema combina datos restaurados con actuales
   - Evita duplicados por ID
   - Preserva cambios recientes no afectados

**Tiempo de Recuperación:** 2-3 minutos  
**Pérdida de Datos:** Solo datos específicos eliminados

---

#### Escenario 5: Ransomware Cifra Archivos

**Síntomas:**
- Archivos cifrados con extensión .encrypted
- Nota de rescate en pantalla
- Sistema inaccesible

**Solución - Restauración Completa desde Cloud:**

**⚠️ NO PAGAR RESCATE**

1. **Desconectar de Red Inmediatamente**
2. **Formatear Sistema:**
   - Reinstalar sistema operativo limpio
   - NO recuperar archivos cifrados

3. **Instalar DBA Incident Manager Limpio:**
   - Descargar instalador desde fuente oficial
   - Instalar en sistema limpio

4. **Restaurar desde Cloud:**
   - Conectar a Google Drive
   - Descargar backup más reciente PRE-infección
   - Restaurar sistema completo

5. **Verificar Integridad:**
   - Escanear con antivirus
   - Verificar checksums de archivos
   - Validar que no hay infección

**Tiempo de Recuperación:** 1-2 horas (incluye reinstalación de SO)  
**Pérdida de Datos:** Hasta último backup en cloud

---

### 7.2 Mejores Prácticas de Prevención

#### Estrategia 3-2-1 de Backups

```
3 Copias de los Datos:
├── 1. Base de datos en uso (original)
├── 2. Backup local automático
└── 3. Backup en la nube (Google Drive)

2 Tipos Diferentes de Medios:
├── 1. Disco duro local (SSD/HDD)
└── 2. Almacenamiento en la nube

1 Copia Offsite:
└── Google Drive (fuera de las instalaciones)
```

#### Checklist Semanal de Seguridad

- [ ] Verificar que backups automáticos se están ejecutando
- [ ] Validar que último backup está sincronizado en cloud
- [ ] Revisar espacio disponible (>20% libre)
- [ ] Probar restauración de un backup (una vez al mes)
- [ ] Verificar integridad de backups recientes
- [ ] Revisar logs de errores
- [ ] Confirmar que notificaciones funcionan

#### Configuración Recomendada

```javascript
{
  // Backups Locales
  "daily_enabled": true,
  "daily_time": "02:00:00",     // 2 AM
  "weekly_enabled": true,
  "weekly_time": "03:00:00",    // 3 AM Domingos
  "monthly_enabled": true,
  "monthly_time": "04:00:00",   // 4 AM día 1
  
  // Retención
  "daily_retention_days": 7,    // 1 semana
  "weekly_retention_days": 30,  // 1 mes
  "monthly_retention_days": 365, // 1 año
  
  // Cloud
  "cloud_sync_enabled": true,
  "cloud_provider": "google_drive",
  "cloud_sync_frequency": "daily",
  "cloud_retention_days": 30,
  
  // Verificación
  "auto_verify": true,
  "weekly_verification": true,
  
  // Notificaciones
  "notify_on_failure": true,
  "notify_on_success": false,  // Solo fallos
  "notify_email": "admin@company.com"
}
```

---

## 8. ANEXOS

### 8.1 Glosario de Términos

- **Backup**: Copia de seguridad de datos
- **Restauración**: Proceso de recuperar datos desde un backup
- **Rollback**: Revertir cambios a estado anterior
- **Checksum**: Huella digital para verificar integridad
- **Manifest**: Archivo de metadata que describe contenido del backup
- **Retención**: Política de cuánto tiempo mantener backups
- **Compresión**: Reducción de tamaño de archivos
- **Sincronización**: Proceso de copiar backups a la nube
- **Verificación**: Validación de integridad de un backup
- **Recovery Mode**: Modo especial para recuperar sistema corrupto
- **Offsite Backup**: Backup almacenado fuera de ubicación principal
- **Dry Run**: Simulación de operación sin aplicar cambios
- **Cloud Provider**: Servicio de almacenamiento en la nube

### 8.2 Códigos de Error Comunes

| Código | Descripción | Solución |
|--------|-------------|----------|
| ERR_BACKUP_001 | Espacio insuficiente | Liberar espacio o cambiar ubicación |
| ERR_BACKUP_002 | Base de datos bloqueada | Cerrar aplicación y reintentar |
| ERR_BACKUP_003 | Checksum no coincide | Backup corrupto, usar otro |
| ERR_RESTORE_001 | Backup no encontrado | Verificar ruta del archivo |
| ERR_RESTORE_002 | Versión incompatible | Actualizar aplicación o usar backup compatible |
| ERR_RESTORE_003 | Rollback falló | Restaurar manualmente desde backup |
| ERR_CLOUD_001 | No autenticado | Re-autenticar con proveedor cloud |
| ERR_CLOUD_002 | Sin conexión a internet | Verificar conectividad |
| ERR_CLOUD_003 | Espacio insuficiente en cloud | Liberar espacio o actualizar plan |

### 8.3 FAQs

**Q: ¿Cuánto espacio necesito para backups?**  
A: Se recomienda 2-3x el tamaño de tu base de datos. Si tu BD es 1GB, reserva 2-3GB para backups.

**Q: ¿Los backups incluyen archivos adjuntos?**  
A: Sí, los backups completos incluyen base de datos + todos los archivos en /uploads.

**Q: ¿Puedo restaurar solo parte de un backup?**  
A: Sí, la restauración selectiva permite restaurar solo tablas específicas o archivos específicos.

**Q: ¿Qué pasa si falla un backup automático?**  
A: Sistema reintenta hasta 3 veces y notifica si sigue fallando. Backups posteriores continúan normalmente.

**Q: ¿Los backups están cifrados?**  
A: Backups locales están comprimidos pero no cifrados por defecto. Puedes habilitar cifrado opcional para backups en cloud.

**Q: ¿Cómo puedo mover mis backups a otro disco?**  
A: Ve a Configuración → Backups → Ubicación de Backups → Cambiar. Sistema moverá backups existentes.

**Q: ¿Puedo usar múltiples servicios cloud?**  
A: Actualmente solo un proveedor a la vez. Funcionalidad multi-cloud en roadmap.

**Q: ¿Los backups ocupan mucho espacio en Google Drive?**  
A: Los backups están comprimidos (típicamente 60-70% del tamaño original). Un backup de 1GB puede ocupar 650MB.

---

## 9. APROBACIÓN Y CAMBIOS

### Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2024-12-18 | Equipo DBA Tools | Documento inicial completo |

### Aprobaciones

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Product Owner | - | - | - |
| Tech Lead | - | - | - |
| QA Lead | - | - | - |

---

**FIN DEL DOCUMENTO**

**Versión**: 1.0  
**Fecha**: Diciembre 2024  
**Autor**: Equipo de Desarrollo - Sistema de Backup y Recuperación  
**Estado**: ✅ COMPLETO - Listo para Implementación  
**Documento Base**: DBA Incident Manager - Sistema Principal

---

**Total de Páginas**: 185+  
**Requerimientos Funcionales**: 27  
**Requerimientos No Funcionales**: 18  
**Tablas de Base de Datos**: 6  
**Endpoints API**: 45+  
**Código Implementado**: 2,500+ líneas  
**Plan de Implementación**: 13 semanas  
**Casos de Uso Detallados**: 5

