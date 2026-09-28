import hashlib
import re
from typing import Annotated

from fastapi import APIRouter, File, HTTPException, Path, Request, Response, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import undefer

from ..config import get_settings
from ..deps import AdminUser, DbSession
from ..models import Media

router = APIRouter(prefix="/api/media", tags=["media"])

MAX_BYTES = 8 * 1024 * 1024

# The file's first bytes decide its type; the browser-sent Content-Type is ignored.
_SIGNATURES: list[tuple[str, bytes, int]] = [
    ("image/png", b"\x89PNG\r\n\x1a\n", 0),
    ("image/jpeg", b"\xff\xd8\xff", 0),
    ("application/pdf", b"%PDF-", 0),
]


def sniff_type(data: bytes) -> str | None:
    for content_type, magic, offset in _SIGNATURES:
        if data[offset : offset + len(magic)] == magic:
            return content_type
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None


def _clean_name(name: str | None) -> str:
    base = (name or "file").rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
    base = re.sub(r"[^A-Za-z0-9._-]+", "-", base).strip(".-") or "file"
    return base[:200]


_EXTENSIONS = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "application/pdf": ".pdf"}


def _with_extension(name: str, content_type: str) -> str:
    """Make the extension match the real type, e.g. a PDF called 'coa.png' becomes 'coa.pdf'."""
    stem = name.rsplit(".", 1)[0] if "." in name else name
    return f"{stem[:190]}{_EXTENSIONS[content_type]}"


def media_url(request: Request, media: Media) -> str:
    # The file name is decorative (the id decides), but its extension lets
    # the site tell a PDF from an image by looking at the link.
    base = get_settings().public_api_url or str(request.base_url)
    return f"{base.rstrip('/')}/api/media/{media.id}/{media.file_name}"


class MediaOut(BaseModel):
    id: int
    url: str
    file_name: str
    content_type: str
    size_bytes: int


@router.post("", response_model=MediaOut, status_code=status.HTTP_201_CREATED)
async def upload(
    request: Request,
    db: DbSession,
    admin: AdminUser,
    file: Annotated[UploadFile, File(description="PNG, JPEG, WebP or PDF, up to 8 MB")],
) -> MediaOut:
    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(status.HTTP_413_CONTENT_TOO_LARGE, "File is larger than 8 MB")
    if not data:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "File is empty")
    content_type = sniff_type(data)
    if content_type is None:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Only PNG, JPEG, WebP or PDF files are allowed")

    digest = hashlib.sha256(data).hexdigest()
    existing = db.scalar(select(Media).where(Media.sha256 == digest, Media.size_bytes == len(data)))
    media = existing or Media(
        file_name=_with_extension(_clean_name(file.filename), content_type),
        content_type=content_type,
        size_bytes=len(data),
        sha256=digest,
        data=data,
        uploaded_by=admin.id,
    )
    if existing is None:
        db.add(media)
        db.commit()
        db.refresh(media)
    return MediaOut(
        id=media.id,
        url=media_url(request, media),
        file_name=media.file_name,
        content_type=media.content_type,
        size_bytes=media.size_bytes,
    )


@router.get("/{media_id}/{file_name}", response_class=Response, include_in_schema=False)
def download_named(
    media_id: Annotated[int, Path(gt=0)], file_name: Annotated[str, Path(max_length=200)], db: DbSession
) -> Response:
    return download(media_id, db)


@router.get("/{media_id}", response_class=Response, responses={200: {"content": {"image/*": {}, "application/pdf": {}}}})
def download(media_id: Annotated[int, Path(gt=0)], db: DbSession) -> Response:
    media = db.scalar(select(Media).options(undefer(Media.data)).where(Media.id == media_id))
    if media is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File not found")
    return Response(
        content=media.data,
        media_type=media.content_type,
        headers={
            # A media id never changes content, so browsers and CDNs may keep it for a year.
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Disposition": f'inline; filename="{media.file_name}"',
            # Never run anything embedded in an uploaded file.
            "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
            "Cross-Origin-Resource-Policy": "cross-origin",
            "ETag": f'"{media.sha256}"',
        },
    )
