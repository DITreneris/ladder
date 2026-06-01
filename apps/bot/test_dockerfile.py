from pathlib import Path


def test_dockerfile_copies_all_bot_modules():
    """Railway image must include shifts.py (main.py imports it)."""
    dockerfile = (Path(__file__).parent / "Dockerfile").read_text(encoding="utf-8")
    assert "*.py" in dockerfile or "shifts.py" in dockerfile
