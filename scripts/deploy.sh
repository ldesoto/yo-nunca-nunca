#!/usr/bin/env bash
# Idempotent deploy entrypoint. Default: Fly.io (persistent SQLite volume).
# Fallback: Render Blueprint (ephemeral SQLite on free tier).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLATFORM="${1:-fly}"

case "$PLATFORM" in
  fly)
    exec "${ROOT}/scripts/deploy_fly.sh"
    ;;
  render)
    exec "${ROOT}/scripts/deploy_render.sh"
    ;;
  *)
    echo "Usage: $0 [fly|render]"
    exit 1
    ;;
esac
