import { Server, matchMaker } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createServer } from 'node:http';
import { buildCorsOptions } from './corsPolicy.js';
import {
  defaultDbPath,
  migrate,
  openDb,
  seedMinimalQuestions,
  type YnnDb,
} from '@ynn/db';
import { PartyRoom } from './rooms/PartyRoom.js';
import { resolveRoomCategories } from './premiumGate.js';
import { generateRoomCode, normalizeRoomCode } from '@ynn/shared';

const PORT = Number(process.env.PORT || 2567);

async function main() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: '32kb' }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  const roomLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes; intenta más tarde' },
  });
  app.use(apiLimiter);

  // Explicitly ignore DATABASE_URL / LEADS — this game uses local SQLite only.
  if (process.env.DATABASE_URL) {
    console.warn(
      'Ignoring DATABASE_URL (CardNexus/LEADS). Yo Nunca Nunca uses YNN_SQLITE_PATH / local SQLite.',
    );
  }

  let db: YnnDb | null = null;
  try {
    db = openDb();
    migrate(db);
    const activeCount = seedMinimalQuestions(db);
    console.log(`SQLite ready (${activeCount} questions) at ${defaultDbPath()}`);
  } catch (err) {
    console.warn('SQLite unavailable — using fallback questions', err);
    db = null;
  }

  app.get('/health', (_req, res) => {
    let questions = 0;
    if (db) {
      try {
        const row = db
          .prepare('SELECT COUNT(*) AS c FROM questions WHERE active = 1')
          .get() as { c: number };
        questions = Number(row?.c) || 0;
      } catch {
        questions = 0;
      }
    }
    const payload: Record<string, unknown> = {
      status: 'ok',
      service: 'yo-nunca-nunca',
      sqlite: Boolean(db),
      questions,
      timestamp: new Date().toISOString(),
    };
    if (process.env.NODE_ENV !== 'production') {
      payload.sqlitePath = db ? defaultDbPath() : null;
    }
    res.json(payload);
  });

  const httpServer = createServer(app);
  const gameServer = new Server({
    transport: new WebSocketTransport({ server: httpServer }),
  });

  gameServer.define('party', PartyRoom).filterBy(['roomCode']);

  const originalCreate = PartyRoom.prototype.onCreate;
  PartyRoom.prototype.onCreate = function patchedOnCreate(options = {}) {
    if (!options.db && db) {
      options = { ...options, db };
    }
    return originalCreate.call(this, options);
  };

  app.post('/rooms', roomLimiter, async (req, res) => {
    try {
      const playerName = String(req.body?.playerName || 'Host')
        .trim()
        .slice(0, 24) || 'Host';
      const roundsRaw = Number(req.body?.rounds || 12);
      const rounds = Number.isFinite(roundsRaw)
        ? Math.min(30, Math.max(3, Math.floor(roundsRaw)))
        : 12;
      const categories = resolveRoomCategories(
        Array.isArray(req.body?.categories)
          ? req.body.categories.map(String).slice(0, 12)
          : ['todas'],
      );
      const solo = Boolean(req.body?.solo);
      const mode = req.body?.mode === 'parejas' ? 'parejas' : 'fiesta';
      const roomCode = generateRoomCode();
      const room = await matchMaker.createRoom('party', {
        roomCode,
        playerName,
        rounds,
        categories,
        db,
        solo,
        mode,
      });
      res.json({
        roomId: room.roomId,
        roomCode,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'No se pudo crear la sala' });
    }
  });

  app.get('/rooms/:code', roomLimiter, async (req, res) => {
    const roomCode = normalizeRoomCode(req.params.code || '');
    try {
      const rooms = await matchMaker.query({ name: 'party', roomCode });
      const match = rooms[0];
      if (!match) {
        res.status(404).json({ error: 'Sala no encontrada' });
        return;
      }
      res.json({
        roomId: match.roomId,
        roomCode,
        clients: match.clients,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error buscando sala' });
    }
  });

  gameServer.onBeforeShutdown(async () => {
    db?.close();
  });

  httpServer.listen(PORT, () => {
    console.log(`Yo Nunca Nunca server on :${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
