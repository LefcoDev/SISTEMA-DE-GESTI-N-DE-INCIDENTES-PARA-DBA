import path from 'path';
import fs from 'fs';

/**
 * Script de inicialización para copiar el avatar por defecto
 * Este script copia la imagen por defecto desde la carpeta public
 * a la carpeta de uploads/avatars
 */
export function initDefaultAvatar(): void {
  try {
    // Ruta de la imagen por defecto en public
    const sourcePath = path.join(__dirname, '../../../public/default-avatar.png');
    
    // Directorio de destino
    const uploadDir = process.env.UPLOAD_DIR 
      ? path.join(process.env.UPLOAD_DIR, 'avatars')
      : path.join(__dirname, '../../../server/uploads/avatars');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✓ Directorio de avatares creado:', uploadDir);
    }
    
    // Ruta de destino
    const destPath = path.join(uploadDir, 'default-avatar.png');
    
    // Copiar solo si no existe ya
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log('✓ Avatar por defecto copiado a:', destPath);
    } else {
      console.log('✓ Avatar por defecto ya existe en:', destPath);
    }
  } catch (error) {
    console.error('Error inicializando avatar por defecto:', error);
    // No lanzar error para no detener la aplicación
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  initDefaultAvatar();
}
