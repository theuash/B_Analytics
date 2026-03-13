"""
Configuration settings for the backend API.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    google_api_key: str = ""
    database_url: str = "sqlite:///./dashboard.db"
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    debug: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
