const { contextBridge, ipcRenderer } = require('electron');

type UpdateStatusCallback = (data: { type: string; percent?: number; info?: any; message?: string }) => void;

contextBridge.exposeInMainWorld('electronApp', {
  isElectron: true,
  platform: process.platform,
  version: process.versions.electron,
  backendUrl: process.env.ELECTRON_BACKEND_URL || '',

  onUpdateStatus: (callback: UpdateStatusCallback) => {
    ipcRenderer.on('update-status', (_event: any, data: any) => callback(data));
  },

  installUpdate: () => {
    ipcRenderer.invoke('install-update');
  },
});
