import { useState, useRef, useCallback } from 'react'

type RecordingState = 'idle' | 'recording' | 'paused'

function App() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [duration, setDuration] = useState(0)
  const [includeAudio, setIncludeAudio] = useState(true)
  const [includeMic, setIncludeMic] = useState(true)
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startRecording = useCallback(async () => {
    try {
      // Request screen capture with system audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: includeAudio
      })

      // Combine streams
      const tracks = [...displayStream.getTracks()]

      // Add microphone if enabled
      if (includeMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true
            }
          })
          tracks.push(...micStream.getAudioTracks())
        } catch (e) {
          console.warn('Microphone not available:', e)
        }
      }

      const combinedStream = new MediaStream(tracks)
      setPreviewStream(combinedStream)

      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream
      }

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm'

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 5000000
      })

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        downloadRecording(blob)
        chunksRef.current = []
        combinedStream.getTracks().forEach(track => track.stop())
        setPreviewStream(null)
      }

      // Handle when user stops sharing via browser UI
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording()
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000)
      setRecordingState('recording')

      // Start timer
      timerRef.current = window.setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }, [includeAudio, includeMic])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      setRecordingState('paused')
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume()
      setRecordingState('recording')
      timerRef.current = window.setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setRecordingState('idle')
    setDuration(0)
    if (timerRef.current) window.clearInterval(timerRef.current)
  }, [])

  const downloadRecording = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-surface-light rounded-3xl p-8 shadow-soft animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-white text-2xl font-light tracking-tight">
              Screen Recorder
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Capture your screen with audio
            </p>
          </div>

          {recordingState === 'idle' ? (
            <>
              {/* Options */}
              <div className="space-y-4 mb-8">
                {/* System Audio Toggle */}
                <div className="flex items-center justify-between p-4 bg-surface-lighter rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center">
                      <SpeakerIcon />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">System Audio</p>
                      <p className="text-white/40 text-xs">Record app sounds</p>
                    </div>
                  </div>
                  <Toggle enabled={includeAudio} onChange={setIncludeAudio} />
                </div>

                {/* Microphone Toggle */}
                <div className="flex items-center justify-between p-4 bg-surface-lighter rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center">
                      <MicIcon />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Microphone</p>
                      <p className="text-white/40 text-xs">Record your voice</p>
                    </div>
                  </div>
                  <Toggle enabled={includeMic} onChange={setIncludeMic} />
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={startRecording}
                className="w-full py-5 rounded-2xl bg-accent hover:bg-accent/90 text-white font-medium text-lg transition-all hover:shadow-glow active:scale-[0.98]"
              >
                Start Recording
              </button>

              <p className="text-white/30 text-xs text-center mt-4">
                Click to select a screen, window, or tab
              </p>
            </>
          ) : (
            <>
              {/* Preview */}
              <div className="relative mb-6 rounded-2xl overflow-hidden bg-black aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
                {/* Recording indicator */}
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    recordingState === 'recording'
                      ? 'bg-accent animate-pulse-slow'
                      : 'bg-yellow-500'
                  }`} />
                  <span className="text-white text-xs font-medium">
                    {recordingState === 'recording' ? 'REC' : 'PAUSED'}
                  </span>
                </div>
              </div>

              {/* Timer */}
              <div className="text-center mb-8">
                <div className="text-5xl font-light text-white tabular-nums tracking-tight">
                  {formatDuration(duration)}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {/* Pause/Resume */}
                <button
                  onClick={recordingState === 'recording' ? pauseRecording : resumeRecording}
                  className="w-14 h-14 rounded-full bg-surface-lighter hover:bg-surface flex items-center justify-center transition-colors"
                >
                  {recordingState === 'recording' ? <PauseIcon /> : <PlayIcon />}
                </button>

                {/* Stop */}
                <button
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-accent hover:bg-accent/90 flex items-center justify-center transition-all hover:shadow-glow active:scale-95"
                >
                  <StopIcon />
                </button>

                {/* Spacer */}
                <div className="w-14 h-14" />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-white/20 text-xs text-center mt-6">
          Recordings are saved locally to your computer
        </p>
      </div>
    </div>
  )
}

// Toggle Component
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-12 h-7 rounded-full transition-colors relative ${
        enabled ? 'bg-accent' : 'bg-surface'
      }`}
    >
      <div
        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${
          enabled ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  )
}

// Icons
function SpeakerIcon() {
  return (
    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  )
}

export default App
