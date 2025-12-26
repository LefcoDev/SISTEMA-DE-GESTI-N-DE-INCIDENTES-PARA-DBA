import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

const VALID_INVOKES = ['download-update', 'install-update', 'check-for-updates', 'ping', 'show-notification'];
const VALID_ON = ['update-available', 'download-progress', 'update-downloaded', 'update-error', 'update-status'];

contextBridge.exposeInMainWorld('electron', {
  ping: () => ipcRenderer.invoke('ping'),

  showNotification: (options: { title: string; body: string; urgency?: 'low' | 'normal' | 'critical' }) =>
    ipcRenderer.invoke('show-notification', options),

  // Controlled invoke: only allow specific channels
  invoke: (channel: string, ...args: any[]) => {
    if (!VALID_INVOKES.includes(channel)) {
      return Promise.reject(new Error(`Channel not allowed: ${channel}`));
    }
    return ipcRenderer.invoke(channel, ...args);
  },

  // Controlled on: only allow specific event channels and return an unsubscribe function
  on: (channel: string, callback: (...args: any[]) => void) => {
    if (!VALID_ON.includes(channel)) {
      // return noop unsubscribe
      return () => {};
    }
    const subscription = (_event: IpcRendererEvent, ...args: any[]) => callback(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },

  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
});
