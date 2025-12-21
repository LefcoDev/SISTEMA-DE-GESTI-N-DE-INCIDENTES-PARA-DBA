# 🚀 Guía de Empaquetado y Actualizaciones

## 📦 Empaquetar la Aplicación

### Windows
```bash
npm run build
npm run build:win
```

Esto generará el instalador en `release/DBA Incident Manager Setup 1.0.0.exe`

### macOS
```bash
npm run build
npm run build:mac
```

### Linux
```bash
npm run build
npm run build:linux
```

## 🔄 Sistema de Auto-Actualización

La aplicación incluye un sistema de auto-actualización usando `electron-updater` que permite distribuir actualizaciones sin que los usuarios tengan que reinstalar manualmente.

### Configuración Inicial

1. **Crear un repositorio en GitHub** para tu aplicación
2. **Actualizar el package.json** con tu información de GitHub:
   ```json
   "build": {
     "win": {
       "publish": [{
         "provider": "github",
         "owner": "tu-usuario-github",
         "repo": "nombre-repositorio"
       }]
     }
   }
   ```

3. **Generar un Personal Access Token** en GitHub:
   - Ve a GitHub → Settings → Developer settings → Personal access tokens
   - Genera un token con permisos `repo`
   - Guárdalo de forma segura

### Publicar una Nueva Versión

1. **Actualizar versión en package.json**:
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. **Compilar y publicar**:
   ```bash
   # Establecer el token de GitHub
   set GH_TOKEN=tu_token_aquí
   
   # Compilar y publicar
   npm run build
   npm run build:win
   ```

3. **El instalador se subirá automáticamente** a GitHub Releases

### Cómo Funciona

1. Al iniciar, la app verifica si hay actualizaciones disponibles
2. Si hay una actualización:
   - Aparece una notificación en la esquina inferior derecha
   - El usuario puede descargarla inmediatamente o ignorarla
3. Durante la descarga, se muestra el progreso
4. Una vez descargada, se ofrece reiniciar para instalar
5. La actualización se instala automáticamente al cerrar

### Alternativa: Servidor Propio

Si prefieres no usar GitHub, puedes configurar tu propio servidor:

```json
"build": {
  "win": {
    "publish": [{
      "provider": "generic",
      "url": "https://tu-servidor.com/updates"
    }]
  }
}
```

Estructura del servidor:
```
/updates/
  ├── latest.yml          # Archivo de metadatos
  └── DBA-Incident-Manager-Setup-1.0.1.exe
```

### Desactivar Auto-Actualización

Para desarrollo local, las actualizaciones solo se verifican en producción (`app.isPackaged = true`).

## 🎨 Ícono de la Aplicación

El ícono se encuentra en: `icon/base-de-datos.ico`

Para cambiar el ícono:
1. Reemplaza el archivo `icon/base-de-datos.ico`
2. Recompila la aplicación

## 📝 Notas Importantes

- **Firma de código**: En producción, firma tu aplicación para evitar advertencias de seguridad
- **Versiones**: Usa versionado semántico (1.0.0, 1.0.1, 1.1.0, 2.0.0)
- **Release notes**: Agrega notas de versión en GitHub Releases para informar cambios
- **Testing**: Prueba cada versión antes de publicarla

## 🔐 Firma de Código (Opcional pero Recomendado)

Para Windows, obtén un certificado de firma de código:
```json
"win": {
  "certificateFile": "path/to/certificate.pfx",
  "certificatePassword": "password"
}
```

## 📊 Monitoreo de Actualizaciones

Los logs de actualización se guardan en:
- **Windows**: `%USERPROFILE%\AppData\Roaming\DBA Incident Manager\logs\`
- **macOS**: `~/Library/Logs/DBA Incident Manager/`
- **Linux**: `~/.config/DBA Incident Manager/logs/`

## 🆘 Solución de Problemas

### La actualización no se detecta
- Verifica que la versión en package.json sea mayor
- Revisa que el archivo `latest.yml` esté en GitHub Releases
- Comprueba los logs de Electron

### Error al descargar
- Verifica tu conexión a internet
- Asegúrate de que GitHub Releases sea público
- Revisa los permisos del token de GitHub

### La aplicación no se actualiza después de reiniciar
- Verifica permisos de escritura en la carpeta de instalación
- En Windows, ejecuta como administrador si es necesario
