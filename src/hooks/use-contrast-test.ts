import { useState, useCallback, useEffect, useRef } from "react";
import { useSound } from "./use-sound";

export const TOTAL = 12;

// Single source of truth for grid size at each round
function gridForRound(round: number): number {
  if (round < 4) return 4;
  if (round < 8) return 9;
  return 16;
}

function generatePositions(size: number) {
  return { oddIdx: Math.floor(Math.random() * size) };
}

export function useContrastTest(onComplete: (score: number) => void) {
  const sfx = useSound();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);
  const [positions, setPositions] = useState(() => generatePositions(gridForRound(0)));
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
        if (round + 1 >= TOTAL) {
          setDone(true);
          onComplete(newScore);
        } else {
          const nextR = round + 1;
          setRound(nextR);
          setPositions(generatePositions(gridForRound(nextR)));
        }
      }, 500);
    },
    [round, score, onComplete],
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
    setPositions(generatePositions(gridForRound(0)));
    processing.current = false;
  }

  const currentGrid = gridForRound(round);
  const currentCols = Math.sqrt(currentGrid);
  const currentDiff = Math.max(2, 20 - round * 1.5);
  const currentBase = 45 + ((round * 3) % 30);

  return { round, score, feedback, done, positions, handleTap, reset, currentGrid, currentCols, currentDiff, currentBase, TOTAL };
}
