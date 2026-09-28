import hashlib
import secrets
from datetime import timedelta

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, status
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError

from .. import email
from ..config import get_settings
from ..deps import CurrentUser, DbSession
from ..models import PasswordResetToken, User, utcnow
from ..rate_limit import FORGOT_PASSWORD_LIMIT, LOGIN_LIMIT, REGISTER_LIMIT, RESET_PASSWORD_LIMIT, limiter
from ..schemas import (
    Detail,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserOut,
)
from ..security import create_access_token, hash_password, password_version, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _token_response(user: User) -> TokenResponse:
    token, expires_in = create_access_token(user.id, user.role, password_version(user.password_changed_at))
    return TokenResponse(access_token=token, expires_in=expires_in, user=UserOut.model_validate(user))


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(REGISTER_LIMIT)
def register(request: Request, body: RegisterRequest, db: DbSession) -> TokenResponse:
    if db.scalar(select(User.id).where(User.email == body.email)) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

    user = User(
        full_name=body.full_name,
        email=body.email,
        password_hash=hash_password(body.password),
        role="Customer",  # never taken from the request
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:  # two sign-ups with the same email at the same moment
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists") from None
    db.refresh(user)
    return _token_response(user)


@router.post("/login", response_model=TokenResponse)
@limiter.limit(LOGIN_LIMIT)
def login(request: Request, body: LoginRequest, db: DbSession) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == body.email))
    if not verify_password(body.password, user.password_hash if user else None):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _token_response(user)


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser) -> User:
    return user


_FORGOT_REPLY = "If an account uses that email, we've sent a link to reset the password."


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@router.post("/forgot-password", response_model=Detail, status_code=status.HTTP_202_ACCEPTED)
@limiter.limit(FORGOT_PASSWORD_LIMIT)
def forgot_password(
    request: Request, body: ForgotPasswordRequest, db: DbSession, background: BackgroundTasks
) -> Detail:
    # Same reply whether or not the account exists, so emails can't be probed.
    user = db.scalar(select(User).where(User.email == body.email))
    if user is None:
        return Detail(detail=_FORGOT_REPLY)

    now = utcnow()
    # Only the newest link works.
    db.execute(
        update(PasswordResetToken)
        .where(PasswordResetToken.user_id == user.id, PasswordResetToken.used_at.is_(None))
        .values(used_at=now)
        .execution_options(synchronize_session=False)
    )
    token = secrets.token_urlsafe(32)
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=_hash_token(token),
            expires_at=now + timedelta(minutes=get_settings().password_reset_minutes),
        )
    )
    db.commit()

    link = f"{get_settings().frontend_url.rstrip('/')}/reset-password?token={token}"
    background.add_task(email.password_reset, user.email, user.full_name, link)
    return Detail(detail=_FORGOT_REPLY)


@router.post("/reset-password", response_model=Detail)
@limiter.limit(RESET_PASSWORD_LIMIT)
def reset_password(request: Request, body: ResetPasswordRequest, db: DbSession) -> Detail:
    now = utcnow()
    record = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == _hash_token(body.token)))
    if record is None or record.used_at is not None or record.expires_at < now:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "This reset link is invalid or has expired. Please request a new one."
        )
    # Mark used with a conditional update so two simultaneous uses can't both win.
    claimed = db.execute(
        update(PasswordResetToken)
        .where(PasswordResetToken.id == record.id, PasswordResetToken.used_at.is_(None))
        .values(used_at=now)
        .execution_options(synchronize_session=False)
    ).rowcount
    if claimed != 1:
        db.rollback()
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This reset link has already been used.")

    user = db.get(User, record.user_id)
    user.password_hash = hash_password(body.password)
    # Changes the password version in new tokens, which signs out every existing session.
    user.password_changed_at = now.replace(microsecond=0)
    db.commit()
    return Detail(detail="Your password has been changed. Please sign in.")
