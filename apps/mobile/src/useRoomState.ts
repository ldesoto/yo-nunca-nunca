import { useEffect, useState } from 'react';
import type { GameRoom } from './api';

export type PublicPlayer = {
  sessionId: string;
  name: string;
  ready: boolean;
  score: number;
  connected: boolean;
  isHost: boolean;
  hasAnswered: boolean;
  yesCount: number;
  majorityCount: number;
  minorityCount: number;
};

export type Snapshot = {
  roomCode: string;
  phase: string;
  hostSessionId: string;
  currentRound: number;
  totalRounds: number;
  questionText: string;
  yesCount: number;
  totalAnswered: number;
  specialEvent: string;
  winnerName: string;
  revealedYesNames: string[];
  players: PublicPlayer[];
  mySessionId: string;
};

function readState(room: GameRoom): Snapshot {
  const s = room.state as any;
  const players: PublicPlayer[] = [];
  if (s.players) {
    s.players.forEach((p: any, sessionId: string) => {
      players.push({
        sessionId: p.sessionId || sessionId,
        name: p.name,
        ready: p.ready,
        score: p.score,
        connected: p.connected,
        isHost: p.isHost,
        hasAnswered: p.hasAnswered,
        yesCount: p.yesCount,
        majorityCount: p.majorityCount,
        minorityCount: p.minorityCount,
      });
    });
  }
  players.sort((a, b) => b.score - a.score);
  const revealed: string[] = [];
  if (s.revealedYesNames) {
    s.revealedYesNames.forEach((n: string) => revealed.push(n));
  }
  return {
    roomCode: s.roomCode,
    phase: s.phase,
    hostSessionId: s.hostSessionId,
    currentRound: s.currentRound,
    totalRounds: s.totalRounds,
    questionText: s.questionText,
    yesCount: s.yesCount,
    totalAnswered: s.totalAnswered,
    specialEvent: s.specialEvent,
    winnerName: s.winnerName,
    revealedYesNames: revealed,
    players,
    mySessionId: room.sessionId,
  };
}

export function useRoomState(room: GameRoom | null) {
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (!room) {
      setSnap(null);
      return;
    }
    const update = () => setSnap(readState(room));
    update();
    room.onStateChange(update);
    return () => {
      room.onStateChange(() => undefined);
    };
  }, [room]);

  return snap;
}
