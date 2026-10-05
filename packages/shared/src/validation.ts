import { MAX_PLAYERS, MIN_PLAYERS } from './types.js';

const OFFENSIVE = /\b(puto|puta|mierda|idiota|estupido|estúpido)\b/i;

export function sanitizePlayerName(raw: string): string {
  const cleaned = raw
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N} _.-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20);
  return cleaned || 'Jugador';
}

export function isValidPlayerName(name: string): boolean {
  const n = sanitizePlayerName(name);
  return n.length >= 2 && n.length <= 20 && !OFFENSIVE.test(n);
}

export function clampPlayerCount(n: number): number {
  return Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, Math.floor(n)));
}

export function canStartGame(playerCount: number): boolean {
  return playerCount >= MIN_PLAYERS && playerCount <= MAX_PLAYERS;
}
