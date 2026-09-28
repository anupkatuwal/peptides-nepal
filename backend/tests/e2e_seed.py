"""Creates the admin account the Playwright tests sign in with. Test databases only.

    python -m tests.e2e_seed
"""

import os

from sqlalchemy import select

from app.database import SessionLocal
from app.models import User
from app.security import hash_password

EMAIL = os.environ.get("E2E_ADMIN_EMAIL", "admin@example.com")
PASSWORD = os.environ.get("E2E_ADMIN_PASSWORD", "adminpass1")

with SessionLocal() as db:
    user = db.scalar(select(User).where(User.email == EMAIL))
    if user is None:
        db.add(User(full_name="E2E Admin", email=EMAIL, password_hash=hash_password(PASSWORD), role="Admin"))
    else:
        user.role, user.password_hash, user.password_changed_at = "Admin", hash_password(PASSWORD), None
    db.commit()
print(f"admin ready: {EMAIL}")
