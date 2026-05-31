#!/usr/bin/env bash
# Verify deploy artifacts and env template before production deploy.
# Manual steps (Railway, Vercel, BotFather) still required — see .cursor/skills/mini-app-deploy/SKILL.md
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Corporate Ladder deploy preflight ==="

required_files=(
  "supabase/migrations/001_initial_schema.sql"
  "packages/api/Dockerfile"
  "packages/api/railway.toml"
  "apps/bot/Dockerfile"
  "apps/bot/railway.toml"
  "apps/mini-app/vercel.json"
  ".env.example"
)

for f in "${required_files[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "MISSING: $f"
    exit 1
  fi
  echo "OK: $f"
done

required_vars=(
  TELEGRAM_BOT_TOKEN
  TELEGRAM_WEBAPP_SECRET
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  MINI_APP_URL
  VITE_API_URL
  VITE_BOT_USERNAME
)

for v in "${required_vars[@]}"; do
  if ! grep -q "^${v}=" .env.example; then
    echo "MISSING in .env.example: $v"
    exit 1
  fi
done
echo "OK: .env.example contains all required variables"

echo ""
echo "Manual deploy checklist:"
echo "  1. Supabase — run supabase/migrations/001_initial_schema.sql"
echo "  2. Railway — deploy packages/api with TELEGRAM_* and SUPABASE_*"
echo "  3. Vercel — deploy apps/mini-app with VITE_API_URL and VITE_BOT_USERNAME"
echo "  4. Railway — deploy apps/bot with MINI_APP_URL = Vercel URL"
echo "  5. BotFather — menu button + /setdomain for Vercel domain"
echo ""
echo "Preflight passed. Run ./scripts/smoke-local.sh before tagging a release."
