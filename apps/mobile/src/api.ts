import { Client, Room } from 'colyseus.js';
import { getServerHttp, getServerWs } from './serverEndpoints';
import {
  isRetryableError,
  isRetryableHttpStatus,
  withRenderColdStartRetry,
} from './renderColdStart';

export type GameRoom = Room;

let client: Client | null = null;
let clientWsUrl: string | null = null;

export function resetClient() {
  client = null;
  clientWsUrl = null;
}

export function getClient() {
  const ws = getServerWs();
  if (!client || clientWsUrl !== ws) {
    client = new Client(ws);
    clientWsUrl = ws;
  }
  return client;
}

async function fetchJsonWithRetry<T>(
  path: string,
  init: RequestInit | undefined,
  onProgress?: (message: string) => void,
): Promise<T> {
  return withRenderColdStartRetry(
    path,
    async () => {
      const res = await fetch(`${getServerHttp()}${path}`, init);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Sala no encontrada');
        }
        if (res.status >= 400 && res.status < 500 && !isRetryableHttpStatus(res.status)) {
          throw new Error(
            init?.method === 'POST' ? 'No se pudo crear la sala' : 'Sala no encontrada',
          );
        }
        if (isRetryableHttpStatus(res.status)) {
          throw new Error(`HTTP ${res.status}`);
        }
        throw new Error('No se pudo contactar al servidor');
      }
      return (await res.json()) as T;
    },
    onProgress,
  );
}

async function joinRoomWithRetry(
  roomId: string,
  options: { playerName: string },
  onProgress?: (message: string) => void,
) {
  return withRenderColdStartRetry(
    'conectar a la sala',
    async () => {
      resetClient();
      return getClient().joinById(roomId, options);
    },
    onProgress,
  );
}

export async function createParty(
  input: {
    playerName: string;
    rounds?: number;
    categories?: string[];
    solo?: boolean;
    mode?: 'fiesta' | 'parejas';
  },
  onProgress?: (message: string) => void,
) {
  const data = await fetchJsonWithRetry<{ roomId: string; roomCode: string }>(
    '/rooms',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
    onProgress,
  );
  const room = await joinRoomWithRetry(
    data.roomId,
    { playerName: input.playerName },
    onProgress,
  );
  return { room, roomCode: data.roomCode };
}

export async function joinParty(
  roomCode: string,
  playerName: string,
  onProgress?: (message: string) => void,
) {
  const code = roomCode.trim().toUpperCase();
  const data = await fetchJsonWithRetry<{ roomId: string }>(
    `/rooms/${encodeURIComponent(code)}`,
    undefined,
    onProgress,
  );
  const room = await joinRoomWithRetry(
    data.roomId,
    { playerName },
    onProgress,
  );
  return { room, roomCode: code };
}

export { isRetryableError };
