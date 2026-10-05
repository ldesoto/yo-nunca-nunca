import { Client, Room } from 'colyseus.js';
import { SERVER_HTTP, SERVER_WS } from './theme';

export type GameRoom = Room;

let client: Client | null = null;

export function getClient() {
  if (!client) client = new Client(SERVER_WS);
  return client;
}

export async function createParty(input: {
  playerName: string;
  rounds?: number;
  categories?: string[];
  solo?: boolean;
}) {
  const res = await fetch(`${SERVER_HTTP}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('No se pudo crear la sala');
  const data = (await res.json()) as { roomId: string; roomCode: string };
  const room = await getClient().joinById(data.roomId, {
    playerName: input.playerName,
  });
  return { room, roomCode: data.roomCode };
}

export async function joinParty(roomCode: string, playerName: string) {
  const code = roomCode.trim().toUpperCase();
  const res = await fetch(`${SERVER_HTTP}/rooms/${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error('Sala no encontrada');
  const data = (await res.json()) as { roomId: string };
  const room = await getClient().joinById(data.roomId, { playerName });
  return { room, roomCode: code };
}
