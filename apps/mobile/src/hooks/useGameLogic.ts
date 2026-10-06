import { useState, useCallback } from 'react';

export const useGameLogic = (initialData: string[]) => {
  const [availableItems, setAvailableItems] = useState<string[]>(initialData);
  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const drawNext = useCallback(() => {
    setAvailableItems(prev => {
      if (prev.length === 0) {
        setIsFinished(true);
        return prev;
      }
      const randomIndex = Math.floor(Math.random() * prev.length);
      setCurrentItem(prev[randomIndex]);
      return prev.filter((_, index) => index !== randomIndex);
    });
  }, []);

  const resetGame = useCallback(() => {
    setAvailableItems(initialData);
    setCurrentItem(null);
    setIsFinished(false);
  }, [initialData]);

  return { currentItem, isFinished, drawNext, resetGame };
};
