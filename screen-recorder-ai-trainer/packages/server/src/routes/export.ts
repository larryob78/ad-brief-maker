import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const METADATA_DIR = path.join(__dirname, '../../../data');

async function loadAllRecordings(): Promise<any[]> {
  await fs.mkdir(METADATA_DIR, { recursive: true });
  const files = await fs.readdir(METADATA_DIR);
  const results = await Promise.all(
    files
      .filter(f => f.endsWith('.json'))
      .map(async f => {
        try {
          const content = await fs.readFile(path.join(METADATA_DIR, f), 'utf-8');
          return JSON.parse(content);
        } catch {
          console.warn(`Skipping corrupted metadata file: ${f}`);
          return null;
        }
      })
  );
  return results.filter(Boolean);
}

export const exportRouter = Router();

// Export all recordings as JSON training data
exportRouter.get('/json', async (_req, res) => {
  try {
    const recordings = await loadAllRecordings();

    const exportData = recordings.map(r => ({
      recording_id: r.id,
      title: r.title,
      description: r.description,
      duration_ms: r.duration,
      category: r.category,
      tags: r.tags || [],
      steps: (r.steps || []).map((s: any) => ({
        timestamp_ms: s.timestamp,
        end_timestamp_ms: s.endTimestamp,
        action: s.action,
        description: s.description,
        action_type: s.actionType,
        application: s.application,
        region: s.region,
        action_data: s.actionData,
      })),
      video_file: r.videoFilePath,
    }));

    res.json(exportData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export as JSONL
exportRouter.get('/jsonl', async (_req, res) => {
  try {
    const recordings = await loadAllRecordings();

    const lines = recordings.map(r => JSON.stringify({
      recording_id: r.id,
      title: r.title,
      description: r.description,
      duration_ms: r.duration,
      category: r.category,
      tags: r.tags || [],
      steps: (r.steps || []).map((s: any) => ({
        timestamp_ms: s.timestamp,
        action: s.action,
        description: s.description,
        action_type: s.actionType,
        application: s.application,
      })),
    }));

    res.setHeader('Content-Type', 'application/jsonl');
    res.setHeader('Content-Disposition', 'attachment; filename="training-data.jsonl"');
    res.send(lines.join('\n'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
