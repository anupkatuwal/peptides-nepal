from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, HTTPException, Path, Query, Request, status
from sqlalchemy import false, select

from .. import email
from ..deps import AdminUser, DbSession
from ..models import ContactMessage
from ..rate_limit import CONTACT_LIMIT, limiter
from ..schemas import ContactAccepted, ContactCreate, ContactMessageOut

router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.post("", response_model=ContactAccepted, status_code=status.HTTP_202_ACCEPTED)
@limiter.limit(CONTACT_LIMIT)
def submit_contact(
    request: Request, body: ContactCreate, db: DbSession, background: BackgroundTasks
) -> ContactAccepted:
    # Honeypot filled in: it's a bot. Answer as if it worked so it doesn't adapt.
    if body.website:
        return ContactAccepted()

    message = ContactMessage(
        sender_name=body.sender_name,
        sender_email=body.sender_email.lower(),
        subject=body.subject,
        message_body=body.message_body,
    )
    db.add(message)
    db.commit()
    background.add_task(email.contact_alert, message)
    return ContactAccepted()


# --- Admin -----------------------------------------------------------------


@router.get("", response_model=list[ContactMessageOut])
def list_messages(
    db: DbSession,
    _: AdminUser,
    unread_only: bool = False,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
) -> list[ContactMessage]:
    stmt = select(ContactMessage).order_by(ContactMessage.is_read, ContactMessage.submitted_at.desc()).limit(limit)
    if unread_only:
        stmt = stmt.where(ContactMessage.is_read == false())
    return list(db.scalars(stmt))


@router.patch("/{message_id}/read", response_model=ContactMessageOut)
def mark_read(message_id: Annotated[int, Path(gt=0)], db: DbSession, _: AdminUser) -> ContactMessage:
    message = db.get(ContactMessage, message_id)
    if message is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Message not found")
    message.is_read = True
    db.commit()
    db.refresh(message)
    return message
