import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPool } from './index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

type SeedQ = {
  id: string;
  text: string;
  category: string;
  adultOnly: boolean;
};

async function main() {
  const file = join(__dirname, '../seed/questions.json');
  const questions = JSON.parse(readFileSync(file, 'utf8')) as SeedQ[];
  if (questions.length < 300) {
    throw new Error(`Need >=300 questions, got ${questions.length}`);
  }

  const pool = createPool();
  try {
    await pool.query('BEGIN');
    for (const q of questions) {
      await pool.query(
        `INSERT INTO questions (id, text, category, adult_only, active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (id) DO UPDATE SET
           text = EXCLUDED.text,
           category = EXCLUDED.category,
           adult_only = EXCLUDED.adult_only,
           active = true`,
        [q.id, q.text, q.category, q.adultOnly],
      );
    }
    await pool.query('COMMIT');
    console.log(`Seeded ${questions.length} questions.`);
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
