import json
import logging
import re
import sys
from datetime import datetime, timezone

_SENSITIVE_URL = re.compile(r"token=eq\.[^&\s\"']+", re.IGNORECASE)


class RedactSensitiveLogFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        message = record.getMessage()
        if _SENSITIVE_URL.search(message):
            record.msg = _SENSITIVE_URL.sub("token=eq.[REDACTED]", message)
            record.args = ()
        return True


class JsonLogFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        for key in ("request_id", "path", "status", "telegram_id"):
            if hasattr(record, key):
                payload[key] = getattr(record, key)
        return json.dumps(payload, ensure_ascii=False)


def configure_logging() -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonLogFormatter())
    handler.addFilter(RedactSensitiveLogFilter())
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(logging.INFO)
    logging.getLogger("httpx").setLevel(logging.WARNING)
