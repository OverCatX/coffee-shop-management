from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus
from app.core.config import settings

# Build DATABASE_URL from components to handle special characters in password
# This properly handles passwords with @, :, /, etc.
encoded_password = quote_plus(settings.DB_PASSWORD)
database_url = f"postgresql+psycopg://{settings.DB_USER}:{encoded_password}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

# If DATABASE_URL is explicitly provided, use it instead (but still convert to psycopg)
if settings.DATABASE_URL:
    database_url = settings.DATABASE_URL
    # Convert postgresql:// to postgresql+psycopg:// if using psycopg (v3)
    if database_url.startswith("postgresql://") and "psycopg" not in database_url:
        database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

# Create database engine with connection pooling
engine = create_engine(
    database_url,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=settings.DEBUG,
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
