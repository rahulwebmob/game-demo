import { useState, useEffect, useCallback, useRef } from "react";
import { useSound } from "./use-sound";

export interface PatternRecallConfig {
  gridCols: number;
  gridSize: number;
  startLength: number;
  maxRounds: number;
  lives: number;
  showMs: number;
  gapMs: number;
  maxScore: number;
}

const DEFAULT_CONFIG: PatternRecallConfig = {
  gridCols: 3,
  gridSize: 9,
  startLength: 2,
  maxRounds: 8,
  lives: 3,
  showMs: 650,
  gapMs: 350,
  maxScore: 540,
};

export function usePatternRecall(onComplete: (score: number) => void, config?: PatternRecallConfig) {
  const sfx = useSound();
  const cfg = config ?? DEFAULT_CONFIG;

  // Points per round: round * pointsPerRound, where pointsPerRound is calibrated
  // so that completing all rounds = maxScore
  // Sum of 1..maxRounds = maxRounds*(maxRounds+1)/2
  // pointsPerRound = maxScore / sum
  const sumRounds = cfg.maxRounds * (cfg.maxRounds + 1) / 2;
  const pointsPerRound = Math.round(cfg.maxScore / sumRounds);

  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [phase, setPhase] = useState<
    "showing" | "input" | "correct" | "wrong" | "done"
  >("showing");
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(cfg.lives);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const unmounted = useRef(false);
  const userPatternRef = useRef<number[]>([]);
  const phaseRef = useRef<"showing" | "input" | "correct" | "wrong" | "done">("showing");
  const livesRef = useRef(cfg.lives);
  const scoreRef = useRef(0);

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
      const n = Math.floor(Math.random() * cfg.gridSize);
      if (p[p.length - 1] !== n) p.push(n);
    }
    return p;
  }, [cfg.gridSize]);

  const showPattern = useCallback((pat: number[]) => {
    phaseRef.current = "showing";
    setPhase("showing");
    clearTimeouts();
    const stepMs = cfg.showMs + cfg.gapMs;
    pat.forEach((cell, i) => {
      const t1 = setTimeout(() => {
        if (!unmounted.current) setHighlighted(cell);
      }, i * stepMs + cfg.gapMs);
      const t2 = setTimeout(() => {
        if (!unmounted.current) setHighlighted(null);
      }, i * stepMs + cfg.gapMs + cfg.showMs);
      timeouts.current.push(t1, t2);
    });
    const t3 = setTimeout(() => {
      if (!unmounted.current) {
        phaseRef.current = "input";
        setPhase("input");
        setHighlighted(null);
      }
    }, pat.length * stepMs + cfg.gapMs);
    timeouts.current.push(t3);
  }, [clearTimeouts, cfg.showMs, cfg.gapMs]);

  const startRound = useCallback(
    (lvl: number) => {
      const len = cfg.startLength + lvl - 1;
      const pat = generatePattern(len);
      setLevel(lvl);
      setPattern(pat);
      userPatternRef.current = [];
      setUserPattern([]);
      showPattern(pat);
    },
    [generatePattern, showPattern, cfg.startLength],
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
          // Replay the same pattern so the player can learn from their mistake
          setTimeout(() => {
            if (!unmounted.current) {
              userPatternRef.current = [];
              setUserPattern([]);
              showPattern(pattern);
            }
          }, 1000);
        }
        return;
      }

      if (next.length === pattern.length) {
        sfx("success");
        const pts = level * pointsPerRound;
        scoreRef.current += pts;
        setScore(scoreRef.current);
        phaseRef.current = "correct";
        setPhase("correct");
        if (level >= cfg.maxRounds) {
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
    [pattern, level, onComplete, sfx, startRound, pointsPerRound, cfg.maxRounds],
  );

  return {
    level, pattern, userPattern, phase, highlighted, score, lives, handleTap,
    gridSize: cfg.gridSize, gridCols: cfg.gridCols, maxRounds: cfg.maxRounds,
    pointsPerRound, maxScore: cfg.maxScore,
  };
}
