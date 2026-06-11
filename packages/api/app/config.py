from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_CONFIG = Path(__file__).resolve()
_API_ROOT = _CONFIG.parents[1]

# Monorepo dev: packages/api/app/config.py → repo root is parents[3]
# Docker: /app/app/config.py → only /app exists; use env vars from Railway
try:
    _REPO_ROOT = _CONFIG.parents[3]
except IndexError:
    _REPO_ROOT = _API_ROOT

_ROOT_ENV = _REPO_ROOT / ".env"
_LOCAL_ENV = _API_ROOT / ".env"
_ENV_FILES = [str(p) for p in (_ROOT_ENV, _LOCAL_ENV) if p.is_file()]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=_ENV_FILES, extra="ignore")
    telegram_bot_token: str = ""
    telegram_webapp_secret: str = ""
    telegram_bot_username: str = "CorporateLadder_bot"
    prompt_anatomy_url: str = "https://www.promptanatomy.app"
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    @property
    def webapp_secret(self) -> str:
        return self.telegram_webapp_secret or self.telegram_bot_token


settings = Settings()
