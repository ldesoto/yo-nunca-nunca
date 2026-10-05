#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

APP_NAME="${FLY_APP_NAME:-yo-nunca-nunca}"
REGION="${FLY_REGION:-iad}"
VOLUME_NAME="${FLY_VOLUME_NAME:-ynn_data}"

export PATH="${FLYCTL_INSTALL:-$HOME/.fly}/bin:${PATH}"

if ! command -v flyctl >/dev/null 2>&1; then
  echo "flyctl not found. Run: ${ROOT}/scripts/install_flyctl.sh"
  exit 1
fi

# Non-interactive CI/local: https://fly.io/docs/machines/api/working-with-machines-api/#authentication
if [ -n "${FLY_API_TOKEN:-}" ]; then
  export FLY_ACCESS_TOKEN="$FLY_API_TOKEN"
fi

if ! flyctl auth whoami >/dev/null 2>&1; then
  echo "Not logged in."
  echo "  Interactive: flyctl auth login"
  echo "  Or export FLY_API_TOKEN from: flyctl tokens create deploy -x 999999h"
  echo "  Fallback host: ./scripts/deploy.sh render  (see render.yaml)"
  exit 1
fi

if ! flyctl apps list 2>/dev/null | awk '{print $1}' | grep -qx "$APP_NAME"; then
  echo "Creating Fly app: $APP_NAME"
  flyctl apps create "$APP_NAME" || {
    echo "If the name is taken, set FLY_APP_NAME=your-unique-name and update fly.toml + eas.json URLs."
    exit 1
  }
fi

if ! flyctl volumes list -a "$APP_NAME" 2>/dev/null | grep -q "$VOLUME_NAME"; then
  echo "Creating volume ${VOLUME_NAME} in ${REGION} (1GB)..."
  flyctl volumes create "$VOLUME_NAME" --size 1 -a "$APP_NAME" -r "$REGION" --yes
fi

flyctl deploy -a "$APP_NAME" --config fly.toml --ha=false

PUBLIC_URL="https://${APP_NAME}.fly.dev"
echo
echo "Deploy complete."
echo "  Health: ${PUBLIC_URL}/health"
echo "  HTTP API: ${PUBLIC_URL}"
echo "  WebSocket: wss://${APP_NAME}.fly.dev"
echo
echo "Verify:"
echo "  ${ROOT}/scripts/verify_public_health.sh ${PUBLIC_URL}"
echo
echo "eas.json preview/production should use:"
echo "  EXPO_PUBLIC_SERVER_URL=${PUBLIC_URL}"
echo "  EXPO_PUBLIC_WS_URL=wss://${APP_NAME}.fly.dev"
echo
echo "Next: cd apps/mobile && eas build -p android --profile preview"
