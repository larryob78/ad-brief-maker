# Screen Recorder AI Trainer

A web-based tool to record your screen workflow and annotate it with structured metadata for training AI agents to replicate your workflows.

## Features

- **Screen Recording**: Record full screen, windows, or browser tabs using the browser's native screen capture API
- **Region Selection**: Choose exactly what part of your screen to record
- **Workflow Annotation**: Add detailed step-by-step annotations to your recordings with action types, descriptions, and timestamps
- **AI Training Export**: Export recordings and annotations as structured JSON/JSONL data for fine-tuning AI models
- **Local Storage**: Recordings are stored locally in your browser using IndexedDB — no data leaves your machine
- **Server Backup**: Optional Express.js backend for persistent storage and server-side export

## Quick Start

### Prerequisites
- Node.js 18+
- A modern browser (Chrome, Edge, or Firefox) with screen capture support

### Install & Run

```bash
# Install dependencies
cd screen-recorder-ai-trainer
npm install
cd packages/client && npm install && cd ../..
cd packages/server && npm install && cd ../..

# Start development servers (client + server)
npm run dev
```

The client runs at `http://localhost:5173` and the API server at `http://localhost:3001`.

### Usage

1. **Record**: Click "Start Recording" and select your screen/window/tab
2. **Annotate**: After recording, select it from the list and add workflow steps
3. **Export**: Use the export panel to download structured training data

## Project Structure

```
screen-recorder-ai-trainer/
├── packages/
│   ├── shared/          # Shared TypeScript types
│   │   └── src/types/   # Recording, annotation, export interfaces
│   ├── client/          # React frontend (Vite)
│   │   └── src/
│   │       ├── engine/      # Screen recording engine (MediaRecorder API)
│   │       ├── storage/     # IndexedDB local storage
│   │       ├── hooks/       # React hooks (useRecorder)
│   │       ├── context/     # Recording context provider
│   │       ├── components/  # UI components
│   │       └── utils/       # Formatting and export utilities
│   └── server/          # Express.js backend
│       └── src/
│           ├── routes/      # API routes (recordings, export)
│           └── services/    # Business logic
├── uploads/             # Server-stored video files
└── data/                # Server-stored metadata JSON
```

## Export Formats

### JSON
Structured array of recordings with full annotation data. Best for custom training pipelines.

### JSONL
Line-delimited JSON, one recording per line. Compatible with OpenAI fine-tuning and similar pipelines.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express.js, TypeScript
- **Storage**: IndexedDB (client), filesystem (server)
- **Recording**: MediaRecorder API, getDisplayMedia API
