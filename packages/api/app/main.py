from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, leaderboard, runs

app = FastAPI(title="Corporate Ladder API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(runs.router, prefix="/runs", tags=["runs"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])


@app.get("/health")
def health():
    return {"status": "ok"}
