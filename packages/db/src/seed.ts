import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultDbPath, migrate, openDb } from './index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

type SeedQ = {
  id: string;
  text: string;
  category: string;
  adultOnly: boolean;
};

function loadLocaleMap(file: string): Record<string, string> {
  const raw = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [id, value] of Object.entries(raw)) {
    if (typeof value === 'string' && value.trim()) {
      out[id] = value.trim();
    }
  }
  return out;
}

const db = openDb();
try {
  migrate(db);
  const seedDir = join(__dirname, '../seed');
  const questions = JSON.parse(
    readFileSync(join(seedDir, 'questions.json'), 'utf8'),
  ) as SeedQ[];
  if (questions.length < 300) {
    throw new Error(`Need >=300 questions, got ${questions.length}`);
  }

  const enMap = loadLocaleMap(join(seedDir, 'questions.en.json'));
  const ptMap = loadLocaleMap(join(seedDir, 'questions.pt.json'));

  const missingEn = questions.filter((q) => !enMap[q.id]).map((q) => q.id);
  const missingPt = questions.filter((q) => !ptMap[q.id]).map((q) => q.id);
  if (missingEn.length || missingPt.length) {
    throw new Error(
      `Missing translations — en: ${missingEn.length} (${missingEn.slice(0, 5).join(', ')}), ` +
        `pt: ${missingPt.length} (${missingPt.slice(0, 5).join(', ')})`,
    );
  }

  const insert = db.prepare(
    `INSERT INTO questions (id, text, text_en, text_pt, category, adult_only, active)
     VALUES (?, ?, ?, ?, ?, ?, 1)
     ON CONFLICT(id) DO UPDATE SET
       text = excluded.text,
       text_en = excluded.text_en,
       text_pt = excluded.text_pt,
       category = excluded.category,
       adult_only = excluded.adult_only,
       active = 1`,
  );

  const seedIds = questions.map((q) => q.id);
  db.exec('BEGIN');
  db.prepare('UPDATE questions SET active = 0').run();
  for (const q of questions) {
    insert.run(
      q.id,
      q.text,
      enMap[q.id],
      ptMap[q.id],
      q.category,
      q.adultOnly ? 1 : 0,
    );
  }
  // Keep only the current bank active (drop stale IDs from older seeds).
  if (seedIds.length > 0) {
    const placeholders = seedIds.map(() => '?').join(', ');
    db.prepare(
      `DELETE FROM questions WHERE id NOT IN (${placeholders})`,
    ).run(...seedIds);
  }
  db.exec('COMMIT');
  console.log(
    `Seeded ${questions.length} questions (es/en/pt) into ${defaultDbPath()}`,
  );
} catch (err) {
  try {
    db.exec('ROLLBACK');
  } catch {
    // ignore
  }
  throw err;
} finally {
  db.close();
}
