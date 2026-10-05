import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Local SQLite only — never CardNexus / LEADS / DATABASE_URL. */
export function defaultDbPath(): string {
  if (process.env.YNN_SQLITE_PATH) {
    return resolve(process.env.YNN_SQLITE_PATH);
  }
  return resolve(__dirname, '../data/ynn.sqlite');
}

export type YnnDb = DatabaseSync;

export function openDb(dbPath = defaultDbPath()): YnnDb {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  return db;
}

export type DbQuestion = {
  id: string;
  text: string;
  category: string;
  adult_only: boolean;
  active: boolean;
};

export function migrate(db: YnnDb): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      category TEXT NOT NULL,
      adult_only INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS questions_category_idx ON questions (category);
    CREATE INDEX IF NOT EXISTS questions_active_idx ON questions (active);
  `);
}

export function fetchActiveQuestions(
  db: YnnDb,
  categories: string[],
  limit: number,
): DbQuestion[] {
  const useAll = categories.includes('todas') || categories.length === 0;
  const mapRow = (row: Record<string, unknown>): DbQuestion => ({
    id: String(row.id),
    text: String(row.text),
    category: String(row.category),
    adult_only: Boolean(row.adult_only),
    active: Boolean(row.active),
  });

  if (useAll) {
    const rows = db
      .prepare(
        `SELECT id, text, category, adult_only, active
         FROM questions
         WHERE active = 1 AND adult_only = 0
         ORDER BY RANDOM()
         LIMIT ?`,
      )
      .all(limit) as Record<string, unknown>[];
    return rows.map(mapRow);
  }

  const placeholders = categories.map(() => '?').join(', ');
  const rows = db
    .prepare(
      `SELECT id, text, category, adult_only, active
       FROM questions
       WHERE active = 1 AND adult_only = 0 AND category IN (${placeholders})
       ORDER BY RANDOM()
       LIMIT ?`,
    )
    .all(...categories, limit) as Record<string, unknown>[];
  return rows.map(mapRow);
}

/** @deprecated Use openDb — kept so old imports fail loudly if misused. */
export function createPool(): never {
  throw new Error(
    'Yo Nunca Nunca uses local SQLite (YNN_SQLITE_PATH), not Postgres/LEADS.',
  );
}
