#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$(mktemp -d)"
LOG="$ROOT/docs/evidence/clean-clone.log"
mkdir -p "$ROOT/docs/evidence"
{
  echo "clean clone $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "dest $DEST"
  git -C "$ROOT" clone --local "$ROOT" "$DEST/repo"
  cd "$DEST/repo"
  env -u DATABASE_URL -u AUTH_SECRET -u GEMINI_API_KEY -u OPENAI_API_KEY -u ANTHROPIC_API_KEY \
    npm ci
  env -u DATABASE_URL -u AUTH_SECRET npm run setup
  env -u DATABASE_URL -u AUTH_SECRET npm run verify
  echo "clean clone ok"
} 2>&1 | tee "$LOG"
