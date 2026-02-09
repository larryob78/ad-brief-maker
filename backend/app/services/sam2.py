"""SAM2 (Segment Anything 2) via Replicate - Video Segmentation."""
import asyncio
import logging
import httpx
from app.config import settings

logger = logging.getLogger("napkin.sam2")

REPLICATE_API = "https://api.replicate.com/v1/predictions"


async def segment_video(video_url: str) -> dict:
    """Segment a performance video using SAM2 on Replicate.

    Isolates the character from the background, outputting frames
    with transparent backgrounds.
    """
    headers = {
        "Authorization": f"Bearer {settings.REPLICATE_API_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "version": "meta/sam-2-video",
        "input": {
            "video": video_url,
            "output_format": "png_sequence",
            "points_per_side": 32,
            "pred_iou_thresh": 0.86,
            "stability_score_thresh": 0.92,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=300) as client:
            resp = await client.post(REPLICATE_API, json=payload, headers=headers)
            resp.raise_for_status()
            prediction = resp.json()
            prediction_id = prediction["id"]

            # Poll for completion
            for _ in range(120):
                await asyncio.sleep(3)
                poll = await client.get(
                    f"{REPLICATE_API}/{prediction_id}", headers=headers
                )
                poll.raise_for_status()
                data = poll.json()

                if data["status"] == "succeeded":
                    output = data.get("output", {})
                    return {
                        "status": "done",
                        "frames": output if isinstance(output, list) else [output],
                        "mask_url": output[0] if isinstance(output, list) and output else None,
                    }
                elif data["status"] == "failed":
                    logger.error(f"SAM2 segmentation failed: {data.get('error')}")
                    return {"status": "error", "error": data.get("error", "Segmentation failed")}

    except Exception as e:
        logger.error(f"SAM2 API error: {e}")
        return {"status": "error", "error": str(e)}

    return {"status": "error", "error": "SAM2 segmentation timed out"}
