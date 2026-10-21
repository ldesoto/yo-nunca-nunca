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
  text_en: string;
  text_pt: string;
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

type MinimalRow = [string, string, string, string, string, number];

const MINIMAL_SEED: MinimalRow[] = [
  [
    'FB_001',
    'Yo nunca nunca he inventado una emergencia para cancelar un plan confirmado',
    'Never have I ever invented an emergency to cancel confirmed plans',
    'Eu nunca inventei uma emergência pra cancelar um plano confirmado',
    'casual',
    0,
  ],
  [
    'FB_002',
    'Yo nunca nunca he tropezado en público y fingido que fue un baile',
    'Never have I ever tripped in public and pretended it was a dance move',
    'Eu nunca tropecei em público e fingi que foi uma dança',
    'vergonzoso',
    0,
  ],
  [
    'FB_003',
    'Yo nunca nunca he despertado en un sofá desconocido sin recordar cómo llegué',
    "Never have I ever woken up on a stranger's couch with no idea how I got there",
    'Eu nunca acordei num sofá desconhecido sem lembrar como cheguei',
    'fiesta',
    0,
  ],
  [
    'FB_004',
    'Yo nunca nunca he stalkiado la nueva pareja de mi ex como detective',
    "Never have I ever stalked my ex's new partner like a detective",
    'Eu nunca stalkeei o novo crush do meu ex como detetive',
    'relaciones',
    0,
  ],
  [
    'FB_005',
    'Yo nunca nunca he enviado nudes y luego entré en pánico de arrepentimiento',
    'Never have I ever sent nudes and then panicked with regret',
    'Eu nunca mandei nudes e depois entrei em pânico de arrependimento',
    'picante',
    1,
  ],
  [
    'FB_006',
    'Yo nunca nunca he mentido en algo tan grave que cambiaría cómo me miran aquí',
    'Never have I ever lied about something so big it would change how people see me here',
    'Eu nunca menti algo tão grave que mudaria como me olham aqui',
    'sin_filtro',
    1,
  ],
  [
    'FB_007',
    'Yo nunca nunca he dicho "ya casi llego" estando todavía en pijama',
    'Never have I ever said "I\'m almost there" while still in pajamas',
    'Eu nunca disse "já tô chegando" ainda de pijama',
    'casual',
    0,
  ],
  [
    'FB_008',
    'Yo nunca nunca he mandado un mensaje al jefe pensando que era el grupo',
    'Never have I ever texted my boss thinking it was the group chat',
    'Eu nunca mandei mensagem pro chefe achando que era o grupo',
    'vergonzoso',
    0,
  ],
  [
    'FB_009',
    'Yo nunca nunca he hecho un shot de algo desconocido por no quedar mal',
    "Never have I ever taken a shot of something unknown just so I wouldn't look lame",
    'Eu nunca tomei um shot de algo desconhecido pra não ficar mal',
    'fiesta',
    0,
  ],
  [
    'FB_010',
    'Yo nunca nunca he leído mensajes ajenos en el teléfono de mi pareja',
    "Never have I ever read someone else's messages on my partner's phone",
    'Eu nunca li mensagens alheias no celular do meu parceiro',
    'relaciones',
    0,
  ],
  [
    'FB_011',
    'Yo nunca nunca he tenido sexo donde podíamos ser descubiertos',
    'Never have I ever had sex somewhere we could get caught',
    'Eu nunca fiz sexo onde a gente podia ser descoberto',
    'picante',
    1,
  ],
  [
    'FB_012',
    'Yo nunca nunca he traicionado la confianza de un amigo por beneficio propio',
    "Never have I ever betrayed a friend's trust for my own benefit",
    'Eu nunca traí a confiança de um amigo por benefício próprio',
    'sin_filtro',
    1,
  ],
];

/** Idempotent fallback when Docker seed did not run (ephemeral disk, count 0). */
export function seedMinimalQuestions(db: YnnDb): number {
  const row = db
    .prepare('SELECT COUNT(*) AS c FROM questions WHERE active = 1')
    .get() as { c: number };
  if (row.c > 0) return row.c;

  const insert = db.prepare(
    `INSERT INTO questions (id, text, text_en, text_pt, category, adult_only, active)
     VALUES (?, ?, ?, ?, ?, ?, 1)
     ON CONFLICT(id) DO UPDATE SET
       text = excluded.text,
       text_en = excluded.text_en,
       text_pt = excluded.text_pt,
       active = 1`,
  );
  db.exec('BEGIN');
  try {
    for (const [id, text, textEn, textPt, category, adult] of MINIMAL_SEED) {
      insert.run(id, text, textEn, textPt, category, adult);
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

function tableColumns(db: YnnDb, table: string): Set<string> {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{
    name: string;
  }>;
  return new Set(rows.map((r) => r.name));
}

export function migrate(db: YnnDb): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      text_en TEXT NOT NULL DEFAULT '',
      text_pt TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      adult_only INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS questions_category_idx ON questions (category);
    CREATE INDEX IF NOT EXISTS questions_active_idx ON questions (active);
  `);

  // Existing DBs created before i18n: add translation columns.
  const cols = tableColumns(db, 'questions');
  if (!cols.has('text_en')) {
    db.exec(`ALTER TABLE questions ADD COLUMN text_en TEXT NOT NULL DEFAULT ''`);
  }
  if (!cols.has('text_pt')) {
    db.exec(`ALTER TABLE questions ADD COLUMN text_pt TEXT NOT NULL DEFAULT ''`);
  }
}

function mapQuestionRow(row: Record<string, unknown>): DbQuestion {
  return {
    id: String(row.id),
    text: String(row.text),
    text_en: String(row.text_en ?? ''),
    text_pt: String(row.text_pt ?? ''),
    category: String(row.category),
    adult_only: Boolean(row.adult_only),
    active: Boolean(row.active),
  };
}

export function fetchActiveQuestions(
  db: YnnDb,
  categories: string[],
  limit: number,
): DbQuestion[] {
  const useAll = categories.includes('todas') || categories.length === 0;
  const allowAdult = categoriesAllowAdult(categories);
  const adultClause = allowAdult ? '' : 'AND adult_only = 0';
  const selectCols = 'id, text, text_en, text_pt, category, adult_only, active';

  if (useAll) {
    const rows = db
      .prepare(
        `SELECT ${selectCols}
         FROM questions
         WHERE active = 1 ${adultClause}
         ORDER BY RANDOM()
         LIMIT ?`,
      )
      .all(limit) as Record<string, unknown>[];
    return rows.map(mapQuestionRow);
  }

  const placeholders = categories.map(() => '?').join(', ');
  const rows = db
    .prepare(
      `SELECT ${selectCols}
       FROM questions
       WHERE active = 1 ${adultClause} AND category IN (${placeholders})
       ORDER BY RANDOM()
       LIMIT ?`,
    )
    .all(...categories, limit) as Record<string, unknown>[];
  if (rows.length > 0) {
    return rows.map(mapQuestionRow);
  }
  const fallbackRows = db
    .prepare(
      `SELECT ${selectCols}
       FROM questions
       WHERE active = 1 ${adultClause}
       ORDER BY RANDOM()
       LIMIT ?`,
    )
    .all(limit) as Record<string, unknown>[];
  return fallbackRows.map(mapQuestionRow);
}

/** @deprecated Use openDb — kept so old imports fail loudly if misused. */
export function createPool(): never {
  throw new Error(
    'Yo Nunca Nunca uses local SQLite (YNN_SQLITE_PATH), not Postgres/LEADS.',
  );
}
