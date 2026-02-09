import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    REPLICATE_API_TOKEN: str = os.getenv("REPLICATE_API_TOKEN", "")
    WORLD_LABS_API_KEY: str = os.getenv("WORLD_LABS_API_KEY", "")
    LUMA_API_KEY: str = os.getenv("LUMA_API_KEY", "")
    KIMI_API_TOKEN: str = os.getenv("KIMI_API_TOKEN", "")
    FLUX_API_KEY: str = os.getenv("FLUX_API_KEY", "")

    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]
    LOG_FILE: str = "logs/napkin.log"


settings = Settings()
