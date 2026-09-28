from collections.abc import Iterator

from sqlalchemy import URL, create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings


class Base(DeclarativeBase):
    pass


def _database_url() -> str | URL:
    s = get_settings()
    if s.database_url:
        return s.database_url
    # URL.create escapes every part, so passwords with @ ; : etc. are safe.
    return URL.create(
        "mssql+pyodbc",
        username=s.db_user,
        password=s.db_password,
        host=s.db_server,
        port=s.db_port,
        database=s.db_name,
        query={
            "driver": s.db_driver,
            "Encrypt": "yes" if s.db_encrypt else "no",
            "TrustServerCertificate": "yes" if s.db_trust_server_certificate else "no",
        },
    )


def _create_engine() -> Engine:
    s = get_settings()
    url = _database_url()
    if str(url).startswith("sqlite"):
        # Used by the test suite only.
        return create_engine(url, connect_args={"check_same_thread": False})
    return create_engine(
        url,
        pool_size=s.db_pool_size,          # connections kept open per worker
        max_overflow=s.db_max_overflow,    # extra connections allowed under bursts
        pool_timeout=s.db_pool_timeout,    # seconds to wait for a free connection
        pool_recycle=s.db_pool_recycle,    # replace connections before idle timeouts drop them
        pool_pre_ping=True,                # test a connection before handing it out
        fast_executemany=True,
    )


engine = _create_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
