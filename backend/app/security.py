from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from .config import get_settings

BCRYPT_ROUNDS = 12

# Checked against when an email is unknown, so a failed login takes the same
# time whether or not the account exists (stops email enumeration by timing).
_DUMMY_HASH = bcrypt.hashpw(b"not-a-real-password", bcrypt.gensalt(BCRYPT_ROUNDS))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(BCRYPT_ROUNDS)).decode("ascii")


def verify_password(password: str, password_hash: str | None) -> bool:
    candidate = password.encode("utf-8")
    if password_hash is None:
        bcrypt.checkpw(candidate, _DUMMY_HASH)
        return False
    try:
        return bcrypt.checkpw(candidate, password_hash.encode("ascii"))
    except ValueError:
        return False


def password_version(changed_at: datetime | None) -> int:
    """Identifies the current password. Changing the password changes it, which ends older sessions."""
    return 0 if changed_at is None else int(changed_at.replace(tzinfo=timezone.utc).timestamp())


def create_access_token(user_id: int, role: str, pwv: int = 0) -> tuple[str, int]:
    s = get_settings()
    now = datetime.now(timezone.utc)
    expires_in = s.access_token_expire_minutes * 60
    payload = {
        "sub": str(user_id),
        "role": role,
        "pwv": pwv,
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(seconds=expires_in),
        "iss": "peptides-nepal-api",
    }
    return jwt.encode(payload, s.jwt_secret_key, algorithm=s.jwt_algorithm), expires_in


def decode_access_token(token: str) -> dict:
    """Raises jwt.PyJWTError if the token is invalid, expired or tampered with."""
    s = get_settings()
    return jwt.decode(
        token,
        s.jwt_secret_key,
        algorithms=[s.jwt_algorithm],  # pinned: never trust the token's own "alg"
        issuer="peptides-nepal-api",
        options={"require": ["exp", "iat", "sub", "iss"]},
    )
