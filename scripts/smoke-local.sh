#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Corporate Ladder local smoke ==="

echo "[1/5] API pytest..."
(cd packages/api && python -m pytest -q)

echo "[2/5] Bot import..."
(cd apps/bot && pip install -r requirements.txt -q && python -c "import main")

echo "[3/5] Mini-app lint, test, build..."
(cd apps/mini-app && npm run lint && npm test && npm run build)

echo "[4/5] Deploy preflight..."
"$ROOT/scripts/verify-deploy-config.sh"

echo ""
echo "Local smoke passed."
echo "Production smoke (manual, inside Telegram):"
echo "  - GET {API_URL}/health"
echo "  - /start -> Punch In & Climb"
echo "  - Complete run -> Daily leaderboard"
echo "  - Share button on game over"
