# DOCUMENTO TÉCNICO - MÓDULO DE NOTAS, APRENDIZAJE Y RECORDATORIOS
## DBA Incident Manager - Knowledge Management System

---

## 1. INFORMACIÓN GENERAL DEL MÓDULO

### 1.1 Nombre del Módulo
**Knowledge Management & Notes System**

### 1.2 Descripción
Módulo complementario para el sistema DBA Incident Manager que permite a los DBAs gestionar notas rápidas, documentar aprendizajes, establecer recordatorios inteligentes y crear una base de conocimiento personal y colaborativa. El sistema facilita la captura, organización y recuperación de conocimiento operacional de manera contextual e integrada con los módulos existentes.

### 1.3 Objetivos

- Facilitar la captura rápida de conocimiento durante operaciones diarias
- Crear un repositorio de lecciones aprendidas y mejores prácticas
- Reducir la pérdida de conocimiento por rotación de personal
- Implementar recordatorios contextuales e inteligentes
- Fomentar la documentación continua y el aprendizaje
- Mejorar la transferencia de conocimiento entre DBAs
- Proporcionar insights sobre patrones de aprendizaje y evolución profesional

### 1.4 Alcance

**Incluye:**
- Sistema de sticky notes contextuales
- Gestión de recordatorios inteligentes
- Base de conocimiento tipo "TIL" (Today I Learned)
- Diario personal del DBA
- Sistema de lecciones aprendidas
- Knowledge nuggets y quick tips
- Integración con incidentes, servidores y scripts
- Dashboard de aprendizaje personal
- Sistema de notificaciones contextuales
- Capacidades de colaboración en notas

**No Incluye:**
- Sistema de mensajería en tiempo real (chat)
- Gestión de documentación formal tipo Wiki
- Sistema de tickets o helpdesk
- Integración con herramientas externas de gestión de conocimiento

---

## 2. REQUERIMIENTOS FUNCIONALES

### 2.1 Módulo de Sticky Notes

#### RF-N001: Crear Sticky Notes

El sistema debe permitir crear notas adhesivas con:
- Título (obligatorio, máximo 100 caracteres)
- Contenido (obligatorio, texto enriquecido, máximo 5000 caracteres)
- Color/Categoría predefinido (amarillo, verde, azul, rojo, púrpura, gris)
- Tipo de nota:
  - **Global**: Visible en dashboard principal
  - **Servidor**: Asociada a un servidor específico
  - **Incidente**: Vinculada a un incidente
  - **Script**: Relacionada con un script
  - **Personal**: Solo visible para el creador
  - **Compartida**: Visible para todo el equipo
- Prioridad (Baja, Media, Alta, Crítica)
- Tags personalizados (múltiples)
- Posibilidad de fijar (pin) la nota
- Fecha de expiración (opcional)
- Adjuntar archivos pequeños (máximo 2MB por archivo, 3 archivos por nota)

**Validaciones:**
- El título no puede estar vacío
- El contenido debe tener al menos 5 caracteres
- Las notas globales no pueden ser privadas
- La fecha de expiración debe ser futura

#### RF-N002: Visualización de Sticky Notes

El sistema debe mostrar notas en diferentes vistas:

**Vista Dashboard:**
- Widget en columna derecha con últimas 10 notas
- Filtro por prioridad y tipo
- Indicador visual de notas sin leer
- Drag & drop para reordenar
- Opción de colapsar/expandir widget

**Vista Lista Completa:**
- Grid de notas tipo Masonry layout
- Filtros avanzados:
  - Por color/categoría
  - Por tipo de nota
  - Por prioridad
  - Por servidor/incidente/script relacionado
  - Por tags
  - Por fecha de creación
  - Por autor
- Búsqueda full-text en título y contenido
- Ordenamiento por: fecha, prioridad, última modificación
- Vista compacta vs expandida

**Vista Kanban:**
- Columnas configurables:
  - Por defecto: "Para Revisar", "En Progreso", "Completado", "Archivo"
  - Personalizable por usuario
- Drag & drop entre columnas
- Contador de notas por columna
- Código de colores visual

**Vista Contextual:**
- En detalle de servidor: mostrar notas relacionadas
- En detalle de incidente: mostrar notas vinculadas
- En editor de script: mostrar notas del script
- Panel lateral desplegable (shortcut Ctrl+N)

#### RF-N003: Editar y Eliminar Notas

El sistema debe permitir:
- Editar todas las propiedades de la nota
- Cambiar el tipo de nota (con validaciones)
- Mover nota entre servidores/incidentes
- Eliminar notas (solo el creador o admin)
- Archivar notas (soft delete)
- Duplicar nota existente
- Convertir nota personal en compartida
- Registrar historial de cambios en notas compartidas

**Restricciones:**
- Las notas con comentarios no se pueden eliminar, solo archivar
- Cambiar tipo de nota requiere confirmación
- Editar nota compartida registra autor del cambio

#### RF-N004: Interacción con Notas

El sistema debe permitir:
- Marcar nota como leída/no leída
- Fijar (pin) nota al inicio
- Reaccionar con emojis (👍, ❤️, 💡, ⚠️, ✅)
- Compartir nota con usuario específico
- Exportar nota individual (Markdown, PDF)
- Crear recordatorio desde nota
- Vincular nota a entidades (servidores, incidentes, scripts)
- Mencionar usuarios con @usuario
- Agregar comentarios en notas compartidas

#### RF-N005: Notas con Formato Rico

El sistema debe soportar:
- Markdown básico (encabezados, listas, negritas, cursivas)
- Bloques de código con syntax highlighting
- Checkboxes interactivos para to-do lists
- Links a entidades internas (ej: `#incident-123`, `@server-prod-01`)
- Links externos
- Citas y callouts
- Tablas simples
- Emojis

### 2.2 Módulo de Recordatorios

#### RF-N006: Crear Recordatorios

El sistema debe permitir crear recordatorios con:
- Título (obligatorio, máximo 150 caracteres)
- Descripción (opcional, texto enriquecido)
- Fecha y hora (obligatorio)
- Tipo de recordatorio:
  - **One-time**: Se ejecuta una sola vez
  - **Recurring**: Se repite según frecuencia
- Frecuencia (si es recurring):
  - Diaria (cada N días)
  - Semanal (días específicos de la semana)
  - Mensual (día específico del mes o "último día del mes")
  - Personalizada (expresión cron)
- Prioridad (Baja, Media, Alta, Crítica)
- Entidad relacionada (opcional):
  - Servidor
  - Incidente
  - Script
  - Nota
- Acción rápida (opcional):
  - Abrir servidor
  - Ver incidente
  - Ejecutar script
  - Crear incidente automático
- Canales de notificación:
  - In-app (obligatorio)
  - Email (opcional)
  - Push notification (opcional)
- Anticipación de notificación:
  - Justo a tiempo
  - 15 minutos antes
  - 1 hora antes
  - 1 día antes
  - Personalizado

**Validaciones:**
- La fecha debe ser futura (para nuevos recordatorios)
- Las expresiones cron deben ser válidas
- Los recordatorios recurrentes deben tener fecha de inicio

#### RF-N007: Gestión de Recordatorios

El sistema debe permitir:
- Listar recordatorios con filtros:
  - Pendientes
  - Completados
  - Vencidos
  - Recurrentes vs one-time
  - Por entidad relacionada
  - Por prioridad
- Editar recordatorios pendientes
- Eliminar recordatorios
- Marcar como completado
- Posponer recordatorio (1 hora, 1 día, 1 semana, personalizado)
- Cancelar instancia de recordatorio recurrente
- Desactivar recordatorio recurrente temporalmente
- Ver historial de completados

**Vista Timeline:**
- Calendario mensual con recordatorios
- Vista semanal con horarios
- Vista diaria detallada
- Código de colores por prioridad
- Indicadores de recordatorios recurrentes

#### RF-N008: Notificaciones de Recordatorios

El sistema debe:
- Mostrar notificación in-app cuando llegue la hora
- Incluir snooze options (5 min, 15 min, 1 hora)
- Mostrar quick actions configuradas
- Mantener notificación visible hasta acción del usuario
- Agrupar múltiples recordatorios simultáneos
- Enviar email si configurado
- Mostrar push notification en sistema operativo
- Reproducir sonido configurable (opcional)
- Persistir notificaciones al reiniciar app

**Notificaciones Persistentes:**
- Las notificaciones no desaparecen al cerrar
- Se mantienen en centro de notificaciones
- Contador de notificaciones pendientes
- Acceso rápido desde header

#### RF-N009: Recordatorios Inteligentes

El sistema debe generar recordatorios automáticos:

**Basados en Incidentes:**
- "Han pasado 30 días del incidente #{id}, verificar si persiste"
- "Incidente crítico sin seguimiento en 7 días"
- "Revisar incidentes recurrentes del mes"

**Basados en Servidores:**
- "Backup programado para servidor {nombre}"
- "Mantenimiento mensual de {servidor}"
- "Revisar métricas de performance de {servidor}"

**Basados en Scripts:**
- "Ejecutar script de limpieza mensual"
- "Script {nombre} no se ha ejecutado en 30 días"

**Basados en Patrones:**
- Detectar actividades regulares del usuario
- Sugerir recordatorios basados en historial
- "Sueles revisar logs los viernes, ¿crear recordatorio?"

### 2.3 Módulo de Knowledge Nuggets

#### RF-N010: Crear Knowledge Nuggets

El sistema debe permitir crear entradas de conocimiento con:
- Título descriptivo (obligatorio, máximo 150 caracteres)
- Categoría:
  - TIL (Today I Learned)
  - Best Practice
  - Gotcha (error común)
  - Quick Tip
  - Command Reference
  - Troubleshooting Guide
- Tecnología relacionada (MySQL, PostgreSQL, SQL Server, Oracle, MongoDB, Linux, etc.)
- Nivel de complejidad (Principiante, Intermedio, Avanzado, Expert)
- Contenido (texto enriquecido con código)
- Tags técnicos (múltiples)
- Referencias externas (URLs, documentación)
- Vinculación a incidente de origen (opcional)
- Útil para (tipos de incidentes donde aplica)
- Código de ejemplo (syntax highlighting)
- Resultado esperado

**Características especiales:**
- Marcar como "verificado" por senior DBA
- Rating de utilidad (estrellas)
- Contador de veces usado
- Fecha de última actualización

#### RF-N011: Biblioteca de Knowledge Nuggets

El sistema debe proporcionar:

