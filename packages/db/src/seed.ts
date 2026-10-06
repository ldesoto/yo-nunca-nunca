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

const db = openDb();
try {
  migrate(db);
  const file = join(__dirname, '../seed/questions.json');
  const questions = JSON.parse(readFileSync(file, 'utf8')) as SeedQ[];
  if (questions.length < 300) {
    throw new Error(`Need >=300 questions, got ${questions.length}`);
  }

  const insert = db.prepare(
    `INSERT INTO questions (id, text, category, adult_only, active)
     VALUES (?, ?, ?, ?, 1)
     ON CONFLICT(id) DO UPDATE SET
       text = excluded.text,
       category = excluded.category,
       adult_only = excluded.adult_only,
       active = 1`,
  );

  const seedIds = questions.map((q) => q.id);
  db.exec('BEGIN');
  db.prepare('UPDATE questions SET active = 0').run();
  for (const q of questions) {
    insert.run(q.id, q.text, q.category, q.adultOnly ? 1 : 0);
  }
  // Keep only the current bank active (drop stale IDs from older seeds).
  if (seedIds.length > 0) {
    const placeholders = seedIds.map(() => '?').join(', ');
    db.prepare(
      `DELETE FROM questions WHERE id NOT IN (${placeholders})`,
    ).run(...seedIds);
  }
  db.exec('COMMIT');
  console.log(`Seeded ${questions.length} questions into ${defaultDbPath()}`);
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
