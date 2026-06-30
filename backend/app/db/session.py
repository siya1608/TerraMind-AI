from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

import logging
from sqlalchemy.exc import OperationalError

logger = logging.getLogger("terramind_ai.db")

connect_args = {}
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://", 1)

if db_url.startswith("postgresql"):
    try:
        # Test connection quickly
        temp_engine = create_engine(db_url, pool_pre_ping=True)
        # Try checking connectivity
        with temp_engine.connect() as conn:
            pass
        engine = temp_engine
    except Exception as e:
        logger.warning(f"⚠️ PostgreSQL database at {db_url} is unreachable. Falling back to local SQLite database.")
        db_url = "sqlite:///./terramind_ai.db"
        connect_args = {"check_same_thread": False}
        engine = create_engine(
            db_url,
            connect_args=connect_args,
            pool_pre_ping=True
        )
else:
    if db_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# DB session generator dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
