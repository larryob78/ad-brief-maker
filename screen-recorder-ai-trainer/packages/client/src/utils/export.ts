import { Recording, ExportEntry } from '@shared/types/recording';
import { getVideoBlob } from '../storage/db';

export async function exportAsJSON(recordings: Recording[]): Promise<void> {
  const entries: ExportEntry[] = recordings.map(r => ({
    recording_id: r.id,
    title: r.title,
    description: r.description,
    duration_ms: r.duration,
    category: r.category,
    tags: r.tags,
    steps: r.steps.map(s => ({
      timestamp_ms: s.timestamp,
      end_timestamp_ms: s.endTimestamp,
      action: s.action,
      description: s.description,
      action_type: s.actionType,
      application: s.application,
      region: s.region,
      action_data: s.actionData,
    })),
  }));

  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  downloadBlob(blob, 'ai-training-data.json');
}

export async function exportAsJSONL(recordings: Recording[]): Promise<void> {
  const lines = recordings.map(r => JSON.stringify({
    recording_id: r.id,
    title: r.title,
    description: r.description,
    duration_ms: r.duration,
    category: r.category,
    tags: r.tags,
    steps: r.steps.map(s => ({
      timestamp_ms: s.timestamp,
      action: s.action,
      description: s.description,
      action_type: s.actionType,
      application: s.application,
    })),
  }));

  const blob = new Blob([lines.join('\n')], { type: 'application/jsonl' });
  downloadBlob(blob, 'ai-training-data.jsonl');
}

export async function exportRecordingVideo(recordingId: string, title: string): Promise<void> {
  const blob = await getVideoBlob(recordingId);
  if (!blob) throw new Error('Video not found');
  const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
  downloadBlob(blob, `${title || 'recording'}.${ext}`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
