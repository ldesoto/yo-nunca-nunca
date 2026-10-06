import { useEffect, useRef, useState } from 'react';
import type { GameRoom } from './api';
import { getClient } from './api';
import { track } from './analytics';
import { feedback } from './feedback';

export type ConnectionStatus = 'online' | 'connecting' | 'reconnecting' | 'lost';

/** Ventana alineada con cold start Render Hobby + reconnectionToken del servidor. */
const RECONNECT_BUDGET_MS = 60_000;
const RECONNECT_GAPS_MS = [1_000, 2_000, 3_000, 5_000, 8_000, 10_000, 12_000, 15_000];

let intentionalLeave = false;

/** Marca la salida como voluntaria (no intentar reconectar). */
export function markIntentionalLeave() {
  intentionalLeave = true;
}

export function clearIntentionalLeave() {
  intentionalLeave = false;
}

/**
 * Escucha caídas del websocket y reintenta con reconnectionToken (ventana ~60s en servidor).
 */
export function useRoomConnection(
  room: GameRoom | null,
  setRoom?: (r: GameRoom | null) => void,
): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>('online');
  const tokenRef = useRef<string | null>(null);
  const retrying = useRef(false);
  const roomRef = useRef(room);
  roomRef.current = room;

  useEffect(() => {
    if (!room) {
      setStatus('online');
      tokenRef.current = null;
      return;
    }

    clearIntentionalLeave();
    tokenRef.current = (room as { reconnectionToken?: string }).reconnectionToken ?? null;
    setStatus('online');

    const tryReconnect = async () => {
      if (intentionalLeave || retrying.current) return;
      const token = tokenRef.current;
      if (!token) {
        setStatus('lost');
        return;
      }
      retrying.current = true;
      setStatus('reconnecting');
      const started = Date.now();
      let attempt = 0;
      while (!intentionalLeave && Date.now() - started < RECONNECT_BUDGET_MS) {
        try {
          const next = await getClient().reconnect(token);
          track('player_reconnected', { attempt: attempt + 1 });
          void feedback({ sfx: 'tap', haptic: 'success' });
          tokenRef.current =
            (next as { reconnectionToken?: string }).reconnectionToken ?? token;
          setRoom?.(next);
          setStatus('online');
          retrying.current = false;
          return;
        } catch {
          const gap = RECONNECT_GAPS_MS[Math.min(attempt, RECONNECT_GAPS_MS.length - 1)]!;
          attempt += 1;
          const remaining = RECONNECT_BUDGET_MS - (Date.now() - started);
          if (remaining <= 0) break;
          await sleep(Math.min(gap, remaining));
        }
      }
      if (!intentionalLeave) setStatus('lost');
      retrying.current = false;
    };

    const onLeave = (code: number) => {
      if (intentionalLeave || code === 1000) {
        setStatus('online');
        return;
      }
      track('player_disconnected', { code });
      void feedback({ sfx: 'alert', haptic: 'warning' });
      setStatus('reconnecting');
      void tryReconnect();
    };

    room.onLeave(onLeave);
    room.onError(() => {
      if (intentionalLeave) return;
      track('player_disconnected', { reason: 'error' });
      setStatus('reconnecting');
      void tryReconnect();
    });
  }, [room, setRoom]);

  return status;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
