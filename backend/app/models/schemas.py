from pydantic import BaseModel
from typing import Optional
from enum import Enum


class CharacterRequest(BaseModel):
    description: str


class TurntableAngle(BaseModel):
    angle: str
    url: Optional[str] = None
    status: str = "pending"  # pending | generating | done | error


class TurntableResponse(BaseModel):
    job_id: str
    angles: list[TurntableAngle]


class LockCharacterRequest(BaseModel):
    job_id: str


class WorldType(str, Enum):
    NEON_CITY = "neon_city"
    TROPICAL = "tropical"
    MOUNTAIN = "mountain"
    DESERT = "desert"
    UNDERWATER = "underwater"
    SPACE = "space"
    FOREST = "forest"
    URBAN = "urban"


class StyleType(str, Enum):
    CINEMATIC = "cinematic"
    DOCUMENTARY = "documentary"
    ANIME = "anime"
    NOIR = "noir"
    NEON = "neon"
    VINTAGE = "vintage"


class WorldRequest(BaseModel):
    world_type: WorldType


class BriefRequest(BaseModel):
    message: str
    character_description: str
    world_type: str
    style_type: str
    conversation_history: list[dict] = []


class ProduceRequest(BaseModel):
    character_description: str
    character_ref_urls: list[str]
    world_type: str
    style_type: str
    brief: str
    shot_list: list[str] = []
    performance_video_url: Optional[str] = None


class PipelineStage(BaseModel):
    stage: int
    label: str
    agent: str
    icon: str
    status: str = "pending"  # pending | running | done | error


class PipelineStatus(BaseModel):
    job_id: str
    stages: list[PipelineStage]
    current_stage: int
    output_url: Optional[str] = None
    error: Optional[str] = None
