import { defaultDbPath, migrate, openDb } from './index.js';

const db = openDb();
try {
  migrate(db);
  console.log(`SQLite ready at ${defaultDbPath()}`);
} finally {
  db.close();
}
