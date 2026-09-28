from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All configuration comes from environment variables (or a local .env file)."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = "production"

    # --- Database -------------------------------------------------------
    # Either give a full SQLAlchemy URL in DATABASE_URL, or the DB_* parts below.
    database_url: str | None = None
    db_server: str = "localhost"
    db_port: int = 1433
    db_name: str = "PeptidesNepal"
    db_user: str = "peptides_api"
    db_password: str = ""
    db_driver: str = "ODBC Driver 18 for SQL Server"
    db_encrypt: bool = True
    db_trust_server_certificate: bool = False

    # Connection pool (per worker process)
    db_pool_size: int = 10
    db_max_overflow: int = 20
    db_pool_timeout: int = 30
    db_pool_recycle: int = 1800

    # --- Auth -----------------------------------------------------------
    jwt_secret_key: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    # --- HTTP -----------------------------------------------------------
    # Comma-separated list of exact origins, e.g. "https://shop.example.com"
    cors_origins: str = "http://localhost:3000"

    # --- Rate limiting --------------------------------------------------
    rate_limit_enabled: bool = True
    # "memory://" works for one process. With several workers or servers use
    # Redis so they share counters, e.g. "redis://localhost:6379/0".
    rate_limit_storage_uri: str = "memory://"

    @field_validator("jwt_algorithm")
    @classmethod
    def _only_hmac(cls, v: str) -> str:
        if v not in {"HS256", "HS384", "HS512"}:
            raise ValueError("jwt_algorithm must be HS256, HS384 or HS512")
        return v

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]
        if "*" in origins:
            raise ValueError("CORS_ORIGINS must list exact origins, not '*'")
        return origins

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
