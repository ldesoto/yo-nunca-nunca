import { createPool } from './index.js';

const SQL = `
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  adult_only BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS questions_category_idx ON questions (category);
CREATE INDEX IF NOT EXISTS questions_active_idx ON questions (active) WHERE active = true;
`;

async function main() {
  const pool = createPool();
  try {
    await pool.query(SQL);
    console.log('Migrations applied.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
