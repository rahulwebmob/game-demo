import { useState, useCallback, useEffect, useRef } from "react";
import { useSound } from "./use-sound";

export const ROUNDS = 10;

function generateRound(level: number) {
  const hue = Math.floor(Math.random() * 360);
  const sat = 60 + Math.random() * 30;
  const light = 45 + Math.random() * 20;
  const diff = Math.max(4, 25 - level * 2.2);
  // Clamp lightness to valid range
  const oddLight = Math.min(light + diff, 95);
  const base = `hsl(${hue}, ${sat}%, ${light}%)`;
  const odd = `hsl(${hue}, ${sat}%, ${oddLight}%)`;

  const gridSize = level < 3 ? 9 : level < 6 ? 16 : 25;
  const cols = Math.sqrt(gridSize);
  const oddIndex = Math.floor(Math.random() * gridSize);

  return { base, odd, gridSize, cols, oddIndex };
}

export function useColorVision(onComplete: (score: number) => void) {
  const sfx = useSound();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(generateRound(0));
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);
  const unmounted = useRef(false);
  const processing = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    return () => { unmounted.current = true; };
  }, []);

  const next = useCallback(
    (correct: boolean) => {
      setFeedback(correct ? "correct" : "wrong");
      const newScore = correct ? score + (round + 1) * 10 : score;
      setScore(newScore);

      setTimeout(() => {
        if (unmounted.current) return;
        processing.current = false;
        setFeedback(null);
        if (round + 1 >= ROUNDS) {
          setDone(true);
          onComplete(newScore);
        } else {
          setRound((r) => r + 1);
          setLevel(generateRound(round + 1));
        }
      }, 500);
    },
    [round, score, onComplete],
  );

  function handleTap(idx: number) {
    if (processing.current || feedback || done) return;
    processing.current = true;
    sfx("tap");
    const correct = idx === level.oddIndex;
    if (correct) sfx("success");
    else sfx("error");
    next(correct);
  }

  function reset() {
    setRound(0);
    setScore(0);
    setLevel(generateRound(0));
    setFeedback(null);
    setDone(false);
    processing.current = false;
  }

  return { round, score, level, feedback, done, handleTap, reset, ROUNDS };
}
