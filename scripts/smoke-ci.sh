#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "== API =="
cd "$ROOT/packages/api"
pip install -r requirements-dev.txt -q
pip-audit -r requirements.txt
python -m pytest -q

echo "== Bot =="
cd "$ROOT/apps/bot"
pip install -r requirements-dev.txt -q
python -m pytest -q

echo "== Mini App =="
cd "$ROOT/apps/mini-app"
export VITE_API_URL="${VITE_API_URL:-https://ladder-production-642d.up.railway.app}"
npm ci
npm audit --audit-level=high
npm run lint
npm test
npm run build

echo "smoke-ci: OK"
