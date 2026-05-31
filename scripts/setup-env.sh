#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXAMPLE="$ROOT/.env.example"
ENV_FILE="$ROOT/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  if [[ ! -f "$EXAMPLE" ]]; then
    echo "error: .env.example not found" >&2
    exit 1
  fi
  cp "$EXAMPLE" "$ENV_FILE"
  echo "Created $ENV_FILE — fill in your credentials."
fi

for target in \
  "$ROOT/packages/api/.env" \
  "$ROOT/apps/bot/.env" \
  "$ROOT/apps/mini-app/.env"; do
  cp "$ENV_FILE" "$target"
  echo "Synced -> $target"
done

echo "Done. Services also read the root .env directly; sync is optional fallback."
