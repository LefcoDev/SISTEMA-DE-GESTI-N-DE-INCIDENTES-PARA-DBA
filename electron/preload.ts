import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // Add IPC methods here
  ping: () => ipcRenderer.invoke('ping'),
});
