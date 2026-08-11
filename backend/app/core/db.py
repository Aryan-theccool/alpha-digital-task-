import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from app.core.config import settings
from app.models.models import Base

logger = logging.getLogger("digital_alpha.db")

# Parse connection arguments based on database dialect
db_url = settings.DATABASE_URL
connect_args = {}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        poolclass=StaticPool,
        echo=settings.DEBUG,
    )
else:
    # PostgreSQL / Neon / Supabase connection pooling
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        echo=settings.DEBUG,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Initialize database tables according to SQLAlchemy metadata."""
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")


def get_db() -> Generator[Session, None, None]:
    """Dependency for providing request-scoped database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
