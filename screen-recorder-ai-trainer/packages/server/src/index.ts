import express from 'express';
import cors from 'cors';
import { recordingsRouter } from './routes/recordings.js';
import { exportRouter } from './routes/export.js';
import { config } from './config/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({ origin: config.corsOrigin }));
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

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
