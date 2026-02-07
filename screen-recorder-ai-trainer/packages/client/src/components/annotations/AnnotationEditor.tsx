import React, { useState } from 'react';
import { useRecordings } from '../../context/RecordingContext';
import { AnnotationStep } from '@shared/types/recording';
import { formatDuration } from '../../utils/format';
import { v4 as uuidv4 } from 'uuid';
import { getVideoBlob } from '../../storage/db';
import { exportRecordingVideo } from '../../utils/export';

const ACTION_TYPES: AnnotationStep['actionType'][] = [
  'click', 'type', 'scroll', 'navigate', 'drag', 'keyboard_shortcut', 'wait', 'custom'
];

const styles = {
  panel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  header: {
    padding: '20px 24px 16px',
    borderBottom: '1px solid var(--border)',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  titleInput: {
    fontSize: '1.1rem',
    fontWeight: 600,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    width: '100%',
    outline: 'none',
    padding: '4px 0',
    borderBottom: '2px solid transparent',
  },
  descInput: {
    width: '100%',
    resize: 'none' as const,
    minHeight: '48px',
    fontSize: '0.8rem',
    marginTop: '8px',
  },
  videoContainer: {
    padding: '16px 24px',
    borderBottom: '1px solid var(--border)',
  },
  video: {
    width: '100%',
    maxHeight: '280px',
    borderRadius: 'var(--radius-md)',
    background: '#000',
  },
  videoActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  smallBtn: {
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    fontSize: '0.75rem',
  },
  stepsSection: {
    flex: 1,
    overflow: 'auto',
    padding: '16px 24px',
  },
  sectionTitle: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addBtn: {
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--accent)',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  step: {
    padding: '12px',
    background: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '8px',
    border: '1px solid var(--border)',
    animation: 'fadeIn 0.2s ease',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  stepTimestamp: {
    fontSize: '0.7rem',
    color: 'var(--accent)',
    fontFamily: 'monospace',
    fontWeight: 600,
    background: 'var(--accent-bg)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  stepType: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  stepInputGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '8px',
  },
  stepInput: {
    width: '100%',
    padding: '6px 8px',
    fontSize: '0.78rem',
  },
  stepDelete: {
    padding: '2px 6px',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '0.7rem',
    marginLeft: 'auto',
  },
  noSelection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  tagInput: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: '8px',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.7rem',
    background: 'var(--accent-bg)',
    color: 'var(--accent)',
    fontWeight: 500,
  },
};

export function AnnotationEditor() {
  const { selectedRecording, updateRecording } = useRecordings();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedRecording) {
      if (selectedRecording.videoBlobUrl) {
        setVideoUrl(selectedRecording.videoBlobUrl);
      } else {
        getVideoBlob(selectedRecording.id).then(blob => {
          if (blob) setVideoUrl(URL.createObjectURL(blob));
        });
      }
    }
    return () => {
      if (videoUrl && !selectedRecording?.videoBlobUrl) URL.revokeObjectURL(videoUrl!);
    };
  }, [selectedRecording?.id]);

  if (!selectedRecording) {
    return (
      <div style={styles.noSelection}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        Select a recording to view and annotate
      </div>
    );
  }

  const rec = selectedRecording;

  const updateField = (field: string, value: any) => {
    updateRecording({ ...rec, [field]: value, updatedAt: new Date().toISOString() });
  };

  const addStep = () => {
    const newStep: AnnotationStep = {
      id: uuidv4(),
      timestamp: 0,
      action: '',
      description: '',
      tags: [],
      actionType: 'click',
    };
    updateRecording({
      ...rec,
      steps: [...rec.steps, newStep],
      updatedAt: new Date().toISOString(),
    });
  };

  const updateStep = (stepId: string, updates: Partial<AnnotationStep>) => {
    updateRecording({
      ...rec,
      steps: rec.steps.map(s => s.id === stepId ? { ...s, ...updates } : s),
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteStep = (stepId: string) => {
    updateRecording({
      ...rec,
      steps: rec.steps.filter(s => s.id !== stepId),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <input
          style={styles.titleInput}
          placeholder="Give this recording a title..."
          value={rec.title}
          onChange={e => updateField('title', e.target.value)}
          onFocus={e => (e.target.style.borderBottomColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderBottomColor = 'transparent')}
        />
        <textarea
          style={styles.descInput}
          placeholder="Describe the workflow being recorded..."
          value={rec.description}
          onChange={e => updateField('description', e.target.value)}
        />
        <div style={styles.tagInput}>
          {rec.tags.map((tag, i) => (
            <span key={i} style={styles.tag}>
              {tag}
              <span
                style={{ cursor: 'pointer', marginLeft: '2px' }}
                onClick={() => updateField('tags', rec.tags.filter((_, j) => j !== i))}
              >x</span>
            </span>
          ))}
          <input
            style={{ ...styles.stepInput, width: '120px' }}
            placeholder="Add tag..."
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                updateField('tags', [...rec.tags, (e.target as HTMLInputElement).value.trim()]);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>
      </div>

      {videoUrl && (
        <div style={styles.videoContainer}>
          <video src={videoUrl} controls style={styles.video} />
          <div style={styles.videoActions}>
            <button style={styles.smallBtn} onClick={() => exportRecordingVideo(rec.id, rec.title)}>
              Download Video
            </button>
          </div>
        </div>
      )}

      <div style={styles.stepsSection}>
        <div style={styles.sectionTitle}>
          <span>Workflow Steps ({rec.steps.length})</span>
          <button style={styles.addBtn} onClick={addStep}>+ Add Step</button>
        </div>

        {rec.steps.map((step, index) => (
          <div key={step.id} style={styles.step}>
            <div style={styles.stepHeader}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                #{index + 1}
              </span>
              <span style={styles.stepTimestamp}>{formatDuration(step.timestamp)}</span>
              <span style={styles.stepType}>{step.actionType}</span>
              <button
                style={styles.stepDelete}
                onClick={() => deleteStep(step.id)}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--danger)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                Remove
              </button>
            </div>
            <div style={styles.stepInputGroup}>
              <input
                style={styles.stepInput}
                placeholder="Action (e.g., Click submit button)"
                value={step.action}
                onChange={e => updateStep(step.id, { action: e.target.value })}
              />
              <select
                style={{ ...styles.stepInput, padding: '6px 8px' }}
                value={step.actionType}
                onChange={e => updateStep(step.id, { actionType: e.target.value as any })}
              >
                {ACTION_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <input
              style={{ ...styles.stepInput, marginBottom: '8px' }}
              placeholder="Description..."
              value={step.description}
              onChange={e => updateStep(step.id, { description: e.target.value })}
            />
            <div style={styles.stepInputGroup}>
              <input
                style={styles.stepInput}
                placeholder="Application (optional)"
                value={step.application || ''}
                onChange={e => updateStep(step.id, { application: e.target.value })}
              />
              <input
                style={styles.stepInput}
                placeholder="Timestamp (ms)"
                type="number"
                value={step.timestamp}
                onChange={e => updateStep(step.id, { timestamp: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
