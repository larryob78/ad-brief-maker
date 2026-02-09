# Napkin AI Director

Production-grade AI video pipeline for creating 30-second branded spots in 2-3 hours instead of weeks.

## Architecture

| Agent | Role |
|-------|------|
| **Claude Opus 4.6** | Creative strategy + shot list generation |
| **Kimi K2.5** (Moonshot) | Pipeline orchestrator + vision QA |
| **Marble** (World Labs) | 3D world generation |
| **SAM2** (Replicate) | Video segmentation / character isolation |
| **Luma Ray3** (Dream Machine) | Video generation with character reference |
| **FLUX Kontext Max** | Character turntable generation (6 angles) |

## Pipeline (9 Stages)

1. User describes character
2. FLUX generates 6-angle turntable (Front, 3/4 Left, Profile, 3/4 Back, Back, 3/4 Right)
3. User reviews turntable with staggered reveal + green checkmarks
4. User clicks LOCK CHARACTER
5. User picks Marble world (Neon City, Tropical, Mountain, etc.)
6. User picks Luma style (Cinematic, Documentary, Anime, etc.)
7. User chats with Claude about ad brief
8. User hits PRODUCE
9. Kimi K2.5 orchestrates: Marble world gen → SAM2 segment → Ray3 transform → composite → HDR master

## Tech Stack

- **Frontend**: React + Vite (dark theme, JetBrains Mono)
- **Backend**: FastAPI (Python) with async job queue
- **Real-time**: WebSocket for pipeline status updates
- **State**: In-memory (Redis-ready for production)

## Setup

### 1. Clone and configure environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and proxies API calls to the backend at `http://localhost:8000`.

## API Keys Required

| Variable | Service |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude Opus 4.6 (creative direction) |
| `REPLICATE_API_TOKEN` | FLUX Kontext Max + SAM2 |
| `WORLD_LABS_API_KEY` | Marble 3D world generation |
| `LUMA_API_KEY` | Luma Ray3 video generation |
| `KIMI_API_TOKEN` | Kimi K2.5 orchestrator |
| `FLUX_API_KEY` | FLUX (if separate endpoint) |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/character/generate-turntable` | Generate 6-angle character turntable |
| POST | `/api/character/lock` | Lock character reference globally |
| GET | `/api/character/turntable/{job_id}` | Get turntable generation status |
| POST | `/api/world/generate` | Generate 3D world |
| POST | `/api/brief/analyze` | Chat with Claude about ad brief |
| POST | `/api/produce` | Launch full production pipeline |
| GET | `/api/pipeline/{job_id}` | Get pipeline status |
| WS | `/ws/pipeline` | WebSocket for real-time updates |

## UI Flow

1. **Step 1**: Character description → GENERATE CHARACTER → 6-angle turntable with staggered reveal → LOCK CHARACTER
2. **Step 2**: Environment grid (8 world options with emoji)
3. **Step 3**: Style grid (6 visual styles)
4. **Step 4**: Chat with Claude (creative brief) + Production pipeline (9 stages with real-time status)

## Design System

- Background: `#0C0C14`
- Surface: `#14141F`
- Accent (red): `#FF3366`
- Success (green): `#00E676`
- Text: `#E8E8F0`
- Font: JetBrains Mono (UI labels), Inter (body)
