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
