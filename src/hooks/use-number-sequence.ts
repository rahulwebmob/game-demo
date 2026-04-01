import { useState, useCallback, useEffect, useRef } from "react";
import { useSound } from "./use-sound";

export const TOTAL = 8;

// Cap to avoid huge numbers that overflow the UI
const MAX_SEQ_VALUE = 9999;

function genSequence(level: number): {
  seq: number[];
  answer: number;
  missingIdx: number;
} {
  const type = Math.floor(Math.random() * 3);
  const start = Math.floor(Math.random() * 10) + 1;
  const step = Math.floor(Math.random() * (3 + level)) + 1;
  const len = 5 + Math.min(level, 3);

  let seq: number[];
  if (type === 0) {
    // arithmetic
    seq = Array.from({ length: len }, (_, i) => start + step * i);
  } else if (type === 1) {
    // multiply — use smaller multiplier and cap values
    const mul = 2 + Math.floor(Math.random() * 2);
    seq = [];
    for (let i = 0; i < len; i++) {
      const val = start * Math.pow(mul, i);
      if (val > MAX_SEQ_VALUE) {
        // Truncate sequence at cap, ensure at least 4 items
        break;
      }
      seq.push(val);
    }
    // Fall back to arithmetic if too short
    if (seq.length < 4) {
      seq = Array.from({ length: len }, (_, i) => start + step * i);
    }
  } else {
    // add increasing
    seq = [start];
    for (let i = 1; i < len; i++) {
      const val = seq[i - 1] + step * i;
      if (val > MAX_SEQ_VALUE) break;
      seq.push(val);
    }
    if (seq.length < 4) {
      seq = Array.from({ length: len }, (_, i) => start + step * i);
    }
  }

  // Missing index: never first or last
  const missingIdx = 1 + Math.floor(Math.random() * (seq.length - 2));
  const answer = seq[missingIdx];

  return { seq, answer, missingIdx };
}

// Fisher-Yates shuffle for unbiased randomization
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
  // Generate distractors that are proportional to the answer size
  const range = Math.max(10, Math.floor(answer * 0.3));
  let attempts = 0;
  while (set.size < 4 && attempts < 100) {
    attempts++;
    const offset =
      (Math.floor(Math.random() * range) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const v = answer + offset;
    if (v > 0) set.add(v);
  }
  // Fallback: if we couldn't get 4 unique, pad with nearby values
  let pad = 1;
  while (set.size < 4) {
    if (!set.has(answer + pad)) set.add(answer + pad);
    else if (!set.has(answer - pad) && answer - pad > 0) set.add(answer - pad);
    pad++;
  }
  return shuffleArray(Array.from(set));
}

export function useNumberSequence(onComplete: (score: number) => void) {
  const sfx = useSound();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState(() => genSequence(0));
  const [choices, setChoices] = useState(() => genChoices(problem.answer));
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const unmounted = useRef(false);
  const processing = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    return () => { unmounted.current = true; };
  }, []);

  const nextRound = useCallback(
    (correct: boolean) => {
      const pts = correct ? (round + 1) * 12 : 0;
      const newScore = score + pts;
      setScore(newScore);

      setTimeout(() => {
        if (unmounted.current) return;
        processing.current = false;
        if (round + 1 >= TOTAL) {
          setDone(true);
          onComplete(newScore);
        } else {
          const next = genSequence(round + 1);
          setProblem(next);
          setChoices(genChoices(next.answer));
          setSelected(null);
          setRound((r) => r + 1);
        }
      }, 800);
    },
    [round, score, onComplete],
  );

  function handleChoice(val: number) {
    if (processing.current || selected !== null || done) return;
    processing.current = true;
    sfx("tap");
    const correct = val === problem.answer;
    if (correct) sfx("success");
    else sfx("error");
    setSelected(val);
    nextRound(correct);
  }

  function reset() {
    const p = genSequence(0);
    setRound(0);
    setScore(0);
    setProblem(p);
    setChoices(genChoices(p.answer));
    setSelected(null);
    setDone(false);
    processing.current = false;
  }

  return { round, score, problem, choices, selected, done, handleChoice, reset, TOTAL };
}
