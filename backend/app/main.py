"""Napkin AI Director - FastAPI Backend."""
import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import router

# Configure logging
os.makedirs("logs", exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(settings.LOG_FILE),
    ],
)
logger = logging.getLogger("napkin")

app = FastAPI(
    title="Napkin AI Director",
    description="Production-grade AI video pipeline for 30-second branded spots",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


# Also mount WebSocket at root level for /ws/pipeline
from app.api.routes import websocket_pipeline  # noqa: E402
app.add_api_websocket_route("/ws/pipeline", websocket_pipeline)


@app.get("/")
async def root():
    return {
        "name": "Napkin AI Director",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "character": "/api/character/generate-turntable",
            "lock": "/api/character/lock",
            "world": "/api/world/generate",
            "brief": "/api/brief/analyze",
            "produce": "/api/produce",
            "pipeline_ws": "/ws/pipeline",
        },
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
