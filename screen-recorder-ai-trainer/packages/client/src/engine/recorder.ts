import { RecordingConfig } from '@shared/types/recording';

export type RecorderState = 'idle' | 'requesting' | 'recording' | 'paused' | 'stopping' | 'error';

export interface RecorderEvents {
  onStateChange: (state: RecorderState) => void;
  onDataAvailable: (blob: Blob) => void;
  onError: (error: Error) => void;
  onDurationUpdate: (durationMs: number) => void;
}

export class ScreenRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private state: RecorderState = 'idle';
  private startTime: number = 0;
  private pausedDuration: number = 0;
  private pauseStart: number = 0;
  private durationInterval: number | null = null;
  private events: Partial<RecorderEvents> = {};

  constructor(events?: Partial<RecorderEvents>) {
    if (events) this.events = events;
  }

  getState(): RecorderState {
    return this.state;
  }

  private setState(newState: RecorderState) {
    this.state = newState;
    this.events.onStateChange?.(newState);
  }

  private getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return 'video/webm';
  }

  async start(config: RecordingConfig): Promise<string> {
    if (this.state !== 'idle') {
      throw new Error(`Cannot start recording in state: ${this.state}`);
    }

    this.setState('requesting');
    this.chunks = [];

    try {
      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: {
          displaySurface: config.captureMode === 'screen' ? 'monitor' :
                         config.captureMode === 'window' ? 'window' : 'browser',
          frameRate: config.frameRate ?? 30,
          ...(config.resolution ? {
            width: { ideal: config.resolution.width },
            height: { ideal: config.resolution.height },
          } : {}),
        } as any,
        audio: config.captureSystemAudio,
      };

      this.mediaStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

      // Add microphone audio if requested
      if (config.captureAudio) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStream.getAudioTracks().forEach(track => {
            this.mediaStream!.addTrack(track);
          });
        } catch {
          console.warn('Microphone access denied, continuing without mic audio');
        }
      }

      const mimeType = config.codec || this.getSupportedMimeType();

      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: mimeType });
        this.events.onDataAvailable?.(blob);
        this.cleanup();
        this.setState('idle');
      };

      this.mediaRecorder.onerror = () => {
        this.events.onError?.(new Error('MediaRecorder error'));
        this.cleanup();
        this.setState('error');
      };

      // Handle user stopping the share via browser UI
      // Use the onstop handler above (via onDataAvailable) so data is not lost
      this.mediaStream.getVideoTracks()[0].onended = () => {
        if (this.state === 'recording' || this.state === 'paused') {
          this.setState('stopping');
          if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
          }
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second
      this.startTime = Date.now();
      this.pausedDuration = 0;

      // Start duration tracking
      this.durationInterval = window.setInterval(() => {
        if (this.state === 'recording') {
          const elapsed = Date.now() - this.startTime - this.pausedDuration;
          this.events.onDurationUpdate?.(elapsed);
        }
      }, 100);

      this.setState('recording');
      return mimeType;
    } catch (error) {
      this.cleanup();
      this.setState('idle');
      throw error;
    }
  }

  pause() {
    if (this.state !== 'recording' || !this.mediaRecorder) return;
    this.mediaRecorder.pause();
    this.pauseStart = Date.now();
    this.setState('paused');
  }

  resume() {
    if (this.state !== 'paused' || !this.mediaRecorder) return;
    this.mediaRecorder.resume();
    this.pausedDuration += Date.now() - this.pauseStart;
    this.setState('recording');
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || (this.state !== 'recording' && this.state !== 'paused')) {
        reject(new Error('Not recording'));
        return;
      }

      this.setState('stopping');

      const mimeType = this.mediaRecorder.mimeType;
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: mimeType });
        this.events.onDataAvailable?.(blob);
        this.cleanup();
        this.setState('idle');
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup() {
    if (this.durationInterval !== null) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.mediaRecorder = null;
  }

  /** Capture a screenshot from the current video track */
  async captureScreenshot(): Promise<string | null> {
    if (!this.mediaStream) return null;
    const videoTrack = this.mediaStream.getVideoTracks()[0];
    if (!videoTrack) return null;

    try {
      const imageCapture = new (window as any).ImageCapture(videoTrack);
      const bitmap = await imageCapture.grabFrame();
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(bitmap, 0, 0);
      return canvas.toDataURL('image/jpeg', 0.7);
    } catch {
      return null;
    }
  }

  getDuration(): number {
    if (this.state === 'idle') return 0;
    const currentPause = this.state === 'paused' ? (Date.now() - this.pauseStart) : 0;
    return Date.now() - this.startTime - this.pausedDuration - currentPause;
  }
}
