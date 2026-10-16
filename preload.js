const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  saveBackup: (data) => ipcRenderer.invoke('save-backup', data),
  getBackupPath: () => ipcRenderer.invoke('get-backup-path'),
  wa: {
    init:   ()             => ipcRenderer.invoke('wa-init'),
    status: ()             => ipcRenderer.invoke('wa-status'),
    send:   (phone, msg)   => ipcRenderer.invoke('wa-send', { phone, message: msg }),
    logout: ()             => ipcRenderer.invoke('wa-logout'),
    onQR:     (cb) => { ipcRenderer.removeAllListeners('wa-qr');     ipcRenderer.on('wa-qr',     (_e, qr) => cb(qr)); },
    onStatus: (cb) => { ipcRenderer.removeAllListeners('wa-status'); ipcRenderer.on('wa-status', (_e, st) => cb(st)); }
  }
})
