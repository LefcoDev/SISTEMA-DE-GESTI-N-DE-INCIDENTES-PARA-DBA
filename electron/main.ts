import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import path from 'path';

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
      icon: path.join(__dirname, '../public/icon.png'),
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
    icon: path.join(__dirname, '../public/icon.png')
  });

  // and load the index.html of the app.
  // In development, we wait for the vite server to be ready
  // The package.json script handles the wait-on, but we should ensure we try to load the URL
  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();

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
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers will be added here
