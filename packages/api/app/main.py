import logging
import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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

app = FastAPI(title="Corporate Ladder API", version="2.0.0")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    path = request.url.path
    if path in ("/runs", "/share/prepare", "/auth/me"):
        logger.warning("validation_error path=%s errors=%s", path, exc.errors())
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(runs.router, prefix="/runs", tags=["runs"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])
app.include_router(share.router, prefix="/share", tags=["share"])


@app.get("/health")
def health():
    return {"status": "ok"}