**Vista Principal:**
- Grid de cards con nuggets
- Filtros por:
  - Categoría
  - Tecnología
  - Nivel de complejidad
  - Tags
  - Rating
  - Fecha
- Búsqueda full-text avanzada
- Ordenamiento por: popularidad, fecha, rating, alfabético
- Vista compacta vs detallada

**Vista Detalle:**
- Contenido completo formateado
- Código con botón "Copiar"
- Referencias clickeables
- Incidente origen (si existe)
- Historial de revisiones
- Comentarios de otros usuarios
- Rating y feedback
- Botón "Esto me ayudó"
- Sugerencias de nuggets relacionados

**Sugerencias Contextuales:**
- Al crear incidente, mostrar nuggets relacionados por keywords
- Al abrir servidor, mostrar nuggets de esa tecnología
- En dashboard, "Nugget del día" aleatorio

#### RF-N012: Colaboración en Knowledge Base

El sistema debe permitir:
- Comentar en nuggets
- Proponer mejoras/correcciones
- Marcar como obsoleto
- Solicitar actualización
- Compartir nugget con mención @usuario
- Crear nugget desde solución de incidente
- Convertir nota en nugget
- Versionar cambios importantes

### 2.4 Módulo de DBA Journal

#### RF-N013: Diario Personal del DBA

El sistema debe proporcionar un diario con:
- Entrada diaria automática (se crea al primer uso del día)
- Formato libre de texto enriquecido
- Secciones sugeridas (opcionales):
  - "¿Qué hice hoy?"
  - "¿Qué aprendí?"
  - "Problemas enfrentados"
  - "Pendientes para mañana"
  - "Notas importantes"
- Auto-vinculación a incidentes trabajados ese día
- Auto-vinculación a scripts ejecutados
- Contador de actividad del día (incidentes, scripts, tiempo)
- Tags del día
- Estado de ánimo (emoji opcional)
- Logros del día

**Características:**
- Solo visible para el autor
- Exportable completo (PDF, Markdown)
- Búsqueda por fecha o contenido
- Vista calendario con preview
- Estadísticas mensuales/anuales
- Streak de días con entradas

#### RF-N014: Vista Timeline del Journal

El sistema debe mostrar:
- Calendario mensual con días con entradas
- Vista semanal con resumen diario
- Vista año con heatmap de actividad
- Filtros por tags, keywords, tipo de actividad
- Comparativas mes vs mes
- Evolución de temas frecuentes
- Integración con gráficos de actividad

### 2.5 Módulo de Lecciones Aprendidas

#### RF-N015: Documentar Lecciones Aprendidas

El sistema debe permitir asociar a incidentes cerrados:
- Sección "Lecciones Aprendidas" (texto enriquecido)
- Diferenciado de la solución técnica
- Preguntas guía:
  - "¿Qué salió bien?"
  - "¿Qué salió mal?"
  - "¿Qué haríamos diferente?"
  - "¿Qué aprendimos?"
  - "¿Qué medidas preventivas aplicar?"
- Nivel de impacto del aprendizaje (Bajo, Medio, Alto, Crítico)
- Aplicabilidad (este servidor, este tipo de servidor, global)
- Tags de categorización
- Acción a tomar (opcional):
  - Crear recordatorio
  - Actualizar documentación
  - Modificar procedimiento
  - Entrenar al equipo

**Conversión automática:**
- Opción de convertir en Knowledge Nugget
- Opción de convertir en Best Practice
- Opción de generar recordatorio preventivo

#### RF-N016: Biblioteca de Lecciones Aprendidas

El sistema debe proporcionar:
- Listado de todas las lecciones
- Filtros por:
  - Nivel de impacto
  - Tipo de incidente
  - Servidor/tecnología
  - Fecha
  - Aplicabilidad
  - Tags
- Búsqueda full-text
- Vista agregada por tipo de incidente
- Vista de lecciones más impactantes
- Export de lecciones (reporte PDF)

**Análisis de Tendencias:**
- Lecciones recurrentes
- Problemas persistentes
- Mejoras implementadas vs pendientes
- Efectividad de acciones tomadas

### 2.6 Módulo de Quick Tips y Comandos

#### RF-N017: Gestionar Quick Tips

El sistema debe mantener biblioteca de tips con:
- Título breve (máximo 80 caracteres)
- Comando o tip (texto plano o código)
- Explicación breve (opcional)
- Tecnología aplicable
- Categoría (performance, security, backup, monitoring, administration)
- Frecuencia de uso (auto-calculado)
- Tags

**Características:**
- Copiar al portapapeles con un clic
- Favoritos personales
- Compartir tip con equipo
- Sugerir tip al crear incidente
- "Tip del día" en dashboard

#### RF-N018: Integración de Tips

El sistema debe:
- Mostrar tips contextuales según:
  - Tipo de incidente que se está creando
  - Servidor seleccionado (por tecnología)
  - Script que se está editando
- Sugerir comandos al escribir en scripts
- Panel lateral de "Tips Relacionados" en vistas de trabajo
- Notificación de nuevo tip popular

### 2.7 Módulo de Dashboard de Aprendizaje

#### RF-N019: Dashboard Personal de Conocimiento

El sistema debe mostrar dashboard con:

**KPIs de Conocimiento:**
- Total de notas creadas (este mes vs último mes)
- Total de nuggets contribuidos
- Rating promedio de nuggets
- Días consecutivos con journal entry
- Recordatorios completados a tiempo (%)

**Gráficos:**
- Evolución mensual de notas creadas
- Distribución de notas por categoría (pie chart)
- Heatmap de actividad en journal
- Timeline de aprendizajes por tecnología
- Progress bars de skill tracking

**Secciones:**
- Notas recientes (últimas 5)
- Recordatorios pendientes hoy
- Nugget destacado de la semana
- Lecciones aprendidas del mes
- Resumen de journal de ayer
- Tips más usados esta semana

#### RF-N020: Skill Tracker

El sistema debe rastrear habilidades:
- Categorías de skills:
  - Performance Tuning
  - Backup & Recovery
  - Security
  - High Availability
  - Monitoring
  - Scripting
  - Troubleshooting
  - Disaster Recovery
- Nivel por skill (Novice, Competent, Proficient, Expert)
- Basado en:
  - Tipos de incidentes resueltos
  - Nuggets creados por categoría
  - Scripts ejecutados por tipo
  - Auto-evaluación
- Visualización radar chart
- Recomendaciones de áreas a mejorar
- Certificaciones y cursos vinculados

#### RF-N021: Estadísticas y Analytics

El sistema debe proporcionar:
- Comparativas mes vs mes
- Tendencias de aprendizaje
- Temas más frecuentes en notas
- Evolución temporal de skills
- Correlación incidentes-aprendizajes
- Métricas de colaboración (notas compartidas, comentarios)
- Engagement score personal

### 2.8 Módulo de Colaboración y Compartir

#### RF-N022: Sistema de Comentarios

El sistema debe permitir en notas y nuggets compartidos:
- Agregar comentarios
- Responder a comentarios (threading)
- Mencionar usuarios @usuario
- Reacciones con emoji
- Editar/eliminar propios comentarios
- Notificación de nuevos comentarios
- Marcar comentario como solución

#### RF-N023: Compartir Conocimiento

El sistema debe permitir:
- Compartir nota con usuario específico
- Compartir con grupo/rol (todos los senior DBAs)
- Convertir nota personal en compartida
- Generar link de compartir (read-only)
- Export de nota/nugget individual
- Export masivo de colección de notas
- Importar notas desde Markdown

#### RF-N024: Sistema de Mentions y Notificaciones

El sistema debe:
- Detectar @usuario en notas y comentarios
- Enviar notificación a usuario mencionado
- Mostrar preview de la nota en notificación
- Permitir responder desde notificación
- Agrupar múltiples menciones
- Configurar preferencias de menciones

### 2.9 Módulo de Búsqueda Avanzada

#### RF-N025: Búsqueda Global de Conocimiento

El sistema debe proporcionar:
- Búsqueda unificada en:
  - Notas
  - Nuggets
  - Lecciones aprendidas
  - Journal entries
  - Tips
  - Recordatorios
- Filtros combinables:
  - Tipo de contenido
  - Fecha
  - Autor
  - Tags
  - Categoría
  - Prioridad
  - Estado (activo, archivado, completado)
- Operadores booleanos (AND, OR, NOT)
- Búsqueda por frase exacta
- Búsqueda por código
- Resultados con highlighting de términos
- Ordenamiento por relevancia o fecha
- Guardado de búsquedas frecuentes

### 2.10 Módulo de Configuración y Preferencias

#### RF-N026: Configuración de Notas

El sistema debe permitir configurar:
- Colores predeterminados por tipo de nota
- Tamaño de widget en dashboard
- Número de notas visibles en widget
- Auto-archivar notas después de N días
- Plantillas de notas personalizadas
- Atajos de teclado personalizados
- Categorías de Kanban personalizadas

#### RF-N027: Configuración de Recordatorios

El sistema debe permitir configurar:
- Canal de notificación predeterminado
- Anticipación predeterminada
- Sonido de notificación
- Horario de no molestar
- Recordatorios recurrentes predeterminados:
  - Backup semanal
  - Revisión mensual
  - Mantenimiento trimestral
- Plantillas de recordatorios

#### RF-N028: Preferencias de Dashboard

El sistema debe permitir:
- Personalizar widgets visibles
- Reordenar widgets (drag & drop)
- Configurar KPIs a mostrar
- Seleccionar gráficos de interés
- Establecer metas personales
- Configurar "Tip del día"

---

## 3. REQUERIMIENTOS NO FUNCIONALES

### 3.1 Rendimiento

**RNF-N001: Tiempos de Respuesta**
- Crear nota: < 500ms
- Cargar widget de notas: < 1 segundo
- Búsqueda de notas: < 1 segundo para 10,000 registros
- Cargar dashboard de aprendizaje: < 2 segundos
- Notificación de recordatorio: < 100ms desde el trigger

**RNF-N002: Capacidad**
- El sistema debe soportar 10,000 notas por usuario
- Mínimo 1,000 recordatorios activos simultáneos
- 5,000 knowledge nuggets en biblioteca
- Journal con 365+ entradas sin degradación
- Búsqueda eficiente en 50,000+ documentos combinados

**RNF-N003: Optimización**
- Lazy loading de contenido de notas en vistas de lista
- Paginación virtual en listas largas
- Debounce en búsquedas (300ms)
- Cache de búsquedas frecuentes
- Índices full-text en todas las tablas de contenido

