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

const ADULT_CATEGORIES = new Set(['picante', 'sin_filtro']);

/** True when the selected categories intentionally include adult content. */
export function categoriesAllowAdult(categories: string[]): boolean {
  if (categories.includes('todas') || categories.length === 0) return false;
  return categories.some((c) => ADULT_CATEGORIES.has(c));
}

const MINIMAL_SEED: Array<[string, string, string, number]> = [
  ['FB_001', 'Yo nunca nunca he inventado una emergencia para cancelar un plan confirmado', 'casual', 0],
  ['FB_002', 'Yo nunca nunca he tropezado en público y fingido que fue un baile', 'vergonzoso', 0],
  ['FB_003', 'Yo nunca nunca he despertado en un sofá desconocido sin recordar cómo llegué', 'fiesta', 0],
  ['FB_004', 'Yo nunca nunca he stalkiado la nueva pareja de mi ex como detective', 'relaciones', 0],
  ['FB_005', 'Yo nunca nunca he enviado nudes y luego entré en pánico de arrepentimiento', 'picante', 1],
  ['FB_006', 'Yo nunca nunca he mentido en algo tan grave que cambiaría cómo me miran aquí', 'sin_filtro', 1],
  ['FB_007', 'Yo nunca nunca he dicho "ya casi llego" estando todavía en pijama', 'casual', 0],
  ['FB_008', 'Yo nunca nunca he mandado un mensaje al jefe pensando que era el grupo', 'vergonzoso', 0],
  ['FB_009', 'Yo nunca nunca he hecho un shot de algo desconocido por no quedar mal', 'fiesta', 0],
  ['FB_010', 'Yo nunca nunca he leído mensajes ajenos en el teléfono de mi pareja', 'relaciones', 0],
  ['FB_011', 'Yo nunca nunca he tenido sexo donde podíamos ser descubiertos', 'picante', 1],
  ['FB_012', 'Yo nunca nunca he traicionado la confianza de un amigo por beneficio propio', 'sin_filtro', 1],
];

/** Idempotent fallback when Docker seed did not run (ephemeral disk, count 0). */
export function seedMinimalQuestions(db: YnnDb): number {
  const row = db
    .prepare('SELECT COUNT(*) AS c FROM questions WHERE active = 1')
    .get() as { c: number };
  if (row.c > 0) return row.c;

  const insert = db.prepare(
    `INSERT INTO questions (id, text, category, adult_only, active)
     VALUES (?, ?, ?, ?, 1)
     ON CONFLICT(id) DO UPDATE SET active = 1`,
  );
  db.exec('BEGIN');
  try {
    for (const [id, text, category, adult] of MINIMAL_SEED) {
      insert.run(id, text, category, adult);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  const after = db
    .prepare('SELECT COUNT(*) AS c FROM questions WHERE active = 1')
    .get() as { c: number };
  return after.c;
}

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
  const allowAdult = categoriesAllowAdult(categories);
  const mapRow = (row: Record<string, unknown>): DbQuestion => ({
    id: String(row.id),
    text: String(row.text),
    category: String(row.category),
    adult_only: Boolean(row.adult_only),
    active: Boolean(row.active),
  });

  const adultClause = allowAdult ? '' : 'AND adult_only = 0';

  if (useAll) {
    const rows = db
      .prepare(
        `SELECT id, text, category, adult_only, active
         FROM questions
         WHERE active = 1 ${adultClause}
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
       WHERE active = 1 ${adultClause} AND category IN (${placeholders})
       ORDER BY RANDOM()
       LIMIT ?`,
    )
    .all(...categories, limit) as Record<string, unknown>[];
  if (rows.length > 0) {
    return rows.map(mapRow);
  }
  const fallbackRows = db
    .prepare(
      `SELECT id, text, category, adult_only, active
       FROM questions
       WHERE active = 1 ${adultClause}
       ORDER BY RANDOM()
       LIMIT ?`,
    )
    .all(limit) as Record<string, unknown>[];
  return fallbackRows.map(mapRow);
}

/** @deprecated Use openDb — kept so old imports fail loudly if misused. */
export function createPool(): never {
  throw new Error(
    'Yo Nunca Nunca uses local SQLite (YNN_SQLITE_PATH), not Postgres/LEADS.',
  );
}
