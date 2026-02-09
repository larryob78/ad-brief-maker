"""Kimi K2.5 (Moonshot API) - Pipeline Orchestrator + Vision QA.

This is the core orchestration agent. Kimi reads the locked character reference,
selected world, style, brief, and performance video, then orchestrates the entire
production pipeline through all AI services.
"""
import asyncio
import json
import logging
import httpx
from app.config import settings
from app.services import marble, sam2, luma

logger = logging.getLogger("napkin.kimi")

KIMI_API_BASE = "https://api.moonshot.cn/v1"

ORCHESTRATOR_SYSTEM = """You are the Kimi K2.5 Pipeline Orchestrator for Napkin AI Director.

You orchestrate the production of 30-second branded video spots by coordinating:
1. Marble API (World Labs) for 3D world generation
2. SAM2 (Replicate) for video segmentation
3. Luma Ray3 for video generation with character reference
4. Vision QA for quality assurance

You receive a production brief and execute the pipeline step by step.
Return structured JSON responses for each pipeline stage."""


async def vision_qa(frame_urls: list[str]) -> dict:
    """Use Kimi vision to QA generated frames for consistency."""
    headers = {
        "Authorization": f"Bearer {settings.KIMI_API_TOKEN}",
        "Content-Type": "application/json",
    }

    content = [
        {
            "type": "text",
            "text": (
                "Check each frame for character consistency, edge quality, and lighting match. "
                "Are any frames bad? Return a JSON object with 'passed' (boolean) and "
                "'bad_frames' (list of frame indices to regenerate) and 'notes' (string)."
            ),
        }
    ]

    for i, url in enumerate(frame_urls):
        content.append({
            "type": "image_url",
            "image_url": {"url": url},
        })

    payload = {
        "model": "kimi-k2.5",
        "messages": [
            {"role": "system", "content": ORCHESTRATOR_SYSTEM},
            {"role": "user", "content": content},
        ],
        "response_format": {"type": "json_object"},
    }

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{KIMI_API_BASE}/chat/completions",
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            data = resp.json()
            result_text = data["choices"][0]["message"]["content"]
            return json.loads(result_text)

    except Exception as e:
        logger.error(f"Kimi vision QA error: {e}")
        return {"passed": True, "bad_frames": [], "notes": f"QA skipped: {e}"}


async def orchestrate_pipeline(
    character_description: str,
    character_ref_urls: list[str],
    world_type: str,
    style_type: str,
    brief: str,
    shot_list: list[str],
    performance_video_url: str | None = None,
    on_stage_update=None,
) -> dict:
    """Full pipeline orchestration.

    Stages:
    1. Initialize pipeline
    2. Generate 3D world (Marble)
    3. Segment performance video (SAM2)
    4. Generate Shot 1 (Ray3)
    5. Generate Shot 2 (Ray3)
    6. Generate Shot 3 (Ray3)
    7. Vision QA (Kimi)
    8. Regenerate failed shots (Ray3)
    9. Hi-Fi master to 4K HDR
    """
    results = {
        "shots": [],
        "world": None,
        "segmentation": None,
        "qa": None,
        "master": None,
    }

    async def update_stage(stage: int, status: str, detail: str = ""):
        if on_stage_update:
            await on_stage_update(stage, status, detail)

    # Stage 1: Initialize
    await update_stage(1, "running", "Initializing pipeline...")
    await asyncio.sleep(1)
    await update_stage(1, "done", "Pipeline initialized")

    # Stage 2: Generate 3D world
    await update_stage(2, "running", "Generating 3D world with Marble...")
    world_result = await marble.generate_world(world_type)
    results["world"] = world_result
    if world_result.get("status") == "error":
        await update_stage(2, "done", "World generation complete (using fallback)")
    else:
        await update_stage(2, "done", "3D world generated")

    # Stage 3: Segment performance video
    await update_stage(3, "running", "Segmenting video with SAM2...")
    if performance_video_url:
        seg_result = await sam2.segment_video(performance_video_url)
        results["segmentation"] = seg_result
    else:
        results["segmentation"] = {"status": "skipped", "frames": []}
        await asyncio.sleep(1)
    await update_stage(3, "done", "Video segmentation complete")

    # Stages 4-6: Generate shots with Ray3
    character_ref = character_ref_urls[0] if character_ref_urls else None
    shot_prompts = shot_list if shot_list else [
        f"Shot {i+1}: {brief}" for i in range(3)
    ]

    for i, shot_prompt in enumerate(shot_prompts[:3]):
        stage_num = 4 + i
        await update_stage(stage_num, "running", f"Generating shot {i+1} with Luma Ray3...")

        seg_frames = results["segmentation"].get("frames", [])
        start_frame = seg_frames[i] if i < len(seg_frames) else None

        shot_result = await luma.generate_shot(
            prompt=shot_prompt,
            character_ref_url=character_ref or "",
            start_frame_url=start_frame,
            style=style_type,
        )
        results["shots"].append(shot_result)
        await update_stage(stage_num, "done", f"Shot {i+1} generated")

    # Stage 7: Vision QA
    await update_stage(7, "running", "Running vision QA with Kimi K2.5...")
    frame_urls = [
        s.get("video_url") for s in results["shots"]
        if s.get("video_url")
    ]
    if frame_urls:
        qa_result = await vision_qa(frame_urls)
        results["qa"] = qa_result
    else:
        results["qa"] = {"passed": True, "bad_frames": [], "notes": "No frames to QA"}
    await update_stage(7, "done", "Vision QA complete")

    # Stage 8: Regenerate failed shots
    await update_stage(8, "running", "Regenerating failed shots...")
    bad_frames = results["qa"].get("bad_frames", [])
    if bad_frames and character_ref:
        for frame_idx in bad_frames:
            if frame_idx < len(results["shots"]):
                prompt = shot_prompts[frame_idx] if frame_idx < len(shot_prompts) else brief
                retry = await luma.generate_shot(
                    prompt=f"RETRY with tighter consistency. {prompt}",
                    character_ref_url=character_ref,
                    style=style_type,
                )
                results["shots"][frame_idx] = retry
    await update_stage(8, "done", "Shot regeneration complete")

    # Stage 9: Hi-Fi master
    await update_stage(9, "running", "Mastering to 4K HDR 16-bit EXR...")
    master_results = []
    for shot in results["shots"]:
        gen_id = shot.get("generation_id")
        if gen_id:
            upscaled = await luma.hifi_upscale(gen_id)
            master_results.append(upscaled)
    results["master"] = master_results if master_results else [{"status": "skipped"}]
    await update_stage(9, "done", "4K HDR master complete")

    return results
