import { Server, matchMaker } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { createPool } from '@ynn/db';
import { PartyRoom } from './rooms/PartyRoom.js';
import { generateRoomCode, normalizeRoomCode } from '@ynn/shared';

const PORT = Number(process.env.PORT || 2567);

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  let pool = null as ReturnType<typeof createPool> | null;
  try {
    pool = createPool();
    await pool.query('SELECT 1');
    console.log('Postgres connected');
  } catch (err) {
    console.warn('Postgres unavailable — using fallback questions', err);
    pool = null;
  }

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'yo-nunca-nunca',
      postgres: Boolean(pool),
      timestamp: new Date().toISOString(),
    });
  });

  const httpServer = createServer(app);
  const gameServer = new Server({
    transport: new WebSocketTransport({ server: httpServer }),
  });

  gameServer.define('party', PartyRoom).filterBy(['roomCode']);

  const originalCreate = PartyRoom.prototype.onCreate;
  PartyRoom.prototype.onCreate = function patchedOnCreate(options = {}) {
    if (!options.pool && pool) {
      options = { ...options, pool };
    }
    return originalCreate.call(this, options);
  };

  app.post('/rooms', async (req, res) => {
    try {
      const playerName = String(req.body?.playerName || 'Host');
      const rounds = Number(req.body?.rounds || 12);
      const categories = Array.isArray(req.body?.categories)
        ? req.body.categories.map(String)
        : ['todas'];
      const solo = Boolean(req.body?.solo);
      const roomCode = generateRoomCode();
      const room = await matchMaker.createRoom('party', {
        roomCode,
        playerName,
        rounds,
        categories,
        pool,
        solo,
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

  app.get('/rooms/:code', async (req, res) => {
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
    if (pool) await pool.end();
  });

  httpServer.listen(PORT, () => {
    console.log(`Yo Nunca Nunca server on :${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
