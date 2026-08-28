from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Interview Coach"
    DATABASE_URL: str = "sqlite:///./sql_app.db"  # Default for development
    
    JWT_SECRET_KEY: str = "secret"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenAI or other AI service API Keys
    AI_PROVIDER: str = "openai"  # "openai" or "gemini"
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    
    FRONTEND_URL: str = "*"
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
