import type { AnswerChoice, RoundAnswer, RoundResult } from './types.js';

const BASE_YES = 100;
const MINORITY_BONUS = 80;
const MAJORITY_PENALTY = 20;
const EVERYONE_BONUS = 40;
const NOBODY_BONUS = 30;
const NEVER_SAFE = 10;

export interface ScoreInput {
  answers: RoundAnswer[];
  questionId: string;
  questionText: string;
}

/**
 * Server-side only. Minority "did" answers score higher than majority.
 */
export function scoreRound(input: ScoreInput): RoundResult {
  const answered = input.answers.filter(
    (a) => a.choice === 'never' || a.choice === 'did',
  );
  const yesPlayers = answered
    .filter((a) => a.choice === 'did')
    .map((a) => a.sessionId);
  const neverPlayers = answered
    .filter((a) => a.choice === 'never')
    .map((a) => a.sessionId);

  const yesCount = yesPlayers.length;
  const totalAnswered = answered.length;
  const pointsAwarded: Record<string, number> = {};

  let specialEvent: RoundResult['specialEvent'] = 'none';
  if (totalAnswered > 0 && yesCount === 0) specialEvent = 'nobody';
  if (totalAnswered > 0 && yesCount === totalAnswered) specialEvent = 'everyone';

  const yesIsMinority = yesCount > 0 && yesCount < totalAnswered / 2;
  const yesIsMajority = yesCount > totalAnswered / 2;

  for (const a of answered) {
    let pts = 0;
    if (a.choice === 'did') {
      pts = BASE_YES;
      if (yesIsMinority) pts += MINORITY_BONUS;
      if (yesIsMajority) pts -= MAJORITY_PENALTY;
      if (specialEvent === 'everyone') pts += EVERYONE_BONUS;
    } else {
      pts = NEVER_SAFE;
      if (specialEvent === 'nobody') pts += NOBODY_BONUS;
    }
    pointsAwarded[a.sessionId] = Math.max(0, pts);
  }

  return {
    questionId: input.questionId,
    questionText: input.questionText,
    yesCount,
    totalAnswered,
    yesPlayers,
    neverPlayers,
    specialEvent,
    pointsAwarded,
  };
}

export function isMinorityYes(
  choice: AnswerChoice,
  yesCount: number,
  total: number,
): boolean {
  return choice === 'did' && yesCount > 0 && yesCount < total / 2;
}

export function isMajorityYes(
  choice: AnswerChoice,
  yesCount: number,
  total: number,
): boolean {
  return choice === 'did' && yesCount > total / 2;
}
