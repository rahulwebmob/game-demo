import { useState, useEffect, useCallback, useRef } from "react";
import { useSound } from "./use-sound";

export const GRID = 9;
export const COLS = 3;
const MAX_LEVEL = 8;
const INITIAL_LIVES = 3;
const POINTS_PER_LEVEL = 15;

export function usePatternRecall(onComplete: (score: number) => void) {
  const sfx = useSound();
  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [phase, setPhase] = useState<
    "showing" | "input" | "correct" | "wrong" | "done"
  >("showing");
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const unmounted = useRef(false);
  const userPatternRef = useRef<number[]>([]);
  const phaseRef = useRef<"showing" | "input" | "correct" | "wrong" | "done">("showing");
  const livesRef = useRef(INITIAL_LIVES);
  const scoreRef = useRef(0);

  // Track unmount to prevent setState after cleanup
  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
    };
  }, []);

  const clearTimeouts = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }, []);

  const generatePattern = useCallback((len: number) => {
    const p: number[] = [];
    while (p.length < len) {
      const n = Math.floor(Math.random() * GRID);
      if (p[p.length - 1] !== n) p.push(n);
    }
    return p;
  }, []);

  const showPattern = useCallback((pat: number[]) => {
    phaseRef.current = "showing";
    setPhase("showing");
    clearTimeouts();
    pat.forEach((cell, i) => {
      const t1 = setTimeout(() => {
        if (!unmounted.current) setHighlighted(cell);
      }, i * 600 + 300);
      const t2 = setTimeout(() => {
        if (!unmounted.current) setHighlighted(null);
      }, i * 600 + 600);
      timeouts.current.push(t1, t2);
    });
    const t3 = setTimeout(() => {
      if (!unmounted.current) {
        phaseRef.current = "input";
        setPhase("input");
        setHighlighted(null);
      }
    }, pat.length * 600 + 400);
    timeouts.current.push(t3);
  }, [clearTimeouts]);

  const startRound = useCallback(
    (lvl: number) => {
      const len = lvl + 2;
      const pat = generatePattern(len);
      setLevel(lvl);
      setPattern(pat);
      userPatternRef.current = [];
      setUserPattern([]);
      showPattern(pat);
    },
    [generatePattern, showPattern],
  );

  useEffect(() => {
    startRound(1);
    return clearTimeouts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTap = useCallback(
    (cell: number) => {
      if (phaseRef.current !== "input") return;

      sfx("tap");
      const next = [...userPatternRef.current, cell];
      userPatternRef.current = next;
      setUserPattern(next);

      setHighlighted(cell);
      setTimeout(() => {
        if (!unmounted.current) setHighlighted(null);
      }, 150);

      const idx = next.length - 1;
      if (next[idx] !== pattern[idx]) {
        sfx("error");
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          phaseRef.current = "done";
          setPhase("done");
          onComplete(scoreRef.current);
        } else {
          phaseRef.current = "wrong";
          setPhase("wrong");
          setTimeout(() => {
            if (!unmounted.current) startRound(level);
          }, 1000);
        }
        return;
      }

      if (next.length === pattern.length) {
        sfx("success");
        const pts = level * POINTS_PER_LEVEL;
        scoreRef.current += pts;
        setScore(scoreRef.current);
        phaseRef.current = "correct";
        setPhase("correct");
        if (level >= MAX_LEVEL) {
          setTimeout(() => {
            if (!unmounted.current) {
              phaseRef.current = "done";
              setPhase("done");
              onComplete(scoreRef.current);
            }
          }, 800);
        } else {
          setTimeout(() => {
            if (!unmounted.current) startRound(level + 1);
          }, 1000);
        }
      }
    },
    [pattern, level, onComplete, sfx, startRound],
  );

  const reset = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    livesRef.current = INITIAL_LIVES;
    setLives(INITIAL_LIVES);
    phaseRef.current = "showing";
    setPhase("showing");
    userPatternRef.current = [];
    clearTimeouts();
    startRound(1);
  }, [clearTimeouts, startRound]);

  return { level, pattern, userPattern, phase, highlighted, score, lives, handleTap, reset, GRID, COLS };
}