### 3.2 Usabilidad

**RNF-N004: Interfaz de Usuario**
- Creación rápida de nota con máximo 3 clics
- Atajo de teclado global para nueva nota (Ctrl+Shift+N)
- Drag & drop para organización
- Auto-guardado cada 30 segundos en edición
- Confirmación solo en acciones destructivas
- Tooltips descriptivos en todos los iconos
- Feedback visual inmediato en todas las acciones

**RNF-N005: Accesibilidad**
- Navegación completa por teclado
- Atajos documentados y accesibles (?)
- Colores con contraste WCAG AA
- Screen reader compatible
- Tamaños de fuente ajustables

**RNF-N006: Experiencia de Usuario**
- Sin pérdida de datos en edición (auto-guardado)
- Undo/Redo en editores de texto
- Preview en tiempo real de Markdown
- Arrastrar imágenes directamente al editor
- Copiar código con un clic

### 3.3 Confiabilidad

**RNF-N007: Disponibilidad de Datos**
- Todas las notas persisten localmente
- Backup automático incluye notas y recordatorios
- Recuperación de notas eliminadas (30 días)
- Sincronización de recordatorios al reiniciar app
- Notificaciones perdidas se muestran al abrir app

**RNF-N008: Integridad de Datos**
- Validación de fechas en recordatorios
- Verificación de integridad de relaciones
- Transacciones atómicas en operaciones complejas
- Log de auditoría en operaciones críticas
- Versionado de contenido en notas compartidas

### 3.4 Seguridad

**RNF-N009: Control de Acceso**
- Notas privadas solo visibles para creador
- Notas compartidas según permisos de usuario
- Admin puede ver todas las notas (audit)
- Registro de accesos a notas sensibles
- Encriptación de notas marcadas como "confidenciales"

**RNF-N010: Privacidad**
- Journal entries siempre privados
- Export de datos personales disponible
- Opción de eliminar completamente notas
- No indexar contenido privado en búsqueda global
- Anonimización en reportes agregados

### 3.5 Mantenibilidad

**RNF-N011: Código**
- Componentes reutilizables para notas
- Separación de lógica de presentación
- Tests unitarios de servicios críticos
- Documentación de componentes complejos
- Principios SOLID en servicios

**RNF-N012: Extensibilidad**
- Sistema de plugins para tipos de nota personalizados
- Hooks para integraciones futuras
- API REST documentada para exportación
- Formato de datos portable (JSON)
- Soporte para futuros tipos de contenido

### 3.6 Compatibilidad

**RNF-N013: Integración**
- Compatible con todos los módulos existentes
- No afectar rendimiento de módulos principales
- Desactivable sin romper funcionalidad core
- Importación desde sistemas externos
- Export en formatos estándar (JSON, Markdown, PDF)

---

## 4. REQUERIMIENTOS TÉCNICOS

### 4.1 Extensiones al Stack Tecnológico Existente

#### 4.1.1 Nuevas Dependencias Frontend

```json
{
  "dependencies": {
    // Editor de texto rico
    "@tiptap/react": "^2.1.13",
    "@tiptap/starter-kit": "^2.1.13",
    "@tiptap/extension-link": "^2.1.13",
    "@tiptap/extension-task-list": "^2.1.13",
    "@tiptap/extension-task-item": "^2.1.13",
    "@tiptap/extension-code-block-lowlight": "^2.1.13",
    "lowlight": "^3.1.0",
    
    // Drag & Drop
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    
    // Calendario y fechas
    "react-big-calendar": "^1.8.5",
    "react-day-picker": "^8.10.0",
    
    // Markdown
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "rehype-highlight": "^7.0.0",
    
    // Notificaciones avanzadas
    "react-toastify": "^9.1.3",
    
    // Charts para dashboard
    "recharts": "^2.10.0", // Ya existe
    "@nivo/radar": "^0.84.0", // Para skill radar chart
    
    // Emojis
    "emoji-picker-react": "^4.5.16",
    
    // Cron expression
    "cron-parser": "^4.9.0",
    "react-cron-generator": "^2.0.5"
  }
}
```

#### 4.1.2 Nuevas Dependencias Backend

```json
{
  "dependencies": {
    // Cron jobs
    "node-cron": "^3.0.3", // Ya existe
    "cron-validator": "^1.3.1",
    
    // Procesamiento de texto
    "natural": "^6.10.1", // NLP para sugerencias
    "string-similarity": "^4.0.4",
    
    // Markdown processing
    "marked": "^11.1.0",
    "sanitize-html": "^2.11.0",
    
    // Notificaciones
    "node-notifier": "^10.0.1",
    
    // Full-text search optimization
    "fuse.js": "^7.0.0" // Para búsqueda en memoria
  }
}
```

### 4.2 Arquitectura del Módulo

#### 4.2.1 Estructura de Directorios (Extensión)

```
src/features/
├── notes/
│   ├── components/
│   │   ├── StickyNote.tsx
│   │   ├── StickyNoteForm.tsx
│   │   ├── StickyNoteList.tsx
│   │   ├── StickyNoteWidget.tsx
│   │   ├── StickyNoteKanban.tsx
│   │   ├── StickyNoteFilters.tsx
│   │   ├── NoteColorPicker.tsx
│   │   ├── NoteLinkSelector.tsx
│   │   └── NoteComments.tsx
│   ├── hooks/
│   │   ├── useNotes.ts
│   │   ├── useNoteFilters.ts
│   │   ├── useNoteEditor.ts
│   │   └── useNoteComments.ts
│   ├── services/
│   │   ├── notes.service.ts
│   │   └── noteSearch.service.ts
│   ├── store/
│   │   └── notesStore.ts
│   └── types/
│       └── note.types.ts
│
├── reminders/
│   ├── components/
│   │   ├── ReminderForm.tsx
│   │   ├── ReminderList.tsx
│   │   ├── ReminderCalendar.tsx
│   │   ├── ReminderNotification.tsx
│   │   ├── ReminderQuickActions.tsx
│   │   └── CronExpressionBuilder.tsx
│   ├── hooks/
│   │   ├── useReminders.ts
│   │   ├── useReminderNotifications.ts
│   │   └── useReminderScheduler.ts
│   ├── services/
│   │   ├── reminders.service.ts
│   │   ├── reminderScheduler.service.ts
│   │   └── reminderNotifications.service.ts
│   ├── store/
│   │   └── remindersStore.ts
│   └── types/
│       └── reminder.types.ts
│
├── knowledge/
│   ├── components/
│   │   ├── KnowledgeNugget.tsx
│   │   ├── KnowledgeNuggetForm.tsx
│   │   ├── KnowledgeNuggetList.tsx
│   │   ├── KnowledgeNuggetDetail.tsx
│   │   ├── TipOfTheDay.tsx
│   │   ├── QuickTipCard.tsx
│   │   └── LessonLearnedSection.tsx
│   ├── hooks/
│   │   ├── useKnowledgeNuggets.ts
│   │   ├── useQuickTips.ts
│   │   └── useLessonsLearned.ts
│   ├── services/
│   │   ├── knowledge.service.ts
│   │   ├── tips.service.ts
│   │   └── lessons.service.ts
│   ├── store/
│   │   └── knowledgeStore.ts
│   └── types/
│       └── knowledge.types.ts
│
├── journal/
│   ├── components/
│   │   ├── JournalEntry.tsx
│   │   ├── JournalEditor.tsx
│   │   ├── JournalCalendar.tsx
│   │   ├── JournalTimeline.tsx
│   │   └── JournalStats.tsx
│   ├── hooks/
│   │   ├── useJournal.ts
│   │   └── useJournalStats.ts
│   ├── services/
│   │   └── journal.service.ts
│   ├── store/
│   │   └── journalStore.ts
│   └── types/
│       └── journal.types.ts
│
├── learning-dashboard/
│   ├── components/
│   │   ├── LearningDashboard.tsx
│   │   ├── SkillTracker.tsx
│   │   ├── SkillRadarChart.tsx
│   │   ├── ActivityHeatmap.tsx
│   │   ├── KnowledgeKPIs.tsx
│   │   └── LearningTimeline.tsx
│   ├── hooks/
│   │   ├── useLearningStats.ts
│   │   └── useSkillTracking.ts
│   ├── services/
│   │   └── learningAnalytics.service.ts
│   └── types/
│       └── learning.types.ts
│
└── shared/
    ├── components/
    │   ├── RichTextEditor.tsx
    │   ├── MarkdownPreview.tsx
    │   ├── CodeBlock.tsx
    │   ├── EmojiPicker.tsx
    │   ├── UserMention.tsx
    │   └── EntityLink.tsx
    └── utils/
        ├── markdown.utils.ts
        ├── mention.utils.ts
        └── notification.utils.ts
```

#### 4.2.2 Estructura Backend (Extensión)

```
server/src/
├── controllers/
│   ├── notes.controller.ts
│   ├── reminders.controller.ts
│   ├── knowledge.controller.ts
│   ├── journal.controller.ts
│   └── learningAnalytics.controller.ts
│
├── services/
│   ├── notes.service.ts
│   ├── reminders.service.ts
│   ├── reminderScheduler.service.ts
│   ├── knowledge.service.ts
│   ├── journal.service.ts
│   ├── learningAnalytics.service.ts
│   ├── notificationDispatcher.service.ts
│   └── contentSuggestion.service.ts
│
├── models/
│   ├── Note.ts
│   ├── NoteComment.ts
│   ├── NoteAttachment.ts
│   ├── Reminder.ts
│   ├── ReminderHistory.ts
│   ├── KnowledgeNugget.ts
│   ├── QuickTip.ts
│   ├── LessonLearned.ts
│   ├── JournalEntry.ts
│   ├── SkillTracking.ts
│   └── NotificationQueue.ts
│
├── routes/
│   ├── notes.routes.ts
│   ├── reminders.routes.ts
│   ├── knowledge.routes.ts
│   ├── journal.routes.ts
│   └── learningAnalytics.routes.ts
│
├── validators/
│   ├── notes.validator.ts
│   ├── reminders.validator.ts
│   ├── knowledge.validator.ts
│   └── journal.validator.ts
│
├── schedulers/
│   ├── reminderScheduler.ts
│   └── smartSuggestions.scheduler.ts
│
└── utils/
    ├── cronValidator.utils.ts
    ├── textSimilarity.utils.ts
    └── contentAnalyzer.utils.ts
```

