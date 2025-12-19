import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // Add IPC methods here
  ping: () => ipcRenderer.invoke('ping'),
  
  // Notification API
  showNotification: (options: { title: string; body: string; urgency?: 'low' | 'normal' | 'critical' }) => 
    ipcRenderer.invoke('show-notification', options),
});
