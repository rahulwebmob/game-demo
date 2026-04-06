import { useState, useRef, useCallback, useEffect } from "react";
import { useSound } from "./use-sound";

export type Phase = "idle" | "waiting" | "ready" | "result" | "done";
export const TOTAL_ROUNDS = 5;

export function useReactionTime(onComplete: (score: number) => void) {
  const sfx = useSound();
  const [phase, setPhase] = useState<Phase>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [tooEarly, setTooEarly] = useState(false);
  const readyAt = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tapped = useRef(false);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => clearTimeout(timeout.current);
  }, []);

  const start = useCallback(() => {
    tapped.current = false;
    setTooEarly(false);
    setPhase("waiting");
    const delay = 1500 + Math.random() * 3000;
    timeout.current = setTimeout(() => {
      readyAt.current = performance.now();
      setPhase("ready");
    }, delay);
  }, []);

  const handleTap = useCallback(() => {
    if (phase === "idle") {
      sfx("tap");
      start();
    } else if (phase === "waiting") {
      clearTimeout(timeout.current);
      sfx("error");
      setTooEarly(true);
      setPhase("idle");
    } else if (phase === "ready") {
      if (tapped.current) return;
      tapped.current = true;
      sfx("success");
      const ms = Math.round(performance.now() - readyAt.current);
      setCurrentTime(ms);
      const newTimes = [...times, ms];
      setTimes(newTimes);
      if (newTimes.length >= TOTAL_ROUNDS) {
        setPhase("done");
        const avg = Math.round(
          newTimes.reduce((a, b) => a + b, 0) / newTimes.length,
        );
        const score = Math.max(100 - Math.floor(avg / 7), 0);
        onComplete(score);
      } else {
        setPhase("result");
      }
    } else if (phase === "result") {
      sfx("tap");
      start();
    }
  }, [phase, times, start, onComplete, sfx]);

  const reset = useCallback(() => {
    setPhase("idle");
    setTimes([]);
    setCurrentTime(0);
    setTooEarly(false);
    tapped.current = false;
    clearTimeout(timeout.current);
  }, []);

  const avg =
    times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : 0;

  const score = Math.max(100 - Math.floor(avg / 7), 0);
  const stars = avg < 400 ? 3 : avg < 550 ? 2 : 1;
  const rating =
    avg < 250
      ? "Lightning Fast!"
      : avg < 350
        ? "Great Reflexes!"
        : avg < 500
          ? "Good Speed"
          : "Keep Practicing";

  return { phase, times, currentTime, tooEarly, avg, score, stars, rating, handleTap, reset };
}
