export type QuestionCategory =
  | 'casual'
  | 'vergonzoso'
  | 'fiesta'
  | 'relaciones'
  | 'picante'
  | 'sin_filtro'
  | 'todas';

export type GamePhase =
  | 'LOBBY'
  | 'QUESTION'
  | 'WAITING_FOR_ANSWERS'
  | 'WHO_WAS'
  | 'REVEAL'
  | 'SCORE'
  | 'NEXT_ROUND'
  | 'GAME_OVER';

export type AnswerChoice = 'never' | 'did';

export interface Question {
  id: string;
  text: string;
  category: Exclude<QuestionCategory, 'todas'>;
  adultOnly: boolean;
}

export interface RoomSettings {
  maxPlayers: number;
  rounds: number;
  answerTimeoutMs: number;
  categories: QuestionCategory[];
  allowCustomQuestions: boolean;
}

export interface PlayerPublic {
  sessionId: string;
  name: string;
  ready: boolean;
  score: number;
  connected: boolean;
  isHost: boolean;
}

export interface PlayerStats {
  yesCount: number;
  majorityCount: number;
  minorityCount: number;
}

export interface RoundAnswer {
  sessionId: string;
  choice: AnswerChoice;
}

export interface RoundResult {
  questionId: string;
  questionText: string;
  yesCount: number;
  totalAnswered: number;
  yesPlayers: string[];
  neverPlayers: string[];
  specialEvent: 'none' | 'nobody' | 'everyone';
  pointsAwarded: Record<string, number>;
}

export interface GameOverStats {
  totalRounds: number;
  winnerSessionId: string | null;
  winnerName: string | null;
  players: Array<{
    sessionId: string;
    name: string;
    score: number;
    yesCount: number;
    majorityCount: number;
    minorityCount: number;
  }>;
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  maxPlayers: 12,
  rounds: 12,
  answerTimeoutMs: 20_000,
  categories: ['todas'],
  allowCustomQuestions: false,
};

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 12;
