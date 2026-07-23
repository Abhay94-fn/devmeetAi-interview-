import { useState, useEffect, useRef } from "react";

/**
 * Reusable timer hook supporting count-up or count-down, play, pause, reset.
 */
export default function useTimer(initialSeconds = 0, options = {}) {
  const { isCountDown = false, onExpiry } = options;
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (isCountDown) {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsActive(false);
              if (onExpiry) onExpiry();
              return 0;
            }
            return prev - 1;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, isCountDown, onExpiry]);

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);
  const reset = (secs = initialSeconds) => {
    setIsActive(false);
    setSeconds(secs);
  };

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    seconds,
    isActive,
    start,
    pause,
    reset,
    formatTime,
  };
}
