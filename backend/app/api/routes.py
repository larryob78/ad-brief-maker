"""API routes for Napkin AI Director."""
import uuid
import asyncio
import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.models.schemas import (
    CharacterRequest,
    LockCharacterRequest,
    WorldRequest,
    BriefRequest,
    ProduceRequest,
    PipelineStage,
)
from app.state import jobs, JobState, ws_connections
from app.services import flux, kimi
from app.services.claude_ai import analyze_brief

logger = logging.getLogger("napkin.api")
router = APIRouter()

PIPELINE_STAGES = [
    PipelineStage(stage=1, label="Initialize Pipeline", agent="System", icon="🚀"),
    PipelineStage(stage=2, label="Generate 3D World", agent="Marble (World Labs)", icon="🌍"),
    PipelineStage(stage=3, label="Segment Video", agent="SAM2 (Replicate)", icon="✂️"),
    PipelineStage(stage=4, label="Generate Shot 1", agent="Luma Ray3", icon="🎬"),
    PipelineStage(stage=5, label="Generate Shot 2", agent="Luma Ray3", icon="🎬"),
    PipelineStage(stage=6, label="Generate Shot 3", agent="Luma Ray3", icon="🎬"),
    PipelineStage(stage=7, label="Vision QA", agent="Kimi K2.5", icon="👁️"),
    PipelineStage(stage=8, label="Regenerate Failed", agent="Luma Ray3", icon="🔄"),
    PipelineStage(stage=9, label="4K HDR Master", agent="Luma Hi-Fi", icon="✨"),
]


@router.post("/character/generate-turntable")
async def generate_turntable(req: CharacterRequest):
    """Generate 6-angle character turntable using FLUX Kontext Max."""
    job_id = str(uuid.uuid4())[:8]
    jobs[job_id] = JobState(character_description=req.description)

    angles = [
        {"angle": a, "url": None, "status": "pending"}
        for a in flux.ANGLES
    ]

    # Start generation in background
    async def run_generation():
        async def on_angle_done(index, result):
            jobs[job_id].turntable_urls = list(jobs[job_id].turntable_urls)
            while len(jobs[job_id].turntable_urls) <= index:
                jobs[job_id].turntable_urls.append({})
            jobs[job_id].turntable_urls[index] = result

            # Notify WebSocket clients
            if job_id in ws_connections:
                msg = json.dumps({
                    "type": "turntable_angle",
                    "index": index,
                    "angle": result,
                })
                for ws in ws_connections[job_id]:
                    try:
                        await ws.send_text(msg)
                    except Exception:
                        pass

        results = await flux.generate_turntable(
            req.description, job_id, on_angle_done
        )
        jobs[job_id].turntable_urls = results

    asyncio.create_task(run_generation())

    return {"job_id": job_id, "angles": angles, "status": "generating"}


@router.post("/character/lock")
async def lock_character(req: LockCharacterRequest):
    """Lock the character reference globally."""
    job = jobs.get(req.job_id)
    if not job:
        return {"error": "Job not found", "status": "error"}

    job.character_locked = True
    job.character_ref_urls = [
        a.get("url") for a in job.turntable_urls if a.get("url")
    ]

    return {
        "status": "locked",
        "character_ref_urls": job.character_ref_urls,
        "description": job.character_description,
    }


@router.get("/character/turntable/{job_id}")
async def get_turntable_status(job_id: str):
    """Get current turntable generation status."""
    job = jobs.get(job_id)
    if not job:
        return {"error": "Job not found"}

    return {
        "job_id": job_id,
        "angles": job.turntable_urls,
        "character_locked": job.character_locked,
        "all_done": len(job.turntable_urls) == 6 and all(
            a.get("status") == "done" for a in job.turntable_urls
        ),
    }


@router.post("/world/generate")
async def generate_world(req: WorldRequest):
    """Start world generation with Marble API."""
    return {
        "status": "accepted",
        "world_type": req.world_type,
        "message": f"World '{req.world_type}' will be generated during production.",
    }


@router.post("/brief/analyze")
async def analyze_brief_endpoint(req: BriefRequest):
    """Chat with Claude Opus about the ad brief."""
    result = await analyze_brief(
        message=req.message,
        character_description=req.character_description,
        world_type=req.world_type,
        style_type=req.style_type,
        conversation_history=req.conversation_history,
    )
    return result


@router.post("/produce")
async def produce(req: ProduceRequest):
    """Trigger the full production pipeline orchestrated by Kimi K2.5."""
    job_id = str(uuid.uuid4())[:8]
    jobs[job_id] = JobState(
        character_description=req.character_description,
        character_ref_urls=req.character_ref_urls,
        character_locked=True,
        world_type=req.world_type,
        style_type=req.style_type,
        brief=req.brief,
        shot_list=req.shot_list,
    )

    stages = [s.model_dump() for s in PIPELINE_STAGES]
    jobs[job_id].pipeline_stages = stages

    async def run_pipeline():
        async def on_stage_update(stage: int, status: str, detail: str = ""):
            # Update stage in state
            for s in jobs[job_id].pipeline_stages:
                if s["stage"] == stage:
                    s["status"] = status

            # Notify WebSocket clients
            if job_id in ws_connections:
                msg = json.dumps({
                    "type": "pipeline_stage",
                    "stage": stage,
                    "status": status,
                    "detail": detail,
                    "stages": jobs[job_id].pipeline_stages,
                })
                for ws in ws_connections[job_id]:
                    try:
                        await ws.send_text(msg)
                    except Exception:
                        pass

        results = await kimi.orchestrate_pipeline(
            character_description=req.character_description,
            character_ref_urls=req.character_ref_urls,
            world_type=req.world_type,
            style_type=req.style_type,
            brief=req.brief,
            shot_list=req.shot_list,
            performance_video_url=req.performance_video_url,
            on_stage_update=on_stage_update,
        )
        jobs[job_id].pipeline_results = results

        # Send completion
        if job_id in ws_connections:
            msg = json.dumps({
                "type": "pipeline_complete",
                "results": {
                    "shots_produced": len(results.get("shots", [])),
                    "quality": "4K HDR",
                    "bit_depth": "16-bit EXR",
                },
            })
            for ws in ws_connections[job_id]:
                try:
                    await ws.send_text(msg)
                except Exception:
                    pass

    asyncio.create_task(run_pipeline())

    return {
        "job_id": job_id,
        "stages": stages,
        "status": "started",
    }


@router.get("/pipeline/{job_id}")
async def get_pipeline_status(job_id: str):
    """Get current pipeline status."""
    job = jobs.get(job_id)
    if not job:
        return {"error": "Job not found"}

    return {
        "job_id": job_id,
        "stages": job.pipeline_stages,
        "results": job.pipeline_results,
    }


@router.websocket("/ws/pipeline")
async def websocket_pipeline(ws: WebSocket):
    """WebSocket for real-time pipeline status updates."""
    await ws.accept()
    job_id = None

    try:
        while True:
            data = await ws.receive_text()
            msg = json.loads(data)

            if msg.get("type") == "subscribe":
                job_id = msg.get("job_id")
                if job_id:
                    if job_id not in ws_connections:
                        ws_connections[job_id] = []
                    ws_connections[job_id].append(ws)
                    await ws.send_text(json.dumps({
                        "type": "subscribed",
                        "job_id": job_id,
                    }))

    except WebSocketDisconnect:
        if job_id and job_id in ws_connections:
            ws_connections[job_id] = [
                w for w in ws_connections[job_id] if w != ws
            ]
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if job_id and job_id in ws_connections:
            ws_connections[job_id] = [
                w for w in ws_connections[job_id] if w != ws
            ]
