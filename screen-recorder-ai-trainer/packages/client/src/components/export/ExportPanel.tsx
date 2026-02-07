import React from 'react';
import { useRecordings } from '../../context/RecordingContext';
import { exportAsJSON, exportAsJSONL } from '../../utils/export';

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
    marginBottom: '8px',
    color: 'var(--text-primary)',
  },
  desc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginBottom: '16px',
    lineHeight: 1.5,
  },
  exportBtn: {
    width: '100%',
    padding: '10px 16px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    fontSize: '0.8rem',
    fontWeight: 500,
    marginBottom: '8px',
    textAlign: 'left' as const,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
  },
  stats: {
    marginTop: '16px',
    padding: '12px',
    background: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  statValue: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
};

export function ExportPanel() {
  const { recordings } = useRecordings();

  const readyRecordings = recordings.filter(r => r.status === 'ready');
  const totalSteps = readyRecordings.reduce((sum, r) => sum + r.steps.length, 0);
  const annotatedCount = readyRecordings.filter(r => r.steps.length > 0).length;

  return (
    <div style={styles.panel}>
      <div style={styles.title}>Export for AI Training</div>
      <div style={styles.desc}>
        Export your annotated recordings as structured training data for AI agents.
      </div>

      <button
        style={styles.exportBtn}
        onClick={() => exportAsJSON(readyRecordings)}
        disabled={readyRecordings.length === 0}
        onMouseEnter={e => { if (readyRecordings.length > 0) (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
      >
        <div>
          <div>JSON Format</div>
          <div style={styles.btnLabel}>Structured data, human-readable</div>
        </div>
        <span style={{ color: 'var(--text-muted)' }}>.json</span>
      </button>

      <button
        style={styles.exportBtn}
        onClick={() => exportAsJSONL(readyRecordings)}
        disabled={readyRecordings.length === 0}
        onMouseEnter={e => { if (readyRecordings.length > 0) (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
      >
        <div>
          <div>JSONL Format</div>
          <div style={styles.btnLabel}>Line-delimited, for fine-tuning pipelines</div>
        </div>
        <span style={{ color: 'var(--text-muted)' }}>.jsonl</span>
      </button>

      <div style={styles.stats}>
        <div>
          <div style={styles.statValue}>{readyRecordings.length}</div>
          <div>Recordings</div>
        </div>
        <div>
          <div style={styles.statValue}>{annotatedCount}</div>
          <div>Annotated</div>
        </div>
        <div>
          <div style={styles.statValue}>{totalSteps}</div>
          <div>Total Steps</div>
        </div>
        <div>
          <div style={{ ...styles.statValue, color: annotatedCount > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
            {readyRecordings.length > 0 ? Math.round((annotatedCount / readyRecordings.length) * 100) : 0}%
          </div>
          <div>Coverage</div>
        </div>
      </div>
    </div>
  );
}
