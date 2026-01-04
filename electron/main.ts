import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import fs from 'fs';
import log from 'electron-log';

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Configure auto-updater for silent background updates
autoUpdater.autoDownload = false; // Manual download after user confirmation
autoUpdater.autoInstallOnAppQuit = false; // Don't auto-install on quit
autoUpdater.allowPrerelease = false;
autoUpdater.fullChangelog = true;

// Force update check settings
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour

// Update check interval reference
let updateCheckInterval: NodeJS.Timeout | null = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

// Handle notifications
ipcMain.handle('show-notification', async (_event, { title, body, urgency }) => {
  if (!Notification.isSupported()) {
    console.error('Notifications are not supported on this system');
    return { success: false, error: 'Notifications not supported' };
  }

  try {
    const notification = new Notification({
      title,
      body,
      urgency: urgency || 'normal', // low, normal, critical
      icon: path.join(__dirname, '../icon/base-de-datos.ico'),
      sound: 'default'
    });

    notification.on('click', () => {
      // Focus the main window when notification is clicked
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      }
    });

    notification.show();
    return { success: true };
  } catch (error) {
    console.error('Error showing notification:', error);
    return { success: false, error: String(error) };
  }
});

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../icon/base-de-datos.ico'),
    autoHideMenuBar: true
  });

  // Remove menu bar completely
  mainWindow.setMenuBarVisibility(false);

  // and load the index.html of the app.
  // In development, we wait for the vite server to be ready
  // The package.json script handles the wait-on, but we should ensure we try to load the URL
  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    mainWindow.webContents.openDevTools(); // Habilitar DevTools en producción para debugging
  }
};

// Start backend server
const startServer = () => {
  if (app.isPackaged) {
    console.log('=== STARTING SERVER IN PACKAGED MODE ===');
    try {
      // Set environment variables for the server
      process.env.NODE_ENV = 'production';
      process.env.PORT = '3001';
      
      // Setup user data paths
      const userDataPath = app.getPath('userData');
      const logDir = path.join(userDataPath, 'logs');
      const uploadDir = path.join(userDataPath, 'uploads');
      const backupDir = path.join(userDataPath, 'backups');
      
      console.log('User data path:', userDataPath);
      
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
      
      process.env.LOG_DIR = logDir;
      process.env.UPLOAD_DIR = uploadDir;
      process.env.BACKUP_DIR = backupDir;
      
      // Load .env file from resources (editable by user)
      const envPath = path.join(process.resourcesPath, '.env');
      log.info('Loading .env from:', envPath);
      if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
        log.info('.env loaded successfully');
      } else {
        log.warn('.env file not found at:', envPath);
      }
      
      // Import and run the server from ASAR (require works fine with ASAR)
      const serverPath = path.join(__dirname, '../server/dist/index.js');
      log.info('Loading server from:', serverPath);
      
      require(serverPath);
      
      console.log('=== SERVER LOADED SUCCESSFULLY ===');
      log.info('Server started successfully on port 3001');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      console.error('=== ERROR STARTING SERVER ===');
      console.error('Error:', errorMessage);
      console.error('Stack:', errorStack);
      log.error('Error starting server:', error);
      
      // Show error in dialog after window is created
      setTimeout(() => {
        if (mainWindow) {
          const safeMessage = JSON.stringify(errorMessage);
          mainWindow.webContents.executeJavaScript(`
            console.error('SERVER ERROR:', ${safeMessage});
            alert('Error al iniciar el servidor:\\n\\n' + ${safeMessage} + '\\n\\nRevisa la consola para más detalles.');
          `);
        }
      }, 6000);
    }
  } else {
    console.log('=== DEVELOPMENT MODE - Server should be started manually ===');
  }
};

// Stop backend server
const stopServer = () => {
  // Server runs in the same process, will close with app
  console.log('App closing, server will terminate with process');
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  // Start server first
  startServer();
  
  // Wait longer for server to fully start
  setTimeout(() => {
    createWindow();
  }, 5000);

  // Check for updates (only in production)
  if (app.isPackaged) {
    // Check after 30 seconds to ensure everything is loaded
    setTimeout(() => {
      checkForUpdates();
    }, 30000);
    
    // Then check every hour
    updateCheckInterval = setInterval(() => {
      checkForUpdates();
    }, UPDATE_CHECK_INTERVAL);
  }

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopServer();
  // Clear update check interval
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }
});

// IPC Handlers will be added here

// Auto-updater functions
function checkForUpdates() {
  try {
    autoUpdater.checkForUpdates().catch(err => {
      console.error('Failed to check for updates:', err);
    });
  } catch (err) {
    console.error('Failed to initiate update check:', err);
  }
}

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for updates...');
  if (mainWindow) {
    mainWindow.webContents.send('update-status', 'checking');
  }
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', {
      version: info.version,
      releaseNotes: info.releaseNotes,
      releaseDate: info.releaseDate,
    });
    mainWindow.webContents.send('update-status', 'available');
  }
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', 'not-available');
  }
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err.message);
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`;
  log.info(message);
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
    mainWindow.webContents.send('update-status', 'downloaded');
  }
});

// IPC handlers for update
ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    console.error('Error downloading update:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('install-update', () => {
  try {
    log.info('Installing update and restarting app...');
    // Force immediate restart and update
    // isSilent = true (no confirmation dialogs)
    // isForceRunAfter = true (restart after install)
    setImmediate(() => {
      autoUpdater.quitAndInstall(true, true);
    });
    return { success: true };
  } catch (error) {
    log.error('Error installing update:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return { success: false, error: String(error) };
  }
});
