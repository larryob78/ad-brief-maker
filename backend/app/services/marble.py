"""Marble API (World Labs) - 3D World Generation."""
import asyncio
import logging
import httpx
from app.config import settings

logger = logging.getLogger("napkin.marble")

MARBLE_API_BASE = "https://api.worldlabs.ai/v1"

WORLD_CONFIGS = {
    "neon_city": {
        "prompt": "Futuristic neon-lit cyberpunk city at night, rain-slicked streets, holographic billboards, towering skyscrapers with LED strips, purple and cyan atmospheric lighting",
        "style": "cyberpunk",
    },
    "tropical": {
        "prompt": "Lush tropical paradise, crystal clear turquoise water, white sand beach, palm trees, golden hour sunlight, volumetric god rays through palm fronds",
        "style": "photorealistic",
    },
    "mountain": {
        "prompt": "Epic mountain landscape, snow-capped peaks, alpine meadow, dramatic clouds, golden hour, cinematic wide shot, pristine wilderness",
        "style": "photorealistic",
    },
    "desert": {
        "prompt": "Vast desert landscape, red sandstone formations, dramatic sunset, long shadows, heat haze, clear sky fading to deep orange",
        "style": "photorealistic",
    },
    "underwater": {
        "prompt": "Deep ocean underwater scene, bioluminescent coral reef, shafts of light from surface, exotic fish, crystal clear water, ethereal blue-green lighting",
        "style": "fantasy",
    },
    "space": {
        "prompt": "Orbital space station interior with large viewport, Earth visible below, stars and nebulae, sleek futuristic architecture, ambient blue lighting",
        "style": "sci-fi",
    },
    "forest": {
        "prompt": "Ancient enchanted forest, massive old-growth trees, dappled sunlight through canopy, moss-covered stones, mystical fog, fireflies",
        "style": "fantasy",
    },
    "urban": {
        "prompt": "Modern urban rooftop at golden hour, city skyline backdrop, string lights, concrete and glass architecture, warm atmospheric glow",
        "style": "photorealistic",
    },
}


async def generate_world(world_type: str) -> dict:
    """Generate a 3D world using the Marble (World Labs) API.

    Returns panorama images, enhanced video URL, and Gaussian splat data.
    """
    config = WORLD_CONFIGS.get(world_type, WORLD_CONFIGS["neon_city"])
    headers = {
        "Authorization": f"Bearer {settings.WORLD_LABS_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "prompt": config["prompt"],
        "style": config["style"],
        "output_formats": ["panorama", "video", "gaussian_splat"],
        "resolution": "4k",
        "camera_path": "orbit",
        "num_camera_positions": 5,
    }

    try:
        async with httpx.AsyncClient(timeout=300) as client:
            # Create world generation job
            resp = await client.post(
                f"{MARBLE_API_BASE}/worlds/generate",
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            job = resp.json()
            job_id = job.get("id", job.get("job_id"))

            # Poll for completion
            for _ in range(120):
                await asyncio.sleep(5)
                poll = await client.get(
                    f"{MARBLE_API_BASE}/worlds/{job_id}",
                    headers=headers,
                )
                poll.raise_for_status()
                data = poll.json()
                status = data.get("status", "")

                if status == "completed":
                    return {
                        "status": "done",
                        "panorama_urls": data.get("panorama_urls", []),
                        "video_url": data.get("video_url"),
                        "splat_url": data.get("gaussian_splat_url"),
                        "camera_positions": data.get("camera_positions", []),
                        "world_type": world_type,
                    }
                elif status in ("failed", "error"):
                    logger.error(f"Marble world generation failed: {data.get('error')}")
                    return {"status": "error", "error": data.get("error", "World generation failed")}

    except Exception as e:
        logger.error(f"Marble API error: {e}")
        return {"status": "error", "error": str(e)}

    return {"status": "error", "error": "World generation timed out"}
