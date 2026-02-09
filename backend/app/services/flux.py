"""FLUX Kontext Max - Character Turntable Generation via Replicate."""
import asyncio
import logging
import httpx
from app.config import settings

logger = logging.getLogger("napkin.flux")

ANGLES = ["Front", "3/4 Left", "Profile Left", "3/4 Back", "Back", "3/4 Right"]

REPLICATE_API = "https://api.replicate.com/v1/predictions"


async def generate_turntable(description: str, job_id: str, on_angle_done=None) -> list[dict]:
    """Generate 6-angle character turntable using FLUX Kontext Max on Replicate.

    Generates each angle sequentially with a 600ms stagger for the frontend reveal effect.
    Calls on_angle_done(angle_index, url) after each completes.
    """
    results = []
    headers = {
        "Authorization": f"Bearer {settings.REPLICATE_API_TOKEN}",
        "Content-Type": "application/json",
    }

    for i, angle in enumerate(ANGLES):
        prompt = (
            f"Professional character turntable reference sheet. "
            f"View: {angle}. "
            f"Character: {description}. "
            f"Clean white background, studio lighting, full body, "
            f"consistent character design across all angles, "
            f"high detail, concept art quality."
        )

        payload = {
            "version": "flux-kontext-max",
            "input": {
                "prompt": prompt,
                "aspect_ratio": "1:1",
                "output_format": "png",
                "num_outputs": 1,
            },
        }

        url = None
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                # Create prediction
                resp = await client.post(REPLICATE_API, json=payload, headers=headers)
                resp.raise_for_status()
                prediction = resp.json()
                prediction_id = prediction["id"]

                # Poll for completion
                for _ in range(60):
                    await asyncio.sleep(2)
                    poll = await client.get(
                        f"{REPLICATE_API}/{prediction_id}", headers=headers
                    )
                    poll.raise_for_status()
                    data = poll.json()
                    if data["status"] == "succeeded":
                        output = data.get("output")
                        if isinstance(output, list):
                            url = output[0]
                        elif isinstance(output, str):
                            url = output
                        break
                    elif data["status"] == "failed":
                        logger.error(f"FLUX generation failed for angle {angle}: {data.get('error')}")
                        break

        except Exception as e:
            logger.error(f"FLUX error for angle {angle}: {e}")

        result = {"angle": angle, "url": url, "status": "done" if url else "error"}
        results.append(result)

        if on_angle_done:
            await on_angle_done(i, result)

        # 600ms stagger between angles for reveal effect
        if i < len(ANGLES) - 1:
            await asyncio.sleep(0.6)

    return results
