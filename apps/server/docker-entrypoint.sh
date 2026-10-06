#!/bin/sh
set -e

: "${YNN_SQLITE_PATH:=/data/ynn.sqlite}"
db_dir="$(dirname "$YNN_SQLITE_PATH")"
mkdir -p "$db_dir"

export NODE_OPTIONS="${NODE_OPTIONS:---experimental-sqlite}"

cd /app
node /app/packages/db/dist/migrate.js
# Always upsert the current bank (idempotent). Free Render disks can keep a
# stale SQLite across deploys; skipping seed would leave old questions forever.
node /app/packages/db/dist/seed.js

cd /app/apps/server
exec "$@"
