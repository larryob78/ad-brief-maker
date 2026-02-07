export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  uploadsDir: process.env.UPLOADS_DIR || 'uploads',
  dataDir: process.env.DATA_DIR || 'data',
  maxFileSize: 500 * 1024 * 1024, // 500MB
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
