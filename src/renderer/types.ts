export interface Source {
  id: string
  name: string
  thumbnail: string
}

export interface Permissions {
  screen: boolean
  microphone: boolean
}

export interface ElectronAPI {
  getSources: () => Promise<Source[]>
  checkPermissions: () => Promise<Permissions>
  saveRecording: (buffer: ArrayBuffer, format: 'mp4' | 'mov') => Promise<string | null>
  minimizeWindow: () => void
  closeWindow: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
