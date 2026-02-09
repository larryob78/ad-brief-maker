"""In-memory state store for MVP (replace with Redis for production)."""
from dataclasses import dataclass, field


@dataclass
class JobState:
    character_description: str = ""
    turntable_urls: list[dict] = field(default_factory=list)
    character_locked: bool = False
    character_ref_urls: list[str] = field(default_factory=list)
    world_type: str = ""
    style_type: str = ""
    brief: str = ""
    shot_list: list[str] = field(default_factory=list)
    conversation_history: list[dict] = field(default_factory=list)
    pipeline_stages: list[dict] = field(default_factory=list)
    pipeline_results: dict = field(default_factory=dict)


# Global state store keyed by job_id
jobs: dict[str, JobState] = {}

# Active WebSocket connections for pipeline updates
ws_connections: dict[str, list] = {}
