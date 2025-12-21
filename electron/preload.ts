import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // Add IPC methods here
  ping: () => ipcRenderer.invoke('ping'),
  
  // Notification API
  showNotification: (options: { title: string; body: string; urgency?: 'low' | 'normal' | 'critical' }) => 
    ipcRenderer.invoke('show-notification', options),
  
  // Update API
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  on: (channel: string, callback: (...args: any[]) => void) => {
    const subscription = (_event: IpcRendererEvent, ...args: any[]) => callback(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
});
