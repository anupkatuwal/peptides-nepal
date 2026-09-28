import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from .config import get_settings
from .database import engine
from .rate_limit import limiter
from .routers import admin, auth, categories, contact, media, orders, payments, products

settings = get_settings()
logger = logging.getLogger("peptides_nepal")

app = FastAPI(
    title="Peptides Nepal API",
    version="1.0.0",
    # Interactive docs only outside production.
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None,
    openapi_url=None if settings.is_production else "/openapi.json",
)

# Rate limiting: per-route limits via @limiter.limit, default limit for the rest.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

MAX_BODY_BYTES = 1024 * 1024          # JSON requests
MAX_UPLOAD_BYTES = 9 * 1024 * 1024    # 8 MB file + multipart overhead


@app.middleware("http")
async def limit_body_size(request: Request, call_next):
    # Reject oversized bodies before they are read. Uploads are parsed before
    # the admin check runs, so this also stops anonymous large uploads.
    if request.method in {"POST", "PUT", "PATCH"}:
        limit = MAX_UPLOAD_BYTES if request.url.path == "/api/media" else MAX_BODY_BYTES
        length = request.headers.get("content-length")
        if length is None:
            if request.url.path == "/api/media":
                return JSONResponse(status_code=411, content={"detail": "Content-Length required"})
        elif not length.isdigit() or int(length) > limit:
            return JSONResponse(status_code=413, content={"detail": "Request body too large"})
    return await call_next(request)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Cache-Control"] = response.headers.get("Cache-Control", "no-store")
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


# Added last so it runs outermost: every response, including 413/429 errors, gets CORS headers.
# CORS: only the shop's own frontend may call the API from a browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,  # auth uses the Authorization header, not cookies
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,
)


@app.exception_handler(SQLAlchemyError)
async def database_error(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    # Log the details; never send SQL or driver messages to the client.
    logger.exception("Database error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=503, content={"detail": "Service temporarily unavailable. Please try again."})


app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(contact.router)
app.include_router(media.router)
app.include_router(admin.router)
app.include_router(payments.router)


@app.get("/api/health", tags=["health"])
@limiter.exempt
def health() -> dict[str, str]:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok"}
