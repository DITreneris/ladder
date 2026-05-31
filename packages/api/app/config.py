from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_REPO_ROOT = Path(__file__).resolve().parents[3]
_ROOT_ENV = _REPO_ROOT / ".env"
_LOCAL_ENV = Path(__file__).resolve().parents[1] / ".env"
_ENV_FILES = [p for p in (_ROOT_ENV, _LOCAL_ENV) if p.is_file()] or [str(_ROOT_ENV)]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=_ENV_FILES, extra="ignore")
    telegram_bot_token: str = ""
    telegram_webapp_secret: str = ""
    supabase_url: str = ""
    supabase_service_role_key: str = ""

    @property
    def webapp_secret(self) -> str:
        return self.telegram_webapp_secret or self.telegram_bot_token


settings = Settings()
