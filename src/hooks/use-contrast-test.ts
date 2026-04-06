import { useState, useCallback, useEffect, useRef } from "react";
import { useSound } from "./use-sound";

export interface ContrastTestConfig {
  rounds: number;
  startGrid: number;
  startDiff: number;
  maxScore: number;
}

const DEFAULT_CONFIG: ContrastTestConfig = {
  rounds: 12,
  startGrid: 2,
  startDiff: 22,
  maxScore: 318,
};

function gridForRound(round: number, totalRounds: number, startGrid: number): { grid: number; cols: number } {
  // Scale grid size across rounds from startGrid² to larger grids
  const t = totalRounds > 1 ? round / (totalRounds - 1) : 0;
  const cols = Math.min(Math.round(startGrid + t * 2), 5);
  return { grid: cols * cols, cols };
}

function generatePositions(size: number) {
  return { oddIdx: Math.floor(Math.random() * size) };
}

export function useContrastTest(onComplete: (score: number) => void, config?: ContrastTestConfig) {
  const sfx = useSound();
  const cfg = config ?? DEFAULT_CONFIG;
  const totalRounds = cfg.rounds;

  const initGrid = gridForRound(0, totalRounds, cfg.startGrid);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);
  const [positions, setPositions] = useState(() => generatePositions(initGrid.grid));
  const unmounted = useRef(false);
  const processing = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    return () => { unmounted.current = true; };
  }, []);

  const nextRound = useCallback(
    (correct: boolean) => {
      setFeedback(correct ? "correct" : "wrong");
      const pts = correct ? Math.round(10 + round * 3) : 0;
      const newScore = score + pts;
      setScore(newScore);

      setTimeout(() => {
        if (unmounted.current) return;
        processing.current = false;
        setFeedback(null);
        if (round + 1 >= totalRounds) {
          setDone(true);
          onComplete(newScore);
        } else {
          const nextR = round + 1;
          setRound(nextR);
          const g = gridForRound(nextR, totalRounds, cfg.startGrid);
          setPositions(generatePositions(g.grid));
        }
      }, 500);
    },
    [round, score, onComplete, totalRounds, cfg.startGrid],
  );

  function handleTap(idx: number) {
    if (processing.current || feedback || done) return;
    processing.current = true;
    sfx("tap");
    const correct = idx === positions.oddIdx;
    if (correct) sfx("success");
    else sfx("error");
    nextRound(correct);
  }

  function reset() {
    setRound(0);
    setScore(0);
    setFeedback(null);
    setDone(false);
    const g = gridForRound(0, totalRounds, cfg.startGrid);
    setPositions(generatePositions(g.grid));
    processing.current = false;
  }

  const { grid: currentGrid, cols: currentCols } = gridForRound(round, totalRounds, cfg.startGrid);
  // Diff shrinks from startDiff toward minimum across rounds
  const t = totalRounds > 1 ? round / (totalRounds - 1) : 0;
  const currentDiff = Math.max(2, cfg.startDiff - t * (cfg.startDiff - 2));
  const currentBase = 45 + ((round * 3) % 30);

  return { round, score, feedback, done, positions, handleTap, reset, currentGrid, currentCols, currentDiff, currentBase, totalRounds };
}
