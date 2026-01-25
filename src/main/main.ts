import { app, BrowserWindow, ipcMain, desktopCapturer, dialog, systemPreferences } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// Get available screens/windows for capture
ipcMain.handle('get-sources', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['window', 'screen'],
    thumbnailSize: { width: 150, height: 150 }
  })

  return sources.map(source => ({
    id: source.id,
    name: source.name,
    thumbnail: source.thumbnail.toDataURL()
  }))
})

// Check and request permissions (macOS)
ipcMain.handle('check-permissions', async () => {
  if (process.platform === 'darwin') {
    const screenAccess = systemPreferences.getMediaAccessStatus('screen')
    const micAccess = systemPreferences.getMediaAccessStatus('microphone')

    if (micAccess !== 'granted') {
      await systemPreferences.askForMediaAccess('microphone')
    }

    return {
      screen: screenAccess === 'granted',
      microphone: micAccess === 'granted'
    }
  }
  return { screen: true, microphone: true }
})

// Save recording
ipcMain.handle('save-recording', async (_, buffer: ArrayBuffer, format: 'mp4' | 'mov') => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: `recording-${Date.now()}.${format}`,
    filters: [
      { name: 'Video', extensions: [format] }
    ]
  })

  if (filePath) {
    fs.writeFileSync(filePath, Buffer.from(buffer))
    return filePath
  }
  return null
})

// Window controls
ipcMain.on('minimize-window', () => mainWindow?.minimize())
ipcMain.on('close-window', () => mainWindow?.close())
