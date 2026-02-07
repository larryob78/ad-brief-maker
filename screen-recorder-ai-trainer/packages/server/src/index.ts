import express from 'express';
import cors from 'cors';
import { recordingsRouter } from './routes/recordings.js';
import { exportRouter } from './routes/export.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '500mb' }));

// API Routes
app.use('/api/recordings', recordingsRouter);
app.use('/api/export', exportRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve uploaded videos
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
