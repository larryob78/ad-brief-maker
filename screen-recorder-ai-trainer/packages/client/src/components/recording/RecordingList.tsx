import React from 'react';
import { useRecordings } from '../../context/RecordingContext';
import { formatDuration, formatFileSize, formatDate } from '../../utils/format';

const styles = {
  panel: {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
  },
  title: {
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '12px',
    color: 'var(--text-primary)',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
  card: {
    padding: '12px 16px',
    background: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '8px',
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.15s ease',
  },
  cardSelected: {
    border: '1px solid var(--accent)',
    background: 'var(--accent-bg)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  cardTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  cardMeta: {
    display: 'flex',
    gap: '12px',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  badge: {
    fontSize: '0.65rem',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 600,
  },
  deleteBtn: {
    padding: '4px 8px',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    borderRadius: 'var(--radius-sm)',
  },
  stepsCount: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.7rem',
    color: 'var(--accent)',
    background: 'var(--accent-bg)',
    padding: '2px 8px',
    borderRadius: '10px',
    marginTop: '6px',
  },
};

export function RecordingList() {
  const { recordings, selectedRecording, setSelectedRecording, deleteRecording } = useRecordings();

  return (
    <div style={styles.panel}>
      <div style={styles.title}>Recordings ({recordings.length})</div>

      {recordings.length === 0 ? (
        <div style={styles.empty}>
          No recordings yet. Start by recording your screen workflow.
        </div>
      ) : (
        recordings.map(rec => (
          <div
            key={rec.id}
            style={{
              ...styles.card,
              ...(selectedRecording?.id === rec.id ? styles.cardSelected : {}),
            }}
            onClick={() => setSelectedRecording(rec)}
            onMouseEnter={e => {
              if (selectedRecording?.id !== rec.id) {
                (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-hover)';
              }
            }}
            onMouseLeave={e => {
              if (selectedRecording?.id !== rec.id) {
                (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-tertiary)';
              }
            }}
          >
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>{rec.title || 'Untitled Recording'}</span>
              <button
                style={styles.deleteBtn}
                onClick={e => { e.stopPropagation(); deleteRecording(rec.id); }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
              >
                Delete
              </button>
            </div>
            <div style={styles.cardMeta}>
              <span>{formatDuration(rec.duration)}</span>
              <span>{formatFileSize(rec.fileSize)}</span>
              <span>{formatDate(rec.createdAt)}</span>
            </div>
            {rec.steps.length > 0 && (
              <div style={styles.stepsCount}>
                {rec.steps.length} step{rec.steps.length !== 1 ? 's' : ''} annotated
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
