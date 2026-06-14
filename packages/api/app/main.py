import logging
import os
import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.db.supabase import get_supabase
from app.logging_config import configure_logging
from app.middleware.rate_limit import limiter
from app.routes import auth, leaderboard, runs, share

logger = logging.getLogger(__name__)

_DEFAULT_CORS = [
    "https://www.promptanatomy.lol",
    "https://promptanatomy.lol",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]

_cors_env = os.getenv("CORS_ORIGINS", "")
CORS_ORIGINS = [o.strip() for o in _cors_env.split(",") if o.strip()] or _DEFAULT_CORS
_ALLOW_HEADERS = ["Content-Type"] if _cors_env else ["*"]

app = FastAPI(title="Corporate Ladder API", version="2.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


def _validate_production_config() -> None:
    if os.getenv("RAILWAY_ENVIRONMENT") and not settings.telegram_webapp_secret.strip():
        raise RuntimeError("TELEGRAM_WEBAPP_SECRET required in production")


_validate_production_config()
configure_logging()


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    path = request.url.path
    if path in ("/runs", "/share/prepare", "/auth/me"):
        logger.warning(
            "validation_error request_id=%s path=%s errors=%s",
            getattr(request.state, "request_id", None),
            path,
            exc.errors(),
        )
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=_ALLOW_HEADERS,
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(runs.router, prefix="/runs", tags=["runs"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])
app.include_router(share.router, prefix="/share", tags=["share"])


@app.get("/health")
def health():
    try:
        get_supabase().table("users").select("id").limit(1).execute()
    except Exception as exc:
        logger.error("health_db_probe_failed: %s", exc, exc_info=exc)
        return JSONResponse(
            status_code=503,
            content={"status": "degraded", "db": "unavailable"},
        )
    return {"status": "ok", "db": "ok"}
