import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    # App config
    APP_NAME: str = "Digital Alpha API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Database configuration
    # Default to sqlite:///./digital_alpha.db for local dev if Postgres is not running
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./digital_alpha.db")

    # CORS origins
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,*")

    # Rewards rule settings
    COIN_EARN_RATE_INR: int = 100  # 1 coin per ₹100
    MAX_COIN_CAP_PER_TXN: int = 50  # Cap per transaction

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
