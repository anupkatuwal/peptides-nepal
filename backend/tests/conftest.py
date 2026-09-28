import os

# Must be set before the app is imported.
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-that-is-long-enough-for-hs256"
os.environ["CORS_ORIGINS"] = "https://shop.example.com"
os.environ["ENVIRONMENT"] = "test"
os.environ["RATE_LIMIT_ENABLED"] = "false"
# Keep order totals equal to item totals in most tests; delivery rules have their own tests.
os.environ["DELIVERY_FEE_INSIDE_VALLEY"] = "0"

from decimal import Decimal  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Category, Product, User  # noqa: E402
from app.rate_limit import limiter  # noqa: E402
from app.security import hash_password  # noqa: E402


# Set TEST_DATABASE_URL to run the suite against SQL Server instead of SQLite, e.g.
# mssql+pyodbc://sa:<pw>@localhost:1433/PeptidesTest?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes
TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")


def _test_engine():
    if TEST_DATABASE_URL:
        return create_engine(TEST_DATABASE_URL)
    return create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)


@pytest.fixture()
def db_session():
    engine = _test_engine()
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with TestingSession() as s:
        recovery = Category(name="Recovery", slug="recovery", sort_order=1)
        fitness = Category(name="Fitness", slug="fitness", sort_order=2)
        s.add_all([recovery, fitness])
        s.flush()
        s.add_all(
            [
                Product(category_id=recovery.id, name="BPC-157 (5 mg)", slug="bpc-157-5mg",
                        description="A 15-amino-acid peptide.", price=Decimal("4500.00"), stock_level=3,
                        purity_percentage=Decimal("99.10")),
                Product(category_id=fitness.id, name="CJC-1295 / Ipamorelin", slug="cjc-ipa",
                        description="Two peptides in one vial.", price=Decimal("7500.00"), stock_level=10),
                Product(category_id=fitness.id, name="Hidden", slug="hidden", description="Not for sale.",
                        price=Decimal("1.00"), stock_level=10, is_active=False),
            ]
        )
        s.add(User(full_name="Admin", email="admin@example.com", password_hash=hash_password("adminpass1"), role="Admin"))
        s.commit()

    def override():
        with TestingSession() as s:
            yield s

    app.dependency_overrides[get_db] = override
    yield TestingSession
    app.dependency_overrides.clear()
    engine.dispose()


@pytest.fixture()
def client(db_session):
    return TestClient(app)


@pytest.fixture()
def rate_limited():
    limiter.enabled = True
    limiter.reset()
    yield
    limiter.enabled = False
    limiter.reset()


def auth_header(client: TestClient, email: str, password: str) -> dict[str, str]:
    r = client.post("/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}
