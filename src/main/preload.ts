import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getSources: () => ipcRenderer.invoke('get-sources'),
  checkPermissions: () => ipcRenderer.invoke('check-permissions'),
  saveRecording: (buffer: ArrayBuffer, format: 'mp4' | 'mov') =>
    ipcRenderer.invoke('save-recording', buffer, format),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window')
})
