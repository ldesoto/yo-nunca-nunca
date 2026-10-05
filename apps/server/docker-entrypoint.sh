#!/bin/sh
set -e

: "${YNN_SQLITE_PATH:=/data/ynn.sqlite}"
db_dir="$(dirname "$YNN_SQLITE_PATH")"
mkdir -p "$db_dir"

export NODE_OPTIONS="${NODE_OPTIONS:---experimental-sqlite}"

cd /app
node /app/packages/db/dist/migrate.js

if [ ! -f "$YNN_SQLITE_PATH" ]; then
  node /app/packages/db/dist/seed.js
else
  count="$(node -e "
    import { openDb } from '/app/packages/db/dist/index.js';
    const db = openDb();
    const row = db.prepare('SELECT COUNT(*) AS c FROM questions WHERE active = 1').get();
    db.close();
    process.stdout.write(String(row.c));
  ")"
  if [ "$count" = "0" ]; then
    node /app/packages/db/dist/seed.js
  fi
fi

cd /app/apps/server
exec "$@"
