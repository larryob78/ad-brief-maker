"""Claude Opus 4.6 - Creative Strategy + Shot List Generation."""
import logging
from anthropic import AsyncAnthropic
from app.config import settings

logger = logging.getLogger("napkin.claude")

SYSTEM_PROMPT = """You are the Creative Director for Napkin AI Director — a production-grade AI video pipeline.

You help users craft compelling 30-second branded video spots. You have access to:
- The user's locked character design (turntable reference)
- The selected 3D world environment
- The selected visual style

Your job:
1. Help the user refine their ad brief through creative conversation
2. When they're ready, produce a detailed shot list with 5 shots for a 30-second spot

For each shot, specify:
- Camera angle (wide, medium, close-up, tracking, crane)
- Action description
- Character pose/emotion
- Lighting notes
- Duration (totaling ~30 seconds)

Be creative, specific, and cinematic. Think like a real commercial director."""


async def analyze_brief(
    message: str,
    character_description: str,
    world_type: str,
    style_type: str,
    conversation_history: list[dict] | None = None,
) -> dict:
    """Chat with Claude about the ad brief and generate shot lists."""
    if not settings.ANTHROPIC_API_KEY:
        return {
            "role": "assistant",
            "content": (
                "Great choices! Your character is locked and I can see your world and style selections. "
                "Tell me about your ad — what's the product, the mood, the story you want to tell? "
                "I'll help craft a cinematic shot list for your 30-second spot."
            ),
        }

    client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    context = (
        f"\n\nCurrent project context:\n"
        f"- Character: {character_description}\n"
        f"- World: {world_type}\n"
        f"- Style: {style_type}\n"
    )

    messages = []
    if conversation_history:
        messages.extend(conversation_history)
    messages.append({"role": "user", "content": message})

    try:
        response = await client.messages.create(
            model="claude-opus-4-6-20250219",
            max_tokens=2048,
            system=SYSTEM_PROMPT + context,
            messages=messages,
        )
        content = response.content[0].text
        return {"role": "assistant", "content": content}

    except Exception as e:
        logger.error(f"Claude API error: {e}")
        return {
            "role": "assistant",
            "content": f"I'm having trouble connecting right now. Let me try again — tell me about your ad concept and I'll help shape the creative direction.",
        }
