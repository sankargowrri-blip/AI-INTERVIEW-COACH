import logging
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Interview Coach"

    # Render/Neon supply postgres:// but SQLAlchemy needs postgresql://
    # The validator below normalises it automatically.
    DATABASE_URL: str = "sqlite:///./sql_app.db"

    JWT_SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # AI provider — "openai" or "gemini"
    AI_PROVIDER: str = "gemini"
    AI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None

    # CORS — set to deployed Vercel URL in production (comma-separated for multiple)
    FRONTEND_URL: str = "*"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def __init__(self, **data):
        super().__init__(**data)
        # Normalise Render/Neon postgres:// → postgresql://
        if self.DATABASE_URL.startswith("postgres://"):
            object.__setattr__(
                self,
                "DATABASE_URL",
                self.DATABASE_URL.replace("postgres://", "postgresql://", 1),
            )
        # Warn loudly if still using the SQLite fallback (i.e. no DATABASE_URL was set)
        if "sqlite" in self.DATABASE_URL:
            logger.warning(
                "DATABASE_URL is not set — using SQLite fallback. "
                "Set DATABASE_URL in your environment for production."
            )


settings = Settings()
