from decimal import Decimal
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
    # Public address of this API, used to build links to uploaded files.
    # Falls back to the address the request came in on.
    public_api_url: str | None = None
    # Public address of the Next.js site, used in emails and payment redirects.
    frontend_url: str = "http://localhost:3000"
    # Comma-separated list of exact origins, e.g. "https://shop.example.com"
    cors_origins: str = "http://localhost:3000"

    # --- Delivery (NPR) -------------------------------------------------
    # Shipping & handling. The shop delivers inside Kathmandu only.
    delivery_fee_inside_valley: Decimal = Field(default=Decimal("7500"), ge=0)
    delivery_outside_valley_enabled: bool = False
    delivery_fee_outside_valley: Decimal = Field(default=Decimal("0"), ge=0)
    # Orders whose items total at least this much ship free. 0 = no free-delivery offer.
    free_delivery_threshold: Decimal = Field(default=Decimal("0"), ge=0)

    # --- Email (SMTP) ---------------------------------------------------
    # Leave SMTP_HOST empty to switch email off (orders still work).
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_security: str = "starttls"  # "starttls" (port 587), "ssl" (port 465) or "none" (local testing only)
    mail_from: str = ""              # e.g. "Peptides Nepal <orders@yourdomain.com>"
    shop_notify_email: str = ""      # where new-order and contact alerts go
    password_reset_minutes: int = 60

    # --- Online payments ------------------------------------------------
    # "test" uses the eSewa/Khalti sandboxes; "live" takes real money.
    payments_env: str = "test"
    # eSewa ePay v2. In test mode, empty values fall back to eSewa's public
    # sandbox merchant (EPAYTEST). In live mode both are required.
    esewa_product_code: str = ""
    esewa_secret_key: str = ""
    # Khalti KPG-2 secret key (test key from test-admin.khalti.com, live key
    # from admin.khalti.com). Empty = Khalti online payment off.
    khalti_secret_key: str = ""

    # --- Rate limiting --------------------------------------------------
    rate_limit_enabled: bool = True
    # "memory://" works for one process. With several workers or servers use
    # Redis so they share counters, e.g. "redis://localhost:6379/0".
    rate_limit_storage_uri: str = "memory://"

    @field_validator("smtp_security")
    @classmethod
    def _smtp_security(cls, v: str) -> str:
        if v not in {"starttls", "ssl", "none"}:
            raise ValueError("smtp_security must be starttls, ssl or none")
        return v

    @field_validator("payments_env")
    @classmethod
    def _payments_env(cls, v: str) -> str:
        if v not in {"test", "live"}:
            raise ValueError("payments_env must be test or live")
        return v

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
    def email_enabled(self) -> bool:
        return bool(self.smtp_host and self.mail_from)

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
