import React, { createContext, useContext, useMemo, useState } from 'react';
import type { GameRoom } from './api';

type Ctx = {
  room: GameRoom | null;
  setRoom: (r: GameRoom | null) => void;
  playerName: string;
  setPlayerName: (n: string) => void;
  roomCode: string;
  setRoomCode: (c: string) => void;
};

const GameContext = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const value = useMemo(
    () => ({ room, setRoom, playerName, setPlayerName, roomCode, setRoomCode }),
    [room, playerName, roomCode],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame outside provider');
  return ctx;
}
