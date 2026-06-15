#!/usr/bin/env bash
# Tier A local smoke — mirrors CI pytest/lint/test/build (fast pre-deploy).
# Playwright QA (viewport, layout, coffee) runs in CI only; use --full for local parity.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FULL=0
if [[ "${1:-}" == "--full" ]]; then
  FULL=1
fi

echo "==> API: pytest"
(cd "$ROOT/packages/api" && pip install -q -r requirements-dev.txt && python -m pytest)

echo "==> Bot: pytest"
(cd "$ROOT/apps/bot" && pip install -q -r requirements-dev.txt && python -m pytest)

echo "==> Mini-app: lint, test, build"
export VITE_API_URL="${VITE_API_URL:-https://ladder-production-642d.up.railway.app}"
(cd "$ROOT/apps/mini-app" && npm ci && npm run lint && npm test && npm run build)

if [[ "$FULL" -eq 1 ]]; then
  echo "==> Mini-app: Playwright QA (viewport, layout, coffee, SEO live)"
  (
    cd "$ROOT/apps/mini-app"
    npx playwright install chromium --with-deps
    npx vite preview --host 127.0.0.1 --port 4173 --strictPort &
    PREVIEW_PID=$!
    export PREVIEW_URL=http://127.0.0.1:4173
    for i in $(seq 1 30); do
      curl -sf "$PREVIEW_URL" >/dev/null && break
      sleep 1
    done
    curl -sf "$PREVIEW_URL" >/dev/null || { echo "Preview failed at $PREVIEW_URL"; kill "$PREVIEW_PID" 2>/dev/null || true; exit 1; }
    sleep 2
    npm run qa:viewport
    npm run qa:layout
    npm run qa:coffee || npm run qa:coffee
    npm run verify:seo:live
    kill "$PREVIEW_PID" 2>/dev/null || true
  )
  echo "==> Mini-app: OG + SEO asset checks"
  (cd "$ROOT/apps/mini-app" && npm run verify:og && npm run verify:seo)
fi

echo "smoke-ci: OK"
