import type { GamePhase } from './types.js';

const ORDER: GamePhase[] = [
  'LOBBY',
  'QUESTION',
  'WAITING_FOR_ANSWERS',
  'WHO_WAS',
  'REVEAL',
  'SCORE',
  'NEXT_ROUND',
  'GAME_OVER',
];

export function isGamePhase(value: string): value is GamePhase {
  return (ORDER as string[]).includes(value);
}

/** Allowed phase transitions. */
export function canTransition(from: GamePhase, to: GamePhase): boolean {
  const allowed: Record<GamePhase, GamePhase[]> = {
    LOBBY: ['QUESTION'],
    QUESTION: ['WAITING_FOR_ANSWERS'],
    WAITING_FOR_ANSWERS: ['WHO_WAS', 'REVEAL'],
    WHO_WAS: ['REVEAL'],
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

/** Bonus points for correctly guessing who said "sí". */
export const WHO_WAS_BONUS = 60;
export const WHO_WAS_TIMEOUT_MS = 12_000;

/** True when this answer grants a WHO_WAS ballot (said "never"). */
export function grantsWhoWasVote(choice: string | undefined): boolean {
  return choice === 'never';
}
