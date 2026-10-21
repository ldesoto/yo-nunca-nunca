import { useState, useEffect, useCallback } from 'react';

export const useBombTimer = (minSeconds = 10, maxSeconds = 35) => {
  const [timeLeft, setTimeLeft] = useState(-1);
  const [isExploded, setIsExploded] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const startBomb = useCallback(() => {
    // Generar tiempo aleatorio entre min y max
    const randomTime = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
    setTimeLeft(randomTime);
    setIsExploded(false);
    setIsActive(true);
  }, [minSeconds, maxSeconds]);

  const stopBomb = useCallback(() => {
    setIsActive(false);
    setTimeLeft(-1);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsExploded(true);
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  return { isExploded, isActive, timeLeft, startBomb, stopBomb };
};
