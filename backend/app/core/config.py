from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database Configuration
    DATABASE_URL: Optional[str] = (
        None  # Optional, will be built from components if not provided
    )
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    # Application Configuration
    APP_NAME: str = "Coffee Shop Management API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Security Configuration
    SECRET_KEY: Optional[str] = "your-secret-key-change-in-production-use-env-variable"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
