#!/usr/bin/env bash
# Render.com — free Web Service with Docker (HTTPS/WSS). SQLite is ephemeral on free tier.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SERVICE_NAME="${RENDER_SERVICE_NAME:-yo-nunca-nunca}"
PUBLIC_HTTPS="https://${SERVICE_NAME}.onrender.com"
PUBLIC_WSS="wss://${SERVICE_NAME}.onrender.com"

echo "Target: ${PUBLIC_HTTPS}"
echo

if ! command -v render >/dev/null 2>&1; then
  echo "Render CLI not installed (optional)."
  echo "  brew install render   # or: npm i -g @renderinc/cli"
  echo
  echo "=== Blueprint (recommended, no CLI) ==="
  echo "1. Cuenta gratis: https://dashboard.render.com/register"
  echo "2. New → Blueprint → conecta este repo (GitHub/GitLab) o sube el repo primero."
  echo "   Sin remote git aún: crea repo vacío, push local, luego Blueprint apunta a render.yaml."
  echo "3. Render despliega Docker desde apps/server/Dockerfile; URL:"
  echo "     ${PUBLIC_HTTPS}"
  echo "4. Smoke test:"
  echo "     ./scripts/verify_public_health.sh ${PUBLIC_HTTPS}"
  echo
  echo "apps/mobile/eas.json ya usa ${PUBLIC_HTTPS} en preview/production."
  echo "Keep-alive gratis (menos sleep en pruebas): cron-job.org → GET ${PUBLIC_HTTPS}/health cada 10 min."
  exit 1
fi

if [ -n "${RENDER_API_KEY:-}" ]; then
  export RENDER_API_KEY
fi

if ! render whoami >/dev/null 2>&1; then
  if [ -n "${RENDER_API_KEY:-}" ]; then
    echo "RENDER_API_KEY is set but render whoami failed; check the key scope."
    exit 1
  fi
  echo "Not logged in. Run: render login"
  echo "  (or export RENDER_API_KEY from https://dashboard.render.com/u/settings#api-keys)"
  exit 1
fi

echo "Syncing Blueprint (render.yaml)..."
render blueprint sync --confirm

echo
echo "Deploy triggered. Cold start can take ~60s on free tier."
echo "  ./scripts/verify_public_health.sh ${PUBLIC_HTTPS}"
echo
echo "WebSocket: ${PUBLIC_WSS}"
echo "Optional keep-alive: cron-job.org ping ${PUBLIC_HTTPS}/health every 10 minutes."
