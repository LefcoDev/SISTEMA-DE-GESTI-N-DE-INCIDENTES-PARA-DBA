# Instrucciones de Publicación (Release)

Para que las actualizaciones automáticas funcionen correctamente, es CRÍTICO seguir estos pasos para publicar la nueva versión.

## 1. Requisitos Previos

Necesitas un **GitHub Personal Access Token** con permisos de `repo`.
1. Ve a [GitHub Tokens](https://github.com/settings/tokens).
2. Genera uno nuevo (Classic).
3. Selecciona el scope `repo`.
4. Copia el token.

## 2. Preparar la Versión

Asegúrate de que `package.json` tenga la versión correcta (ej. `1.0.10`).

## 3. Compilar y Publicar

Abre tu terminal (PowerShell) en la carpeta del proyecto y ejecuta:

```powershell
# Reemplaza 'ghp_...' con tu token real
$env:GH_TOKEN="ghp_TU_TOKEN_AQUI"

# Compilar y subir a GitHub Releases
npm run build:win
```

> **NOTA:** Si usas CMD en lugar de PowerShell, usa `set GH_TOKEN=ghp_...`

## 4. Verificar

1. Ve a la pestaña **Releases** de tu repositorio en GitHub.
2. Deberías ver un "Draft" o una nueva Release.
3. Verifica que existan estos archivos:
   - `DBA Incident Manager Setup 1.0.10.exe`
   - `latest.yml` (¡ESTE ES EL MÁS IMPORTANTE!)

Si `latest.yml` no está, la auto-actualización NO funcionará.

## 5. Publicar

Edita el Release en GitHub, añade tus notas de cambio y haz clic en **"Publish release"**.
