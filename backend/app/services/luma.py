"""Luma Ray3 (Dream Machine API) - Video Generation with Character Reference."""
import asyncio
import logging
import httpx
from app.config import settings

logger = logging.getLogger("napkin.luma")

LUMA_API_BASE = "https://api.lumalabs.ai/dream-machine/v1"


async def generate_shot(
    prompt: str,
    character_ref_url: str,
    start_frame_url: str | None = None,
    end_frame_url: str | None = None,
    style: str = "cinematic",
    aspect_ratio: str = "16:9",
) -> dict:
    """Generate a video shot using Luma Ray3 with character reference.

    Uses the Dream Machine API with modify mode for character-consistent shots.
    """
    headers = {
        "Authorization": f"Bearer {settings.LUMA_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "prompt": f"{style} style. {prompt}",
        "aspect_ratio": aspect_ratio,
        "loop": False,
        "character_ref": {"identity0": {"images": [character_ref_url]}},
    }

    if start_frame_url:
        payload["keyframes"] = {"frame0": {"type": "image", "url": start_frame_url}}
    if end_frame_url:
        if "keyframes" not in payload:
            payload["keyframes"] = {}
        payload["keyframes"]["frame1"] = {"type": "image", "url": end_frame_url}

    try:
        async with httpx.AsyncClient(timeout=300) as client:
            resp = await client.post(
                f"{LUMA_API_BASE}/generations",
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            generation = resp.json()
            gen_id = generation.get("id")

            # Poll for completion
            for _ in range(120):
                await asyncio.sleep(3)
                poll = await client.get(
                    f"{LUMA_API_BASE}/generations/{gen_id}",
                    headers=headers,
                )
                poll.raise_for_status()
                data = poll.json()
                state = data.get("state", "")

                if state == "completed":
                    video = data.get("assets", {}).get("video")
                    return {
                        "status": "done",
                        "video_url": video,
                        "generation_id": gen_id,
                    }
                elif state == "failed":
                    logger.error(f"Luma generation failed: {data.get('failure_reason')}")
                    return {
                        "status": "error",
                        "error": data.get("failure_reason", "Generation failed"),
                    }

    except Exception as e:
        logger.error(f"Luma API error: {e}")
        return {"status": "error", "error": str(e)}

    return {"status": "error", "error": "Luma generation timed out"}


async def hifi_upscale(generation_id: str) -> dict:
    """Apply Hi-Fi Diffusion to upscale a generation to 4K HDR."""
    headers = {
        "Authorization": f"Bearer {settings.LUMA_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=300) as client:
            resp = await client.post(
                f"{LUMA_API_BASE}/generations/{generation_id}/upscale",
                json={"target_resolution": "4k", "hdr": True, "bit_depth": 16},
                headers=headers,
            )
            resp.raise_for_status()
            data = resp.json()

            # Poll for upscale completion
            upscale_id = data.get("id", generation_id)
            for _ in range(60):
                await asyncio.sleep(5)
                poll = await client.get(
                    f"{LUMA_API_BASE}/generations/{upscale_id}",
                    headers=headers,
                )
                poll.raise_for_status()
                result = poll.json()

                if result.get("state") == "completed":
                    return {
                        "status": "done",
                        "video_url": result.get("assets", {}).get("video"),
                    }
                elif result.get("state") == "failed":
                    return {"status": "error", "error": "Hi-Fi upscale failed"}

    except Exception as e:
        logger.error(f"Luma upscale error: {e}")
        return {"status": "error", "error": str(e)}

    return {"status": "error", "error": "Upscale timed out"}
