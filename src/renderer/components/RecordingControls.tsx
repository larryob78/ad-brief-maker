interface Props {
  state: 'recording' | 'paused'
  duration: string
  sourceName: string
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

function RecordingControls({ state, duration, sourceName, onPause, onResume, onStop }: Props) {
  return (
    <div className="flex flex-col items-center py-8 space-y-8">
      {/* Recording Indicator */}
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${
          state === 'recording' ? 'bg-accent animate-pulse' : 'bg-yellow-500'
        }`} />
        <span className="text-white/60 text-sm">
          {state === 'recording' ? 'Recording' : 'Paused'}
        </span>
      </div>

      {/* Timer */}
      <div className="text-6xl font-light text-white tabular-nums">
        {duration}
      </div>

      {/* Source Name */}
      <p className="text-white/40 text-sm truncate max-w-full px-4">
        {sourceName}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Pause/Resume Button */}
        <button
          onClick={state === 'recording' ? onPause : onResume}
          className="w-14 h-14 rounded-full bg-surface-light hover:bg-surface-light/80 flex items-center justify-center transition-colors"
        >
          {state === 'recording' ? (
            <PauseIcon />
          ) : (
            <PlayIcon />
          )}
        </button>

        {/* Stop Button */}
        <button
          onClick={onStop}
          className="w-16 h-16 rounded-full bg-accent hover:bg-accent/90 flex items-center justify-center transition-colors"
        >
          <StopIcon />
        </button>

        {/* Spacer for symmetry */}
        <div className="w-14 h-14" />
      </div>
    </div>
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

export default RecordingControls