### 4.3 Modelos de Base de Datos

#### Tabla: notes

```sql
CREATE TABLE notes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  color ENUM('yellow', 'green', 'blue', 'red', 'purple', 'gray') DEFAULT 'yellow',
  type ENUM('global', 'server', 'incident', 'script', 'personal', 'shared') NOT NULL,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  
  -- Relaciones opcionales
  server_id INT NULL,
  incident_id INT NULL,
  script_id INT NULL,
  
  -- Propiedades
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP NULL,
  
  -- Colaboración
  created_by INT NOT NULL,
  shared_with TEXT NULL, -- JSON array de user IDs
  
  -- Kanban
  kanban_column VARCHAR(50) DEFAULT 'todo',
  kanban_position INT DEFAULT 0,
  
  -- Metadata
  views_count INT DEFAULT 0,
  last_viewed_at TIMESTAMP NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_type (type),
  INDEX idx_created_by (created_by),
  INDEX idx_server (server_id),
  INDEX idx_incident (incident_id),
  INDEX idx_script (script_id),
  INDEX idx_pinned (is_pinned),
  INDEX idx_archived (is_archived),
  INDEX idx_expires (expires_at),
  FULLTEXT idx_content (title, content),
  
  FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE SET NULL,
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE SET NULL,
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Tabla: note_tags

```sql
CREATE TABLE note_tags (
  note_id INT NOT NULL,
  tag_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (note_id, tag_id),
  INDEX idx_note (note_id),
  INDEX idx_tag (tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

#### Tabla: note_comments

```sql
CREATE TABLE note_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  note_id INT NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id INT NULL, -- Para threading
  
  created_by INT NOT NULL,
  is_solution BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_note (note_id),
  INDEX idx_parent (parent_comment_id),
  INDEX idx_created_by (created_by),
  
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES note_comments(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Tabla: note_reactions

```sql
CREATE TABLE note_reactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  note_id INT NOT NULL,
  user_id INT NOT NULL,
  reaction VARCHAR(10) NOT NULL, -- emoji unicode
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_reaction (note_id, user_id, reaction),
  INDEX idx_note (note_id),
  INDEX idx_user (user_id),
  
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Tabla: note_attachments

```sql
CREATE TABLE note_attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  note_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  uploaded_by INT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_note (note_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

#### Tabla: reminders

```sql
CREATE TABLE reminders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  
  -- Scheduling
  scheduled_at TIMESTAMP NOT NULL,
  type ENUM('one_time', 'recurring') NOT NULL,
  recurrence_pattern VARCHAR(255) NULL, -- Cron expression o JSON config
  
  -- Propiedades
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  status ENUM('pending', 'completed', 'snoozed', 'cancelled') DEFAULT 'pending',
  
  -- Notificaciones
  notification_channels JSON NOT NULL, -- ['in_app', 'email', 'push']
  advance_notice_minutes INT DEFAULT 0,
  
  -- Relaciones opcionales
  server_id INT NULL,
  incident_id INT NULL,
  script_id INT NULL,
  note_id INT NULL,
  
  -- Quick actions
  quick_action VARCHAR(100) NULL,
  quick_action_params JSON NULL,
  
  -- Auto-generated
  is_auto_generated BOOLEAN DEFAULT FALSE,
  auto_generation_rule VARCHAR(100) NULL,
  
  -- Metadata
  created_by INT NOT NULL,
  last_triggered_at TIMESTAMP NULL,
  next_trigger_at TIMESTAMP NULL,
  snooze_until TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_scheduled (scheduled_at),
  INDEX idx_next_trigger (next_trigger_at),
  INDEX idx_status (status),
  INDEX idx_type (type),
  INDEX idx_created_by (created_by),
  INDEX idx_server (server_id),
  INDEX idx_incident (incident_id),
  
  FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE SET NULL,
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE SET NULL,
  FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE SET NULL,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Tabla: reminder_history

```sql
CREATE TABLE reminder_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reminder_id INT NOT NULL,
  triggered_at TIMESTAMP NOT NULL,
  action_taken ENUM('completed', 'snoozed', 'dismissed') NOT NULL,
  snooze_duration_minutes INT NULL,
  notes TEXT NULL,
  
  INDEX idx_reminder (reminder_id),
  INDEX idx_triggered (triggered_at),
  
  FOREIGN KEY (reminder_id) REFERENCES reminders(id) ON DELETE CASCADE
);
```

#### Tabla: knowledge_nuggets

```sql
CREATE TABLE knowledge_nuggets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  category ENUM('til', 'best_practice', 'gotcha', 'quick_tip', 'command_ref', 'troubleshooting') NOT NULL,
  
  content TEXT NOT NULL,
  code_example TEXT NULL,
  expected_result TEXT NULL,
  
  -- Clasificación
  technology VARCHAR(100) NOT NULL, -- MySQL, PostgreSQL, etc.
  complexity_level ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL,
  
  -- Referencias
  external_references TEXT NULL, -- JSON array de URLs
  incident_id INT NULL, -- Origen del nugget
  applicable_to TEXT NULL, -- JSON array de tipos de incidentes
  
  -- Métricas
  usage_count INT DEFAULT 0,
  helpful_count INT DEFAULT 0,
  rating_sum INT DEFAULT 0,
  rating_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by INT NULL,
  verified_at TIMESTAMP NULL,
  
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_category (category),
  INDEX idx_technology (technology),
  INDEX idx_complexity (complexity_level),
  INDEX idx_rating (rating_count, rating_sum),
  INDEX idx_created_by (created_by),
  INDEX idx_incident (incident_id),
  FULLTEXT idx_content (title, content, code_example),
  
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (verified_by) REFERENCES users(id)
);
```

#### Tabla: knowledge_nugget_tags

```sql
CREATE TABLE knowledge_nugget_tags (
  nugget_id INT NOT NULL,
  tag_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (nugget_id, tag_id),
  FOREIGN KEY (nugget_id) REFERENCES knowledge_nuggets(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

#### Tabla: nugget_comments

```sql
CREATE TABLE nugget_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nugget_id INT NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id INT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_nugget (nugget_id),
  INDEX idx_parent (parent_comment_id),
  
  FOREIGN KEY (nugget_id) REFERENCES knowledge_nuggets(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES nugget_comments(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Tabla: quick_tips

```sql
CREATE TABLE quick_tips (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(80) NOT NULL,
  command TEXT NOT NULL,
  explanation TEXT NULL,
  technology VARCHAR(100) NOT NULL,
  category ENUM('performance', 'security', 'backup', 'monitoring', 'administration') NOT NULL,
  
  usage_count INT DEFAULT 0,
  
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_technology (technology),
  INDEX idx_category (category),
  INDEX idx_usage (usage_count),
  FULLTEXT idx_search (title, command, explanation),
  
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Tabla: quick_tip_tags

```sql
CREATE TABLE quick_tip_tags (
  tip_id INT NOT NULL,
  tag_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (tip_id, tag_id),
  FOREIGN KEY (tip_id) REFERENCES quick_tips(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

#### Tabla: lessons_learned

```sql
CREATE TABLE lessons_learned (
  id INT PRIMARY KEY AUTO_INCREMENT,
  incident_id INT NOT NULL UNIQUE, -- Una lección por incidente
  
  what_went_well TEXT NULL,
  what_went_wrong TEXT NULL,
  what_to_do_different TEXT NULL,
  key_learnings TEXT NOT NULL,
  preventive_measures TEXT NULL,
  
  impact_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  applicability ENUM('this_server', 'server_type', 'global') NOT NULL,
  
  action_items TEXT NULL, -- JSON array
  
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_incident (incident_id),
  INDEX idx_impact (impact_level),
  INDEX idx_applicability (applicability),
  FULLTEXT idx_content (key_learnings, preventive_measures),
  
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Tabla: lessons_learned_tags

```sql
CREATE TABLE lessons_learned_tags (
  lesson_id INT NOT NULL,
  tag_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (lesson_id, tag_id),
  FOREIGN KEY (lesson_id) REFERENCES lessons_learned(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

#### Tabla: journal_entries

```sql
CREATE TABLE journal_entries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  entry_date DATE NOT NULL,
  
  -- Secciones opcionales
  what_i_did TEXT NULL,
  what_i_learned TEXT NULL,
  problems_faced TEXT NULL,
  pending_tomorrow TEXT NULL,
  important_notes TEXT NULL,
  
  -- Metadata del día
  mood VARCHAR(10) NULL, -- emoji unicode
  daily_tags TEXT NULL, -- JSON array
  achievements TEXT NULL, -- JSON array
  
  -- Actividad automática
  incidents_worked JSON NULL, -- Array de incident IDs
  scripts_executed JSON NULL, -- Array de script IDs
  time_tracked_minutes INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_date (user_id, entry_date),
  INDEX idx_user (user_id),
  INDEX idx_date (entry_date),
  FULLTEXT idx_content (what_i_did, what_i_learned, problems_faced),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Tabla: skill_tracking

```sql
CREATE TABLE skill_tracking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  skill_category VARCHAR(100) NOT NULL,
  skill_level ENUM('novice', 'competent', 'proficient', 'expert') NOT NULL,
  
  -- Calculado automáticamente
  incidents_resolved INT DEFAULT 0,
  nuggets_contributed INT DEFAULT 0,
  scripts_executed INT DEFAULT 0,
  
  -- Auto-evaluación
  self_assessment INT NULL, -- 1-10 scale
  assessment_date DATE NULL,
  
  -- Certificaciones
  certifications JSON NULL, -- Array de objetos
  courses JSON NULL, -- Array de objetos
  
  last_activity_date DATE NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_skill (user_id, skill_category),
  INDEX idx_user (user_id),
  INDEX idx_category (skill_category),
  INDEX idx_level (skill_level),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Tabla: user_favorites

```sql
CREATE TABLE user_favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  entity_type ENUM('note', 'nugget', 'tip', 'lesson', 'reminder') NOT NULL,
  entity_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_favorite (user_id, entity_type, entity_id),
  INDEX idx_user (user_id),
  INDEX idx_entity (entity_type, entity_id),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Tabla: notification_queue

```sql
CREATE TABLE notification_queue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  type ENUM('reminder', 'mention', 'comment', 'share', 'suggestion') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NULL,
  
  -- Metadata
  entity_type VARCHAR(50) NULL,
  entity_id INT NULL,
  action_url VARCHAR(500) NULL,
  
  -- Estado
  status ENUM('pending', 'sent', 'read', 'dismissed') DEFAULT 'pending',
  
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  
  scheduled_at TIMESTAMP NULL,
  sent_at TIMESTAMP NULL,
  read_at TIMESTAMP NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_scheduled (scheduled_at),
  INDEX idx_priority (priority),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Tabla: user_mentions

```sql
CREATE TABLE user_mentions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  mentioned_user_id INT NOT NULL,
  mentioned_by_user_id INT NOT NULL,
  
  entity_type ENUM('note', 'note_comment', 'nugget', 'nugget_comment') NOT NULL,
  entity_id INT NOT NULL,
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_mentioned_user (mentioned_user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_entity (entity_type, entity_id),
  
  FOREIGN KEY (mentioned_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (mentioned_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4.4 APIs y Endpoints

#### 4.4.1 Notas (Notes)

**GET /api/notes**
- Query: `?type=&priority=&is_pinned=&is_archived=&server_id=&incident_id=&script_id=&tags[]=&search=&page=&limit=`
- Response: `{ success, data: { notes, pagination } }`

**GET /api/notes/:id**
- Response: `{ success, data: { note, comments, reactions } }`

**POST /api/notes**
- Body: `{ title, content, color, type, priority, server_id?, incident_id?, script_id?, is_pinned, expires_at?, tags[], is_private }`
- Response: `{ success, data: { note } }`

**PUT /api/notes/:id**
- Body: Campos a actualizar
- Response: `{ success, data: { note } }`

**DELETE /api/notes/:id**
- Response: `{ success, message }`

**PATCH /api/notes/:id/archive**
- Response: `{ success, data: { note } }`

**PATCH /api/notes/:id/pin**
- Body: `{ is_pinned }`
- Response: `{ success, data: { note } }`

**PATCH /api/notes/:id/kanban**
- Body: `{ column, position }`
- Response: `{ success, data: { note } }`

**POST /api/notes/:id/comments**
- Body: `{ content, parent_comment_id? }`
- Response: `{ success, data: { comment } }`

**POST /api/notes/:id/reactions**
- Body: `{ reaction }`
- Response: `{ success, data: { reaction } }`

**DELETE /api/notes/:id/reactions/:reactionId**
- Response: `{ success, message }`

**POST /api/notes/:id/share**
- Body: `{ user_ids[] }`
- Response: `{ success, message }`

**GET /api/notes/contextual/:entityType/:entityId**
- Response: `{ success, data: { notes } }`

**GET /api/notes/widget**
- Query: `?limit=10`
- Response: `{ success, data: { notes, unread_count } }`

#### 4.4.2 Recordatorios (Reminders)

**GET /api/reminders**
- Query: `?status=&type=&priority=&start_date=&end_date=&page=&limit=`
- Response: `{ success, data: { reminders, pagination } }`

**GET /api/reminders/:id**
- Response: `{ success, data: { reminder, history } }`

**POST /api/reminders**
- Body: `{ title, description, scheduled_at, type, recurrence_pattern?, priority, notification_channels, advance_notice_minutes, server_id?, incident_id?, script_id?, note_id?, quick_action?, quick_action_params? }`
- Response: `{ success, data: { reminder } }`

**PUT /api/reminders/:id**
- Body: Campos a actualizar
- Response: `{ success, data: { reminder } }`

**DELETE /api/reminders/:id**
- Response: `{ success, message }`

**PATCH /api/reminders/:id/complete**
- Body: `{ notes? }`
- Response: `{ success, data: { reminder } }`

**PATCH /api/reminders/:id/snooze**
- Body: `{ duration_minutes }`
- Response: `{ success, data: { reminder } }`

**PATCH /api/reminders/:id/cancel**
- Response: `{ success, data: { reminder } }`

**GET /api/reminders/calendar**
- Query: `?year=2024&month=12`
- Response: `{ success, data: { calendar_data } }`

**GET /api/reminders/pending-today**
- Response: `{ success, data: { reminders } }`

**GET /api/reminders/suggestions**
- Response: `{ success, data: { suggested_reminders } }`

#### 4.4.3 Knowledge Nuggets

**GET /api/knowledge/nuggets**
- Query: `?category=&technology=&complexity=&tags[]=&search=&sort_by=&page=&limit=`
- Response: `{ success, data: { nuggets, pagination } }`

**GET /api/knowledge/nuggets/:id**
- Response: `{ success, data: { nugget, comments, related } }`

**POST /api/knowledge/nuggets**
- Body: `{ title, category, content, code_example?, expected_result?, technology, complexity_level, external_references?, incident_id?, applicable_to?, tags[] }`
- Response: `{ success, data: { nugget } }`

**PUT /api/knowledge/nuggets/:id**
- Body: Campos a actualizar
- Response: `{ success, data: { nugget } }`

**DELETE /api/knowledge/nuggets/:id**
- Response: `{ success, message }`

**POST /api/knowledge/nuggets/:id/rate**
- Body: `{ rating }` (1-5)
- Response: `{ success, data: { nugget } }`

**POST /api/knowledge/nuggets/:id/helpful**
- Response: `{ success, data: { nugget } }`

**POST /api/knowledge/nuggets/:id/verify**
- Headers: Solo admin o senior DBA
- Response: `{ success, data: { nugget } }`

**POST /api/knowledge/nuggets/:id/comments**
- Body: `{ content, parent_comment_id? }`
- Response: `{ success, data: { comment } }`

**GET /api/knowledge/nuggets/contextual**
- Query: `?incident_type=&server_technology=&keywords=`
- Response: `{ success, data: { nuggets } }`

**GET /api/knowledge/nugget-of-the-day**
- Response: `{ success, data: { nugget } }`

#### 4.4.4 Quick Tips

**GET /api/knowledge/tips**
- Query: `?technology=&category=&search=&page=&limit=`
- Response: `{ success, data: { tips, pagination } }`

**GET /api/knowledge/tips/:id**
- Response: `{ success, data: { tip } }`

**POST /api/knowledge/tips**
- Body: `{ title, command, explanation?, technology, category, tags[] }`
- Response: `{ success, data: { tip } }`

**PUT /api/knowledge/tips/:id**
- Body: Campos a actualizar
- Response: `{ success, data: { tip } }`

**DELETE /api/knowledge/tips/:id**
- Response: `{ success, message }`

**POST /api/knowledge/tips/:id/use**
- Response: `{ success, data: { tip } }`

**GET /api/knowledge/tips/popular**
- Query: `?limit=10`
- Response: `{ success, data: { tips } }`

**GET /api/knowledge/tip-of-the-day**
- Response: `{ success, data: { tip } }`

#### 4.4.5 Lecciones Aprendidas

**GET /api/knowledge/lessons**
- Query: `?impact_level=&applicability=&tags[]=&search=&page=&limit=`
- Response: `{ success, data: { lessons, pagination } }`

**GET /api/knowledge/lessons/:id**
- Response: `{ success, data: { lesson, incident } }`

**POST /api/knowledge/lessons**
- Body: `{ incident_id, what_went_well?, what_went_wrong?, what_to_do_different?, key_learnings, preventive_measures?, impact_level, applicability, action_items?, tags[] }`
- Response: `{ success, data: { lesson } }`

**PUT /api/knowledge/lessons/:id**
- Body: Campos a actualizar
- Response: `{ success, data: { lesson } }`

**DELETE /api/knowledge/lessons/:id**
- Response: `{ success, message }`

**GET /api/knowledge/lessons/by-incident-type**
- Query: `?incident_type=`
- Response: `{ success, data: { lessons } }`

**GET /api/knowledge/lessons/recurring-issues**
- Response: `{ success, data: { recurring_patterns } }`

#### 4.4.6 Journal

**GET /api/journal**
- Query: `?year=2024&month=12`
- Response: `{ success, data: { entries, calendar_data } }`

**GET /api/journal/:date**
- Params: date en formato YYYY-MM-DD
- Response: `{ success, data: { entry } }`

**POST /api/journal**
- Body: `{ entry_date, what_i_did?, what_i_learned?, problems_faced?, pending_tomorrow?, important_notes?, mood?, daily_tags?, achievements? }`
- Response: `{ success, data: { entry } }`

**PUT /api/journal/:date**
- Body: Campos a actualizar
- Response: `{ success, data: { entry } }`

**DELETE /api/journal/:date**
- Response: `{ success, message }`

**GET /api/journal/stats**
- Query: `?start_date=&end_date=`
- Response: `{ success, data: { stats } }`

**GET /api/journal/streak**
- Response: `{ success, data: { current_streak, longest_streak } }`

**GET /api/journal/export**
- Query: `?year=2024&format=pdf` o `format=markdown`
- Response: File download

**GET /api/journal/timeline**
- Query: `?year=2024`
- Response: `{ success, data: { timeline } }`

#### 4.4.7 Learning Dashboard

**GET /api/learning/dashboard**
- Response: `{ success, data: { kpis, charts, recent_activity } }`

**GET /api/learning/skills**
- Response: `{ success, data: { skills } }`

**PUT /api/learning/skills/:category**
- Body: `{ skill_level, self_assessment?, certifications?, courses? }`
- Response: `{ success, data: { skill } }`

**GET /api/learning/stats**
- Query: `?period=month` o `year`
- Response: `{ success, data: { stats } }`

**GET /api/learning/progress**
- Query: `?skill_category=`
- Response: `{ success, data: { progress } }`

**GET /api/learning/recommendations**
- Response: `{ success, data: { recommendations } }`

#### 4.4.8 Búsqueda Global

**GET /api/search/knowledge**
- Query: `?q=&types[]=&page=&limit=`
- Types: note, nugget, lesson, tip, journal
- Response: `{ success, data: { results, pagination } }`

**GET /api/search/knowledge/advanced**
- Body (POST): `{ query, filters: { types, technologies, categories, date_range, tags }, operators }`
- Response: `{ success, data: { results } }`

#### 4.4.9 Notificaciones

**GET /api/notifications**
- Query: `?status=&type=&page=&limit=`
- Response: `{ success, data: { notifications, unread_count } }`

**PATCH /api/notifications/:id/read**
- Response: `{ success, data: { notification } }`

**PATCH /api/notifications/read-all**
- Response: `{ success, message }`

**DELETE /api/notifications/:id**
- Response: `{ success, message }`

**GET /api/notifications/unread-count**
- Response: `{ success, data: { count } }`

### 4.5 Lógica de Negocio Crítica

#### 4.5.1 Sistema de Recordatorios Inteligentes

```typescript
// server/src/services/reminderScheduler.service.ts

class ReminderSchedulerService {
  
  // Inicializar scheduler al arrancar servidor
  async initialize() {
    // Cargar recordatorios pendientes
    const pendingReminders = await this.loadPendingReminders();
    
    // Programar cada recordatorio
    for (const reminder of pendingReminders) {
      await this.scheduleReminder(reminder);
    }
    
    // Job que revisa cada minuto
    cron.schedule('* * * * *', async () => {
      await this.checkReminders();
    });
    
    // Job diario para generar recordatorios inteligentes
    cron.schedule('0 6 * * *', async () => {
      await this.generateSmartReminders();
    });
  }
  
  // Programar recordatorio
  async scheduleReminder(reminder: Reminder) {
    if (reminder.type === 'one_time') {
      await this.scheduleOneTime(reminder);
    } else {
      await this.scheduleRecurring(reminder);
    }
  }
  
  // Verificar recordatorios que deben dispararse
  async checkReminders() {
    const now = new Date();
    
    const dueReminders = await Reminder.findAll({
      where: {
        status: 'pending',
        next_trigger_at: {
          [Op.lte]: now
        }
      }
    });
    
    for (const reminder of dueReminders) {
      await this.triggerReminder(reminder);
    }
  }
  
  // Disparar recordatorio
  async triggerReminder(reminder: Reminder) {
    // Crear notificaciones según canales
    const channels = JSON.parse(reminder.notification_channels);
    
    if (channels.includes('in_app')) {
      await notificationService.createInAppNotification(reminder);
    }
    
    if (channels.includes('email')) {
      await notificationService.sendEmailNotification(reminder);
    }
    
    if (channels.includes('push')) {
      await notificationService.sendPushNotification(reminder);
    }
    
    // Registrar en historial
    await ReminderHistory.create({
      reminder_id: reminder.id,
      triggered_at: new Date(),
      action_taken: 'triggered'
    });
    
    // Actualizar última ejecución
    reminder.last_triggered_at = new Date();
    
    // Si es recurrente, calcular próxima ejecución
    if (reminder.type === 'recurring') {
      reminder.next_trigger_at = this.calculateNextTrigger(reminder);
    } else {
      reminder.status = 'completed';
    }
    
    await reminder.save();
  }
  
  // Generar recordatorios inteligentes
  async generateSmartReminders() {
    // Incidentes sin seguimiento
    await this.checkStaleIncidents();
    
    // Backups programados
    await this.checkScheduledBackups();
    
    // Scripts recurrentes
    await this.checkRecurringScripts();
    
    // Patrones de usuario
    await this.suggestBasedOnPatterns();
  }
  
  // Detectar incidentes sin seguimiento
  async checkStaleIncidents() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const staleIncidents = await Incident.findAll({
      where: {
        status: ['new', 'in_progress'],
        created_at: {
          [Op.lte]: thirtyDaysAgo
        }
      }
    });
    
    for (const incident of staleIncidents) {
      // Verificar si ya existe recordatorio
      const existingReminder = await Reminder.findOne({
        where: {
          incident_id: incident.id,
          type: 'one_time',
          status: 'pending'
        }
      });
      
      if (!existingReminder) {
        await Reminder.create({
          title: `Seguimiento: Incidente #${incident.id} sin actividad`,
          description: `El incidente "${incident.title}" lleva 30 días sin actualización`,
          scheduled_at: new Date(),
          type: 'one_time',
          priority: incident.severity,
          notification_channels: JSON.stringify(['in_app', 'email']),
          incident_id: incident.id,
          quick_action: 'open_incident',
          quick_action_params: JSON.stringify({ incident_id: incident.id }),
          is_auto_generated: true,
          auto_generation_rule: 'stale_incident_30days',
          created_by: incident.created_by
        });
      }
    }
  }
}
```

#### 4.5.2 Sistema de Sugerencias Contextuales

```typescript
// server/src/services/contentSuggestion.service.ts

class ContentSuggestionService {
  
  // Sugerir nuggets relevantes al crear incidente
  async suggestNuggetsForIncident(incidentData: Partial<Incident>) {
    const { type, description, server_id } = incidentData;
    
    // Obtener tecnología del servidor
    const server = await Server.findByPk(server_id);
    
    // Buscar nuggets relevantes
    const nuggets = await KnowledgeNugget.findAll({
      where: {
        technology: server.engine_type,
        [Op.or]: [
          {
            applicable_to: {
              [Op.like]: `%${type}%`
            }
          },
          sequelize.literal(`MATCH(title, content) AGAINST('${description}' IN NATURAL LANGUAGE MODE)`)
        ]
      },
      order: [['rating_count', 'DESC'], ['helpful_count', 'DESC']],
      limit: 5
    });
    
    return nuggets;
  }
  
  // Sugerir tips al editar script
  async suggestTipsForScript(scriptData: Partial<Script>) {
    const { language, code, category } = scriptData;
    
    // Extraer keywords del código
    const keywords = this.extractKeywords(code);
    
    const tips = await QuickTip.findAll({
      where: {
        technology: language,
        category: category,
        [Op.or]: keywords.map(keyword => ({
          command: {
            [Op.like]: `%${keyword}%`
          }
        }))
      },
      order: [['usage_count', 'DESC']],
      limit: 10
    });
    
    return tips;
  }
  
  // Sugerir notas relacionadas
  async suggestRelatedNotes(entityType: string, entityId: number) {
    let baseQuery: any = {
      is_archived: false,
      [Op.or]: []
    };
    
    if (entityType === 'incident') {
      const incident = await Incident.findByPk(entityId, {
        include: [{ model: Server }]
      });
      
      baseQuery[Op.or].push(
        { incident_id: entityId },
        { server_id: incident.server_id },
        sequelize.literal(`MATCH(title, content) AGAINST('${incident.title}' IN NATURAL LANGUAGE MODE)`)
      );
    }
    
    const notes = await Note.findAll({
      where: baseQuery,
      order: [['created_at', 'DESC']],
      limit: 5
    });
    
    return notes;
  }
  
  // Generar "Nugget del día"
  async getNuggetOfTheDay() {
    // Usar fecha como seed para consistencia durante el día
    const today = new Date().toISOString().slice(0, 10);
    const seed = this.stringToNumber(today);
    
    const totalNuggets = await KnowledgeNugget.count({
      where: { is_verified: true }
    });
    
    const randomOffset = seed % totalNuggets;
    
    const nugget = await KnowledgeNugget.findOne({
      where: { is_verified: true },
      offset: randomOffset,
      order: [['rating_count', 'DESC']]
    });
    
    return nugget;
  }
  
  // Detectar patrones de usuario para sugerencias
  async analyzeUserPatterns(userId: number) {
    // Analizar actividad de los últimos 90 días
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    // Horarios típicos de actividad
    const executionHistory = await ExecutionHistory.findAll({
      where: {
        executed_by: userId,
        executed_at: {
          [Op.gte]: ninetyDaysAgo
        }
      }
    });
    
    // Agrupar por día de la semana y hora
    const patterns = this.analyzeTimePatterns(executionHistory);
    
    return patterns;
  }
  
  private extractKeywords(code: string): string[] {
    // Extracción básica de keywords SQL
    const keywords = code
      .match(/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|INDEX|JOIN|WHERE|GROUP BY|ORDER BY)\b/gi);
    
    return [...new Set(keywords || [])];
  }
  
  private stringToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
```

#### 4.5.3 Análisis de Aprendizaje

```typescript
// server/src/services/learningAnalytics.service.ts

class LearningAnalyticsService {
  
  // Calcular estadísticas del dashboard
  async calculateDashboardStats(userId: number, period: 'month' | 'year') {
    const startDate = this.getStartDate(period);
    
    // KPIs
    const notesCount = await Note.count({
      where: {
        created_by: userId,
        created_at: { [Op.gte]: startDate }
      }
    });
    
    const nuggetsCount = await KnowledgeNugget.count({
      where: {
        created_by: userId,
        created_at: { [Op.gte]: startDate }
      }
    });
    
    const avgNuggetRating = await KnowledgeNugget.findOne({
      where: {
        created_by: userId,
        rating_count: { [Op.gt]: 0 }
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.literal('rating_sum / rating_count')), 'avg_rating']
      ],
      raw: true
    });
    
    const journalStreak = await this.calculateJournalStreak(userId);
    
    const remindersCompleted = await ReminderHistory.count({
      include: [{
        model: Reminder,
        where: { created_by: userId }
      }],
      where: {
        action_taken: 'completed',
        triggered_at: { [Op.gte]: startDate }
      }
    });
    
    const remindersTotal = await Reminder.count({
      where: {
        created_by: userId,
        scheduled_at: { [Op.gte]: startDate },
        type: 'one_time'
      }
    });
    
    const completionRate = remindersTotal > 0 
      ? (remindersCompleted / remindersTotal * 100).toFixed(1)
      : 0;
    
    return {
      notes_created: notesCount,
      nuggets_contributed: nuggetsCount,
      avg_nugget_rating: avgNuggetRating?.avg_rating || 0,
      journal_streak: journalStreak,
      reminders_completion_rate: completionRate
    };
  }
  
  // Calcular streak de journal
  async calculateJournalStreak(userId: number): Promise<{ current: number, longest: number }> {
    const entries = await JournalEntry.findAll({
      where: { user_id: userId },
      order: [['entry_date', 'DESC']],
      attributes: ['entry_date']
    });
    
    if (entries.length === 0) {
      return { current: 0, longest: 0 };
    }
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    
    // Verificar si hay entrada de hoy o ayer para streak actual
    const latestEntry = entries[0].entry_date.toISOString().slice(0, 10);
    if (latestEntry === today || latestEntry === yesterdayStr) {
      currentStreak = 1;
      
      // Calcular días consecutivos
      for (let i = 1; i < entries.length; i++) {
        const currentDate = entries[i].entry_date;
        const previousDate = entries[i - 1].entry_date;
        const diffDays = this.daysDifference(previousDate, currentDate);
        
        if (diffDays === 1) {
          currentStreak++;
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    } else {
      // Calcular solo longest streak
      for (let i = 1; i < entries.length; i++) {
        const currentDate = entries[i].entry_date;
        const previousDate = entries[i - 1].entry_date;
        const diffDays = this.daysDifference(previousDate, currentDate);
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    
    return { current: currentStreak, longest: longestStreak };
  }
  
  // Actualizar skill tracking automáticamente
  async updateSkillTracking(userId: number) {
    // Por cada categoría de skill
    const categories = [
      'performance_tuning',
      'backup_recovery',
      'security',
      'high_availability',
      'monitoring',
      'scripting',
      'troubleshooting'
    ];
    
    for (const category of categories) {
      // Contar incidentes resueltos relacionados
      const incidentsResolved = await this.countRelatedIncidents(userId, category);
      
      // Contar nuggets contribuidos
      const nuggetsContributed = await this.countRelatedNuggets(userId, category);
      
      // Contar scripts ejecutados
      const scriptsExecuted = await this.countRelatedScripts(userId, category);
      
      // Calcular nivel sugerido
      const suggestedLevel = this.calculateSkillLevel(
        incidentsResolved,
        nuggetsContributed,
        scriptsExecuted
      );
      
      // Actualizar o crear registro
      await SkillTracking.upsert({
        user_id: userId,
        skill_category: category,
        skill_level: suggestedLevel,
        incidents_resolved: incidentsResolved,
        nuggets_contributed: nuggetsContributed,
        scripts_executed: scriptsExecuted,
        last_activity_date: new Date()
      });
    }
  }
  
  private calculateSkillLevel(incidents: number, nuggets: number, scripts: number): string {
    const score = (incidents * 3) + (nuggets * 5) + (scripts * 1);
    
    if (score < 20) return 'novice';
    if (score < 50) return 'competent';
    if (score < 100) return 'proficient';
    return 'expert';
  }
  
  private daysDifference(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  }
}
```

### 4.6 Integración con Electron

#### 4.6.1 Notificaciones del Sistema Operativo

```typescript
// electron/main.ts

import { Notification } from 'electron';

// Handler para mostrar notificaciones nativas
ipcMain.handle('show-notification', async (event, data) => {
  const { title, body, urgency } = data;
  
  const notification = new Notification({
    title,
    body,
    urgency: urgency || 'normal', // low, normal, critical
    icon: path.join(__dirname, '../public/icon.png'),
    sound: 'default'
  });
  
  notification.on('click', () => {
    // Enfocar ventana y navegar a la acción
    if (data.action_url) {
      mainWindow.webContents.send('navigate-to', data.action_url);
      mainWindow.show();
    }
  });
  
  notification.show();
});

// Recordatorios persistentes
ipcMain.handle('schedule-reminder', async (event, reminder) => {
  const { id, scheduled_at } = reminder;
  const delay = new Date(scheduled_at).getTime() - Date.now();
  
  if (delay > 0) {
    setTimeout(() => {
      const notification = new Notification({
        title: `⏰ Recordatorio: ${reminder.title}`,
        body: reminder.description || '',
        urgency: 'critical',
        icon: path.join(__dirname, '../public/icon.png')
      });
      
      notification.on('click', () => {
        mainWindow.webContents.send('open-reminder', reminder.id);
        mainWindow.show();
      });
      
      notification.show();
    }, delay);
  }
});
```

#### 4.6.2 Tray Icon con Recordatorios

```typescript
// electron/main.ts

import { Tray, Menu } from 'electron';

let tray: Tray;
let reminderCount = 0;

function createTray() {
  tray = new Tray(path.join(__dirname, '../public/tray-icon.png'));
  
  updateTrayMenu();
  
  tray.setToolTip('DBA Incident Manager');
  
  tray.on('click', () => {
    mainWindow.show();
  });
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Recordatorios pendientes: ${reminderCount}`,
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Abrir aplicación',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Nueva nota rápida',
      click: () => {
        mainWindow.show();
        mainWindow.webContents.send('open-quick-note');
      }
    },
    { type: 'separator' },
    {
      label: 'Salir',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
}

// Actualizar contador desde renderer
ipcMain.on('update-reminder-count', (event, count) => {
  reminderCount = count;
  updateTrayMenu();
  
  // Cambiar ícono si hay recordatorios pendientes
  if (count > 0) {
    tray.setImage(path.join(__dirname, '../public/tray-icon-alert.png'));
  } else {
    tray.setImage(path.join(__dirname, '../public/tray-icon.png'));
  }
});
```

---

## 5. PLAN DE IMPLEMENTACIÓN

### 5.1 Fase 1: Infraestructura Base (Semana 1)

**Tareas:**
- Crear migraciones de todas las tablas nuevas
- Implementar modelos Sequelize para todas las entidades
- Configurar estructura de directorios frontend/backend
- Implementar componentes base reutilizables:
  - RichTextEditor
  - MarkdownPreview
  - CodeBlock
  - EmojiPicker
- Configurar TipTap para editor de texto rico
- Configurar sistema de notificaciones base

**Entregables:**
- Base de datos con todas las tablas
- Modelos funcionando
- Componentes base listos
- Sistema de notificaciones operativo

### 5.2 Fase 2: Módulo de Sticky Notes (Semana 2-3)

**Tareas:**
- Implementar API endpoints de notas (CRUD completo)
- Crear componente StickyNote con todos los estilos
- Crear StickyNoteForm con validación
- Implementar StickyNoteList con filtros
- Crear widget para dashboard
- Implementar vista Kanban con drag & drop
- Implementar sistema de comentarios
- Implementar sistema de reacciones
- Tests unitarios e integración

**Entregables:**
- CRUD de notas funcional
- Widget en dashboard
- Vista Kanban operativa
- Comentarios y reacciones funcionando

### 5.3 Fase 3: Módulo de Recordatorios (Semana 4-5)

**Tareas:**
- Implementar API endpoints de recordatorios
- Crear ReminderForm con cron builder
- Implementar ReminderScheduler service (backend)
- Configurar node-cron para ejecución
- Crear vista calendario de recordatorios
- Implementar notificaciones en Electron
- Crear sistema de snooze y complete
- Implementar recordatorios recurrentes
- Generar recordatorios inteligentes
- Tests de scheduler

**Entregables:**
- Sistema de recordatorios completo
- Notificaciones funcionando
- Recordatorios recurrentes operativos
- Sugerencias inteligentes activas

### 5.4 Fase 4: Knowledge Nuggets y Tips (Semana 6)

**Tareas:**
- Implementar API de knowledge nuggets
- Crear componentes de nuggets
- Implementar sistema de rating
- Crear biblioteca de nuggets con filtros
- Implementar Quick Tips
- Crear "Tip del día" y "Nugget del día"
- Implementar sugerencias contextuales
- Sistema de comentarios en nuggets
- Tests de sugerencias

**Entregables:**
- Biblioteca de knowledge funcional
- Sistema de rating operativo
- Sugerencias contextuales activas
- Tips integrados

### 5.5 Fase 5: Journal y Lecciones Aprendidas (Semana 7)

**Tareas:**
- Implementar API de journal
- Crear JournalEditor con secciones
- Implementar vista calendario de journal
- Crear timeline y estadísticas
- Implementar lecciones aprendidas
- Integrar lecciones con incidentes
- Crear vista de lecciones agregadas
- Calcular journal streak
- Tests de journal

**Entregables:**
- Diario personal funcional
- Lecciones aprendidas integradas
- Estadísticas de journal
- Streak tracking operativo

### 5.6 Fase 6: Learning Dashboard (Semana 8)

**Tareas:**
- Implementar API de analytics
- Crear dashboard de aprendizaje
- Implementar SkillTracker
- Crear gráfico radar de skills
- Implementar heatmap de actividad
- Calcular KPIs automáticos
- Crear timeline de aprendizaje
- Implementar recomendaciones
- Tests de analytics

**Entregables:**
- Dashboard completo
- Skill tracking automático
- Gráficos interactivos
- Sistema de recomendaciones

### 5.7 Fase 7: Búsqueda y Integración (Semana 9)

**Tareas:**
- Implementar búsqueda global avanzada
- Crear interfaz de búsqueda unificada
- Integrar notas en módulo de incidentes
- Integrar notas en módulo de servidores
- Integrar notas en módulo de scripts
- Implementar sugerencias en todos los módulos
- Crear panel contextual lateral
- Tests de búsqueda

**Entregables:**
- Búsqueda global funcional
- Integración con todos los módulos
- Panel contextual operativo
- Sugerencias en tiempo real

### 5.8 Fase 8: Colaboración y Compartir (Semana 10)

**Tareas:**
- Implementar sistema de mentions (@usuario)
- Crear notificaciones de mentions
- Implementar compartir notas
- Sistema de permisos para notas compartidas
- Crear centro de notificaciones
- Implementar export/import
- Tests de colaboración

**Entregables:**
- Sistema de mentions funcional
- Compartir notas operativo
- Centro de notificaciones completo
- Export/import funcionando

### 5.9 Fase 9: Configuración y Preferencias (Semana 11)

**Tareas:**
- Crear página de configuración del módulo
- Implementar preferencias de notas
- Implementar preferencias de recordatorios
- Configuración de dashboard personalizable
- Plantillas personalizadas
- Atajos de teclado configurables
- Tests de configuración

**Entregables:**
- Configuración completa
- Preferencias personalizables
- Plantillas funcionando

### 5.10 Fase 10: Testing y Optimización (Semana 12)

**Tareas:**
- Completar cobertura de tests (>70%)
- Tests end-to-end de flujos principales
- Optimizar queries de búsqueda
- Optimizar rendimiento de dashboard
- Auditoría de seguridad
- Corrección de bugs
- Documentación de usuario
- Documentación técnica

**Entregables:**
- Tests completos
- Performance optimizado
- Seguridad auditada
- Documentación completa

---

## 6. CONSIDERACIONES ADICIONALES

### 6.1 Privacidad y Seguridad

#### Datos Sensibles
- Journal entries siempre privados
- Notas privadas encriptadas en reposo
- No indexar contenido privado en búsqueda global
- Logs de auditoría para acceso a notas confidenciales
- Opción de "modo confidencial" para notas sensibles

#### Control de Acceso
- Notas compartidas según roles
- Admin puede auditar pero no editar notas privadas
- Permisos granulares para colaboración
- Registro de todos los accesos a notas compartidas

### 6.2 Performance y Escalabilidad

#### Optimizaciones Necesarias
- Índices full-text en todas las tablas de contenido
- Paginación virtual en listas largas (>1000 items)
- Lazy loading de contenido rico
- Cache de búsquedas frecuentes (Redis en futuro)
- Compresión de contenido antiguo
- Archive automático de notas viejas

#### Límites Razonables
- Máximo 10,000 notas activas por usuario
- Máximo 1,000 recordatorios activos
- Auto-archivo de notas después de 1 año sin actividad
- Limpieza automática de notificaciones antiguas

### 6.3 UX y Usabilidad

#### Atajos de Teclado
- `Ctrl+Shift+N`: Nueva nota rápida
- `Ctrl+K`: Búsqueda global
- `Ctrl+J`: Abrir journal de hoy
- `Ctrl+R`: Ver recordatorios
- `Ctrl+/`: Ver atajos disponibles

#### Workflows Optimizados
- Crear nota desde cualquier vista (floating button)
- Arrastrar texto/código directamente a nota nueva
- Quick capture desde incidente
- Templates de uso frecuente
- Auto-guardado cada 30 segundos

#### Feedback Visual
- Loading states claros
- Confirmaciones de acciones
- Progress indicators
- Toast notifications no intrusivas
- Animaciones suaves

### 6.4 Extensibilidad Futura

#### Preparación para Futuras Features
- Sistema de plugins para tipos de nota personalizados
- API REST documentada para integraciones
- Webhooks para eventos importantes
- Export masivo en formatos estándar
- Importación desde otras herramientas

#### Posibles Extensiones
- Integración con Confluence/Notion
- Sincronización entre dispositivos (cloud)
- App móvil complementaria
- Integración con GitHub para snippets
- AI para categorización automática
- Transcripción de voz a texto

### 6.5 Mantenibilidad

#### Código Limpio
- Componentes pequeños y reutilizables
- Separación de concerns
- Tests de cada feature crítica
- Documentación inline
- TypeScript estricto

#### Monitoreo
- Logs de errores en operaciones críticas
- Métricas de uso de features
- Performance monitoring
- Error tracking (Sentry en futuro)

### 6.6 Migración y Retrocompatibilidad

#### Plan de Migración
- Script de migración para datos existentes
- Validación post-migración
- Rollback plan
- Documentación de cambios en BD

#### Compatibilidad
- No romper funcionalidad existente
- Módulo completamente opcional
- Desactivable sin afectar core

---

## 7. MÉTRICAS DE ÉXITO

### 7.1 Métricas de Adopción

- **Tasa de activación**: % de usuarios que crean al menos una nota en primera semana
- **Engagement**: Promedio de notas/nuggets creados por usuario al mes
- **Retención**: % de usuarios que usan journal al menos 3 veces/semana
- **Uso de recordatorios**: Promedio de recordatorios activos por usuario

### 7.2 Métricas de Valor

- **Reducción en tiempo de resolución**: Por uso de nuggets sugeridos
- **Aumento en documentación**: % de incidentes con lecciones aprendidas
- **Reuso de conocimiento**: Veces que nuggets son marcados como útiles
- **Completitud**: % de journal entries en últimos 30 días

### 7.3 Métricas Técnicas

- **Performance**: Tiempo de carga de dashboard <2s
- **Disponibilidad**: Uptime del sistema de notificaciones >99%
- **Calidad**: Cobertura de tests >70%
- **Bugs**: Tasa de bugs críticos <1 por release

---

## 8. GLOSARIO

- **Sticky Note**: Nota adhesiva digital para captura rápida
- **Knowledge Nugget**: Pieza de conocimiento reutilizable y categorizada
- **TIL**: Today I Learned - Micro-aprendizaje diario
- **Gotcha**: Error común o trampa que suele ocurrir
- **Quick Tip**: Comando o tip de uso rápido
- **Journal**: Diario personal del DBA
- **Lesson Learned**: Lección aprendida post-incidente
- **Skill Tracking**: Seguimiento de habilidades técnicas
- **Smart Reminder**: Recordatorio generado automáticamente por el sistema
- **Contextual Suggestion**: Sugerencia basada en contexto actual
- **Kanban Column**: Columna en vista tipo Kanban
- **Mention**: Mención de usuario con @usuario
- **Streak**: Racha de días consecutivos con actividad

---

## 9. ANEXOS

### 9.1 Ejemplos de Uso

#### Caso de Uso 1: Captura Rápida Durante Incidente

**Escenario**: DBA trabajando en incidente crítico de producción

1. Usuario presiona `Ctrl+Shift+N` durante investigación
2. Se abre floating form de nota rápida
3. Usuario escribe observación: "El deadlock ocurre cuando proceso A y B compiten por tabla X"
4. Selecciona color rojo (crítico)
5. Vincula a incidente actual automáticamente
6. Presiona Enter para guardar
7. Nota se guarda y aparece en panel lateral
8. Usuario continúa trabajando sin interrupciones
9. Al resolver, revisa todas las notas del incidente
10. Convierte mejor nota en Knowledge Nugget para futuro

#### Caso de Uso 2: Recordatorio Inteligente

**Escenario**: Sistema detecta patrón recurrente

1. Sistema detecta que script de limpieza se ejecuta cada viernes
2. Genera recordatorio sugerido: "¿Crear recordatorio para script de limpieza?"
3. Usuario acepta sugerencia
4. Sistema crea recordatorio recurrente (cada viernes 10 AM)
5. Usuario recibe notificación cada viernes
6. Notificación incluye quick action "Ejecutar script"
7. Usuario hace clic en quick action
8. Script se ejecuta directamente
9. Recordatorio se marca como completado
10. Se programa automáticamente para siguiente viernes

#### Caso de Uso 3: Dashboard de Aprendizaje

**Escenario**: DBA revisa su evolución trimestral

1. Usuario navega a Learning Dashboard
2. Ve gráfico de evolución: 45 notas este mes (+15 vs mes anterior)
3. Skill radar muestra progreso en Performance Tuning (de Competent a Proficient)
4. Timeline muestra hitos: 5 nuggets verificados por seniors
5. Heatmap de journal muestra streak de 21 días
6. Recomendaciones sugieren: "Aprender más sobre High Availability"
7. Usuario hace clic en recomendación
8. Sistema muestra nuggets y recursos sobre HA
9. Usuario crea meta personal en skill tracker
10. Dashboard se actualiza con nueva meta

### 9.2 Wireframes Conceptuales

#### Widget de Notas en Dashboard
```
┌─────────────────────────────────┐
│ 📌 Mis Notas            [+] [⚙️] │
├─────────────────────────────────┤
│ 🟥 CRÍTICO: Deadlock en prod   │
│    Vinculado a: Incidente #234 │
│    Hace 2 horas                 │
├─────────────────────────────────┤
│ 🟨 Revisar logs de replica     │
│    Vinculado a: Servidor prod  │
│    Hace 5 horas                 │
├─────────────────────────────────┤
│ 🟦 Tip: Usar EXPLAIN ANALYZE   │
│    Sin vincular                 │
│    Ayer                         │
├─────────────────────────────────┤
│          Ver todas (23) →       │
└─────────────────────────────────┘
```

#### Vista Kanban de Notas
```
┌────────────┬────────────┬────────────┬────────────┐
│ Para       │ En         │ Completado │ Archivo    │
│ Revisar (5)│ Progreso(3)│ (12)       │ (45)       │
├────────────┼────────────┼────────────┼────────────┤
│ 🟥 Note 1  │ 🟨 Note 4  │ 🟢 Note 7  │ ⚪ Note 10 │
│ [Server A] │ [Inc #123] │ [Script X] │ [Old]      │
│            │            │            │            │
│ 🟦 Note 2  │ 🟨 Note 5  │ 🟢 Note 8  │            │
│ [Personal] │ [Server B] │ [Inc #100] │            │
│            │            │            │            │
│ 🟨 Note 3  │ 🟥 Note 6  │ 🟢 Note 9  │            │
│ [Inc #234] │ [Urgent]   │ [Done]     │            │
│            │            │            │            │
│ + Nueva    │            │            │            │
└────────────┴────────────┴────────────┴────────────┘
```

#### Panel de Recordatorios
```
┌─────────────────────────────────────────────┐
│ ⏰ Recordatorios Hoy - Miércoles 18 Dic     │
├─────────────────────────────────────────────┤
│ ⚠️ VENCIDOS (2)                             │
│                                             │
│ 🔴 10:00 AM - Backup de producción         │
│    [Completar] [Snooze 1h] [Abrir]         │
│                                             │
│ 🟠 11:30 AM - Revisar logs de ayer         │
│    [Completar] [Snooze 1h] [Abrir]         │
│                                             │
├─────────────────────────────────────────────┤
│ 📅 PRÓXIMOS (4)                             │
│                                             │
│ 🟡 02:00 PM - Call con equipo de QA        │
│ 🟢 04:00 PM - Ejecutar script limpieza     │
│ 🔵 05:30 PM - Revisar incidentes del día   │
│ ⚪ 06:00 PM - Actualizar journal            │
│                                             │
├─────────────────────────────────────────────┤
│ 🔁 RECURRENTES                              │
│ • Backup semanal (cada Lunes 6 AM)         │
│ • Optimizar índices (cada mes, día 1)      │
│ • Review de seguridad (cada trimestre)     │
│                                             │
└─────────────────────────────────────────────┘
```

#### Learning Dashboard
```
┌───────────────────────────────────────────────────────┐
│ 📊 Mi Dashboard de Aprendizaje - Diciembre 2024      │
├───────────────────────────────────────────────────────┤
│ KPIs                                                  │
│ ┌─────────┐┌─────────┐┌─────────┐┌─────────┐        │
│ │ Notas   ││ Nuggets ││ Journal ││ Rating  │        │
│ │   45    ││    8    ││  21 🔥  ││  4.2⭐  │        │
│ │ (+15)   ││  (+3)   ││ streak  ││ avg     │        │
│ └─────────┘└─────────┘└─────────┘└─────────┘        │
├───────────────────────────────────────────────────────┤
│ Skills Radar                    Timeline              │
│     Performance                 ┌──────────────────┐ │
│        /\                       │ Nov: 5 nuggets   │ │
│       /  \                      │ verificados      │ │
│      /    \                     ├──────────────────┤ │
│   HA ────── Security            │ Dic: Proficient  │ │
│      \    /                     │ en Performance   │ │
│       \  /                      ├──────────────────┤ │
│     Backup                      │ Meta: Aprender   │ │
│                                 │ High Availability│ │
│                                 └──────────────────┘ │
└───────────────────────────────────────────────────────┘
```

---

**Versión del Documento**: 1.0  
**Fecha**: Diciembre 2024  
**Autor**: Equipo de Desarrollo - Knowledge Management Module  
**Estado**: Aprobado para Desarrollo  
**Documento Base**: DBA Incident Manager - Sistema Principal
