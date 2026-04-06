import { useState, useCallback, useEffect, useRef } from "react";
import { useSound } from "./use-sound";

// Cap to avoid huge numbers that overflow the UI
const MAX_SEQ_VALUE = 9999;

export type SeqType = "arithmetic" | "multiply" | "addIncreasing" | "quadratic" | "fibonacci";

export interface NumberSequenceConfig {
  rounds: number;
  seqLength: number;
  allowedTypes: SeqType[];
  timeLimitSec: number | null;
  maxScore: number;
}

const DEFAULT_CONFIG: NumberSequenceConfig = {
  rounds: 8,
  seqLength: 5,
  allowedTypes: ["arithmetic", "multiply", "addIncreasing"],
  timeLimitSec: null,
  maxScore: 432,
};

function genSequence(seqLength: number, allowedTypes: SeqType[]): {
  seq: number[];
  answer: number;
  missingIdx: number;
} {
  const type = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
  const start = Math.floor(Math.random() * 10) + 1;
  const step = Math.floor(Math.random() * 5) + 1;

  let seq: number[];
  switch (type) {
    case "multiply": {
      const mul = 2 + Math.floor(Math.random() * 2);
      seq = [];
      for (let i = 0; i < seqLength; i++) {
        const val = start * Math.pow(mul, i);
        if (val > MAX_SEQ_VALUE) break;
        seq.push(val);
      }
      if (seq.length < 4) {
        seq = Array.from({ length: seqLength }, (_, i) => start + step * i);
      }
      break;
    }
    case "addIncreasing": {
      seq = [start];
      for (let i = 1; i < seqLength; i++) {
        const val = seq[i - 1] + step * i;
        if (val > MAX_SEQ_VALUE) break;
        seq.push(val);
      }
      if (seq.length < 4) {
        seq = Array.from({ length: seqLength }, (_, i) => start + step * i);
      }
      break;
    }
    case "quadratic": {
      seq = Array.from({ length: seqLength }, (_, i) => start + step * i * i);
      break;
    }
    case "fibonacci": {
      seq = [start, start + step];
      for (let i = 2; i < seqLength; i++) {
        const val = seq[i - 1] + seq[i - 2];
        if (val > MAX_SEQ_VALUE) break;
        seq.push(val);
      }
      if (seq.length < 4) {
        seq = Array.from({ length: seqLength }, (_, i) => start + step * i);
      }
      break;
    }
    default: // arithmetic
      seq = Array.from({ length: seqLength }, (_, i) => start + step * i);
  }

  const missingIdx = 1 + Math.floor(Math.random() * (seq.length - 2));
  const answer = seq[missingIdx];

  return { seq, answer, missingIdx };
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function genChoices(answer: number): number[] {
  const set = new Set([answer]);
  const range = Math.max(10, Math.floor(answer * 0.3));
  let attempts = 0;
  while (set.size < 4 && attempts < 100) {
    attempts++;
    const offset =
      (Math.floor(Math.random() * range) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const v = answer + offset;
    if (v > 0) set.add(v);
  }
  let pad = 1;
  while (set.size < 4) {
    if (!set.has(answer + pad)) set.add(answer + pad);
    else if (!set.has(answer - pad) && answer - pad > 0) set.add(answer - pad);
    pad++;
  }
  return shuffleArray(Array.from(set));
}

export function useNumberSequence(onComplete: (score: number) => void, config?: NumberSequenceConfig) {
  const sfx = useSound();
  const cfg = config ?? DEFAULT_CONFIG;

  // Points per round: round * pointsPerRound calibrated so all correct = maxScore
  const sumRounds = cfg.rounds * (cfg.rounds + 1) / 2;
  const pointsPerRound = Math.round(cfg.maxScore / sumRounds);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState(() => genSequence(cfg.seqLength, cfg.allowedTypes));
  const [choices, setChoices] = useState(() => genChoices(problem.answer));
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [timer, setTimer] = useState(0);
  const [started, setStarted] = useState(false);
  const unmounted = useRef(false);
  const processing = useRef(false);
  const scoreRef = useRef(0);
  const timerRef = useRef(0);
  const startedRef = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    return () => { unmounted.current = true; };
  }, []);

  // Timer (for time-limited levels)
  useEffect(() => {
    if (cfg.timeLimitSec === null || done || !started) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      timerRef.current += 1;
      if (!unmounted.current) setTimer(timerRef.current);
      if (timerRef.current >= cfg.timeLimitSec!) {
        clearInterval(id);
        if (!unmounted.current) {
          setDone(true);
          onComplete(scoreRef.current);
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [done, started, cfg.timeLimitSec, onComplete]);

  const nextRound = useCallback(
    (correct: boolean) => {
      const pts = correct ? (round + 1) * pointsPerRound : 0;
      scoreRef.current += pts;
      const newScore = scoreRef.current;
      setScore(newScore);

      setTimeout(() => {
        if (unmounted.current) return;
        processing.current = false;
        if (round + 1 >= cfg.rounds) {
          setDone(true);
          onComplete(newScore);
        } else {
          const next = genSequence(cfg.seqLength, cfg.allowedTypes);
          setProblem(next);
          setChoices(genChoices(next.answer));
          setSelected(null);
          setRound((r) => r + 1);
        }
      }, 800);
    },
    [round, onComplete, pointsPerRound, cfg.rounds, cfg.seqLength, cfg.allowedTypes],
  );

  function handleChoice(val: number) {
    if (processing.current || selected !== null || done) return;
    processing.current = true;
    if (!startedRef.current) { startedRef.current = true; setStarted(true); }
    sfx("tap");
    const correct = val === problem.answer;
    if (correct) sfx("success");
    else sfx("error");
    setSelected(val);
    nextRound(correct);
  }

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const timeLeft = cfg.timeLimitSec !== null ? Math.max(0, cfg.timeLimitSec - timer) : null;

  return {
    round, score, problem, choices, selected, done, handleChoice,
    totalRounds: cfg.rounds, pointsPerRound, timeLeft, hasTimeLimit: cfg.timeLimitSec !== null, fmt,
    maxScore: cfg.maxScore, totalTime: cfg.timeLimitSec ?? 0,
  };
}
