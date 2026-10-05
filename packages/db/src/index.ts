import pg from 'pg';

export function createPool(connectionString?: string) {
  const url =
    connectionString ||
    process.env.DATABASE_URL ||
    'postgres://ynn:ynn@127.0.0.1:5433/yo_nunca_nunca';
  return new pg.Pool({ connectionString: url, max: 10 });
}

export type DbQuestion = {
  id: string;
  text: string;
  category: string;
  adult_only: boolean;
  active: boolean;
};

export async function fetchActiveQuestions(
  pool: pg.Pool,
  categories: string[],
  limit: number,
): Promise<DbQuestion[]> {
  const useAll = categories.includes('todas') || categories.length === 0;
  if (useAll) {
    const { rows } = await pool.query<DbQuestion>(
      `SELECT id, text, category, adult_only, active
       FROM questions
       WHERE active = true AND adult_only = false
       ORDER BY random()
       LIMIT $1`,
      [limit],
    );
    return rows;
  }
  const { rows } = await pool.query<DbQuestion>(
    `SELECT id, text, category, adult_only, active
     FROM questions
     WHERE active = true AND adult_only = false AND category = ANY($1::text[])
     ORDER BY random()
     LIMIT $2`,
    [categories, limit],
  );
  return rows;
}
