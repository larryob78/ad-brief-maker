import React, { useState } from 'react';
import { useRecorder } from '../../hooks/useRecorder';
import { useRecordings } from '../../context/RecordingContext';
import { RecordingConfig } from '@shared/types/recording';
import { formatDuration } from '../../utils/format';

const styles = {
  panel: {
    padding: '24px',
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
  },
  title: {
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '16px',
    color: 'var(--text-primary)',
  },
  configGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '20px',
  },
  configItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  label: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  select: {
    padding: '8px 10px',
    fontSize: '0.8rem',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  buttonRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  recordBtn: {
    flex: 1,
    padding: '12px 20px',
    borderRadius: 'var(--radius-md)',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  stopBtn: {
    flex: 1,
    padding: '12px 20px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontWeight: 600,
    fontSize: '0.9rem',
    border: '1px solid var(--border)',
  },
  pauseBtn: {
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  },
  timer: {
    textAlign: 'center' as const,
    padding: '16px',
    marginBottom: '16px',
    background: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  timerText: {
    fontSize: '2rem',
    fontWeight: 700,
    fontFamily: 'monospace',
    color: '#ef4444',
  },
  timerLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  recordingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#ef4444',
    animation: 'pulse-recording 1.5s ease-in-out infinite',
  },
};

export function RecordingControls() {
  const { state, duration, startRecording, pauseRecording, resumeRecording, stopRecording } = useRecorder();
  const { refreshRecordings } = useRecordings();

  const [config, setConfig] = useState<RecordingConfig>({
    captureMode: 'screen',
    frameRate: 30,
    captureAudio: false,
    captureSystemAudio: false,
  });

  const handleStart = async () => {
    try {
      await startRecording(config);
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        console.error('Failed to start recording:', err);
      }
    }
  };

  const handleStop = async () => {
    await stopRecording();
    await refreshRecordings();
  };

  const isRecording = state === 'recording' || state === 'paused';

  return (
    <div style={styles.panel}>
      <div style={styles.title}>Recording Controls</div>

      {isRecording && (
        <div style={styles.timer}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div style={styles.recordingDot} />
            <span style={styles.timerText}>{formatDuration(duration)}</span>
          </div>
          <div style={styles.timerLabel}>
            {state === 'paused' ? 'Paused' : 'Recording'}
          </div>
        </div>
      )}

      {!isRecording && (
        <div style={styles.configGrid}>
          <div style={styles.configItem}>
            <span style={styles.label}>Capture Mode</span>
            <select
              style={styles.select}
              value={config.captureMode}
              onChange={e => setConfig(c => ({ ...c, captureMode: e.target.value as any }))}
            >
              <option value="screen">Full Screen</option>
              <option value="window">Window</option>
              <option value="tab">Browser Tab</option>
            </select>
          </div>
          <div style={styles.configItem}>
            <span style={styles.label}>Frame Rate</span>
            <select
              style={styles.select}
              value={config.frameRate}
              onChange={e => setConfig(c => ({ ...c, frameRate: parseInt(e.target.value) }))}
            >
              <option value="15">15 FPS</option>
              <option value="24">24 FPS</option>
              <option value="30">30 FPS</option>
              <option value="60">60 FPS</option>
            </select>
          </div>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={config.captureAudio}
              onChange={e => setConfig(c => ({ ...c, captureAudio: e.target.checked }))}
            />
            Microphone Audio
          </label>
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={config.captureSystemAudio}
              onChange={e => setConfig(c => ({ ...c, captureSystemAudio: e.target.checked }))}
            />
            System Audio
          </label>
        </div>
      )}

      <div style={styles.buttonRow}>
        {!isRecording ? (
          <button
            style={styles.recordBtn}
            onClick={handleStart}
            disabled={state === 'requesting'}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <circle cx="7" cy="7" r="7" />
            </svg>
            {state === 'requesting' ? 'Starting...' : 'Start Recording'}
          </button>
        ) : (
          <>
            <button style={styles.pauseBtn} onClick={state === 'paused' ? resumeRecording : pauseRecording}>
              {state === 'paused' ? 'Resume' : 'Pause'}
            </button>
            <button style={styles.stopBtn} onClick={handleStop}>
              Stop & Save
            </button>
          </>
        )}
      </div>
    </div>
  );
}
