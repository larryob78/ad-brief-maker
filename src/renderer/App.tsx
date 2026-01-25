import { useState, useEffect, useRef } from 'react'
import { Source } from './types'
import SourcePicker from './components/SourcePicker'
import RecordingControls from './components/RecordingControls'
import TitleBar from './components/TitleBar'

type RecordingState = 'idle' | 'recording' | 'paused'

function App() {
  const [sources, setSources] = useState<Source[]>([])
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [duration, setDuration] = useState(0)
  const [includeAudio, setIncludeAudio] = useState(true)
  const [format, setFormat] = useState<'mp4' | 'mov'>('mp4')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadSources()
    checkPermissions()
  }, [])

  async function loadSources() {
    const sources = await window.electronAPI.getSources()
    setSources(sources)
  }

  async function checkPermissions() {
    await window.electronAPI.checkPermissions()
  }

  async function startRecording() {
    if (!selectedSource) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: includeAudio ? {
          mandatory: {
            chromeMediaSource: 'desktop'
          }
        } as any : false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectedSource.id
          }
        } as any
      })

      // Add microphone audio if enabled
      if (includeAudio) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
          })
          const audioTrack = micStream.getAudioTracks()[0]
          if (audioTrack) {
            stream.addTrack(audioTrack)
          }
        } catch (e) {
          console.warn('Could not add microphone:', e)
        }
      }

      const mimeType = format === 'mp4' ? 'video/webm;codecs=vp9' : 'video/webm'
      const mediaRecorder = new MediaRecorder(stream, { mimeType })

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const buffer = await blob.arrayBuffer()
        await window.electronAPI.saveRecording(buffer, format)
        chunksRef.current = []
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000)
      setRecordingState('recording')

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  function pauseRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      setRecordingState('paused')
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  function resumeRecording() {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume()
      setRecordingState('recording')
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setRecordingState('idle')
      setDuration(0)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-surface rounded-2xl overflow-hidden">
      <TitleBar />

      <div className="p-6 space-y-6">
        {recordingState === 'idle' ? (
          <>
            <SourcePicker
              sources={sources}
              selectedSource={selectedSource}
              onSelect={setSelectedSource}
              onRefresh={loadSources}
            />

            <div className="space-y-4">
              {/* Audio Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Include Audio</span>
                <button
                  onClick={() => setIncludeAudio(!includeAudio)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    includeAudio ? 'bg-accent' : 'bg-surface-light'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      includeAudio ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Format Selector */}
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Format</span>
                <div className="flex gap-2">
                  {(['mp4', 'mov'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`px-3 py-1 rounded text-sm uppercase transition-colors ${
                        format === f
                          ? 'bg-accent text-white'
                          : 'bg-surface-light text-white/50 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startRecording}
              disabled={!selectedSource}
              className={`w-full py-4 rounded-xl font-medium text-lg transition-all ${
                selectedSource
                  ? 'bg-accent hover:bg-accent/90 text-white'
                  : 'bg-surface-light text-white/30 cursor-not-allowed'
              }`}
            >
              Start Recording
            </button>
          </>
        ) : (
          <RecordingControls
            state={recordingState}
            duration={formatDuration(duration)}
            sourceName={selectedSource?.name || ''}
            onPause={pauseRecording}
            onResume={resumeRecording}
            onStop={stopRecording}
          />
        )}
      </div>
    </div>
  )
}

export default App
