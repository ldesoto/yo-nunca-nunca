#!/usr/bin/env bash
# Curl public /health (post-deploy smoke test). Render free tier may cold-start ~60s.
set -euo pipefail

BASE="${1:-https://yo-nunca-nunca.onrender.com}"
URL="${BASE%/}/health"
MAX_WAIT="${HEALTH_MAX_WAIT_SEC:-120}"
INTERVAL="${HEALTH_POLL_SEC:-5}"

echo "GET ${URL} (up to ${MAX_WAIT}s for cold start)"

deadline=$((SECONDS + MAX_WAIT))
body=""
while [ "$SECONDS" -lt "$deadline" ]; do
  if body="$(curl -sfS --connect-timeout 20 --max-time 45 "$URL" 2>/dev/null)"; then
    break
  fi
  echo "  … waiting (${INTERVAL}s)"
  sleep "$INTERVAL"
done

if [ -z "$body" ]; then
  echo "Health check failed after ${MAX_WAIT}s" >&2
  exit 1
fi

echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
status="$(echo "$body" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null || true)"
if [ "$status" != "ok" ]; then
  echo "Unexpected health payload (expected status=ok)" >&2
  exit 1
fi
echo "OK"
