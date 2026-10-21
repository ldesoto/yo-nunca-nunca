import { useCallback, useEffect, useRef, useState } from 'react';
import { filterAvailable, markShown } from '../questionCooldown';

export function useGameLogic(packId: string, initialData: string[]) {
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [ready, setReady] = useState(false);
  const poolRef = useRef(initialData);
  poolRef.current = initialData;

  const reloadPool = useCallback(async () => {
    const pool = await filterAvailable(packId, poolRef.current);
    setAvailableItems(pool);
    setCurrentItem(null);
    setIsFinished(pool.length === 0);
    setReady(true);
  }, [packId]);

  useEffect(() => {
    setReady(false);
    void reloadPool();
  }, [reloadPool]);

  const readyRef = useRef(false);
  readyRef.current = ready;

  const drawNext = useCallback(() => {
    if (!readyRef.current) return;
    setAvailableItems((prev) => {
      if (prev.length === 0) {
        setIsFinished(true);
        return prev;
      }
      const randomIndex = Math.floor(Math.random() * prev.length);
      const picked = prev[randomIndex]!;
      setCurrentItem(picked);
      void markShown(packId, picked);
      return prev.filter((_, index) => index !== randomIndex);
    });
  }, [packId]);

  const resetGame = useCallback(async () => {
    setReady(false);
    await reloadPool();
  }, [reloadPool]);

  return { currentItem, isFinished, drawNext, resetGame, ready };
}
