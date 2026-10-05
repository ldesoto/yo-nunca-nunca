import type { GamePhase } from './types.js';

const ORDER: GamePhase[] = [
  'LOBBY',
  'QUESTION',
  'WAITING_FOR_ANSWERS',
  'REVEAL',
  'SCORE',
  'NEXT_ROUND',
  'GAME_OVER',
];

export function isGamePhase(value: string): value is GamePhase {
  return (ORDER as string[]).includes(value);
}

/** Allowed transitions for Phase 1 (no VOTING). */
export function canTransition(from: GamePhase, to: GamePhase): boolean {
  const allowed: Record<GamePhase, GamePhase[]> = {
    LOBBY: ['QUESTION'],
    QUESTION: ['WAITING_FOR_ANSWERS'],
    WAITING_FOR_ANSWERS: ['REVEAL'],
    REVEAL: ['SCORE'],
    SCORE: ['NEXT_ROUND', 'QUESTION', 'GAME_OVER'],
    NEXT_ROUND: ['QUESTION'],
    GAME_OVER: ['LOBBY'],
  };
  return allowed[from].includes(to);
}

export function nextAfterScore(
  currentRound: number,
  totalRounds: number,
): GamePhase {
  if (currentRound >= totalRounds) return 'GAME_OVER';
  return 'QUESTION';
}
