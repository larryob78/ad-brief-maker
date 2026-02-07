import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../../../uploads');
const METADATA_DIR = path.join(__dirname, '../../../data');

const ID_PATTERN = /^[a-zA-Z0-9\-_]+$/;

function isValidId(id: string): boolean {
  return ID_PATTERN.test(id);
}

// Ensure directories exist
async function ensureDirs() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(METADATA_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDirs()
      .then(() => cb(null, UPLOADS_DIR))
      .catch(err => cb(err, UPLOADS_DIR));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

export const recordingsRouter = Router();

// Upload a recording
recordingsRouter.post('/upload', upload.single('video'), async (req, res) => {
  try {
    await ensureDirs();
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No video file provided' });
      return;
    }

    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    const id = metadata.id || uuidv4();

    if (!isValidId(id)) {
      res.status(400).json({ error: 'Invalid recording ID' });
      return;
    }

    const recording = {
      id,
      title: metadata.title || '',
      description: metadata.description || '',
      createdAt: metadata.createdAt || new Date().toISOString(),
      duration: metadata.duration || 0,
      mimeType: metadata.mimeType || 'video/webm',
      config: metadata.config || {},
      steps: metadata.steps || [],
      tags: metadata.tags || [],
      category: metadata.category,
      status: metadata.status || 'ready',
      videoFilePath: `/uploads/${file.filename}`,
      fileSize: file.size,
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(
      path.join(METADATA_DIR, `${id}.json`),
      JSON.stringify(recording, null, 2)
    );

    res.json({ success: true, recording });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List all recordings -- resilient to corrupted files
recordingsRouter.get('/', async (_req, res) => {
  try {
    await ensureDirs();
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
    const recordings = results.filter(Boolean);
    recordings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(recordings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single recording
recordingsRouter.get('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) {
    res.status(400).json({ error: 'Invalid recording ID' });
    return;
  }
  try {
    const content = await fs.readFile(path.join(METADATA_DIR, `${req.params.id}.json`), 'utf-8');
    res.json(JSON.parse(content));
  } catch {
    res.status(404).json({ error: 'Recording not found' });
  }
});

// Update recording metadata -- whitelist allowed fields
recordingsRouter.put('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) {
    res.status(400).json({ error: 'Invalid recording ID' });
    return;
  }
  try {
    const filePath = path.join(METADATA_DIR, `${req.params.id}.json`);
    const existing = JSON.parse(await fs.readFile(filePath, 'utf-8'));

    const allowedFields = ['title', 'description', 'steps', 'tags', 'category', 'status'];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2));
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'Recording not found' });
  }
});

// Delete recording
recordingsRouter.delete('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) {
    res.status(400).json({ error: 'Invalid recording ID' });
    return;
  }
  try {
    const filePath = path.join(METADATA_DIR, `${req.params.id}.json`);
    const content = JSON.parse(await fs.readFile(filePath, 'utf-8'));

    // Delete video file
    if (content.videoFilePath) {
      const videoPath = path.join(__dirname, '../../../', content.videoFilePath);
      try { await fs.unlink(videoPath); } catch { /* file may not exist */ }
    }

    await fs.unlink(filePath);
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Recording not found' });
  }
});
