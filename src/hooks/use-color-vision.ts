import { useState, useCallback, useEffect, useRef } from "react";
import { useSound } from "./use-sound";

export interface ColorVisionConfig {
  rounds: number;
  startGrid: number;
  startDiff: number;
  maxScore: number;
}

const DEFAULT_CONFIG: ColorVisionConfig = {
  rounds: 10,
  startGrid: 3,
  startDiff: 25,
  maxScore: 550,
};

function generateRound(round: number, totalRounds: number, startGrid: number, startDiff: number) {
  const hue = Math.floor(Math.random() * 360);
  const sat = 60 + Math.random() * 30;
  const light = 45 + Math.random() * 20;
  // Difficulty scales across rounds: diff shrinks from startDiff toward minimum
  const t = totalRounds > 1 ? round / (totalRounds - 1) : 0;
  const diff = Math.max(3, startDiff - t * (startDiff - 3));
  const oddLight = Math.min(light + diff, 95);
  const base = `hsl(${hue}, ${sat}%, ${light}%)`;
  const odd = `hsl(${hue}, ${sat}%, ${oddLight}%)`;

  // Grid size scales across rounds from startGrid² toward larger grids
  const gridStep = round / Math.max(1, totalRounds - 1);
  const cols = Math.min(Math.round(startGrid + gridStep * 2), 6);
  const gridSize = cols * cols;
  const oddIndex = Math.floor(Math.random() * gridSize);

  return { base, odd, gridSize, cols, oddIndex };
}

export function useColorVision(onComplete: (score: number) => void, config?: ColorVisionConfig) {
  const sfx = useSound();
  const cfg = config ?? DEFAULT_CONFIG;
  const totalRounds = cfg.rounds;

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [roundData, setRoundData] = useState(() =>
    generateRound(0, totalRounds, cfg.startGrid, cfg.startDiff),
  );
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
        if (round + 1 >= totalRounds) {
          setDone(true);
          onComplete(newScore);
        } else {
          setRound((r) => r + 1);
          setRoundData(generateRound(round + 1, totalRounds, cfg.startGrid, cfg.startDiff));
        }
      }, 500);
    },
    [round, score, onComplete, totalRounds, cfg.startGrid, cfg.startDiff],
  );

  function handleTap(idx: number) {
    if (processing.current || feedback || done) return;
    processing.current = true;
    sfx("tap");
    const correct = idx === roundData.oddIndex;
    if (correct) sfx("success");
    else sfx("error");
    next(correct);
  }

  function reset() {
    setRound(0);
    setScore(0);
    setRoundData(generateRound(0, totalRounds, cfg.startGrid, cfg.startDiff));
    setFeedback(null);
    setDone(false);
    processing.current = false;
  }

  return { round, score, level: roundData, feedback, done, handleTap, reset, totalRounds };
}
