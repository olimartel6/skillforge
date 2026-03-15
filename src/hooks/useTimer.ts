import { useState, useRef, useEffect, useCallback } from 'react';

export function useTimer(initialSeconds: number = 300) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialRef = useRef(initialSeconds);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    setIsRunning(true);
    setIsPaused(false);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPaused(true);
    setIsRunning(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!isPaused) return;
    setIsPaused(false);
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isPaused, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setRemaining(initialRef.current);
    setIsRunning(false);
    setIsPaused(false);
  }, [clearTimer]);

  // Update initial value if it changes
  useEffect(() => {
    initialRef.current = initialSeconds;
    setRemaining(initialSeconds);
  }, [initialSeconds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const progress = 1 - remaining / (initialRef.current || 1);

  return { remaining, isRunning, isPaused, start, pause, resume, reset, progress };
}
