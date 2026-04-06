import { useState, useEffect, useRef, useCallback } from "react";
import { useSound } from "./use-sound";

const ALL_EMOJIS = [
  "🧠", "👁️", "❤️", "⚡", "🎯", "🌟", "🔬", "💊",
  "🎮", "🔥", "💎", "🌈", "🍀", "🎵", "🐱", "🐶",
  "🦊", "🐸", "🌺", "🍎", "🚀", "⭐", "🌙", "🎲",
];

export interface MemoryMatchConfig {
  pairCount: number;
  cols: number;
  timeLimitSec: number | null;
  maxScore: number;
}

const DEFAULT_CONFIG: MemoryMatchConfig = {
  pairCount: 8,
  cols: 4,
  timeLimitSec: null,
  maxScore: 100,
};

export interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function buildCards(pairCount: number): Card[] {
  const emojis = ALL_EMOJIS.slice(0, pairCount);
  const cards = [...emojis, ...emojis].map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export function useMemoryMatch(onComplete: (score: number) => void, config?: MemoryMatchConfig) {
  const sfx = useSound();
  const cfg = config ?? DEFAULT_CONFIG;

  const [cards, setCards] = useState<Card[]>(() => buildCards(cfg.pairCount));
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timer, setTimer] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<"match" | "miss" | "timeUp" | null>(null);
  const interval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const locked = useRef(false);
  const unmounted = useRef(false);

  const selectedRef = useRef<number[]>([]);
  const cardsRef = useRef<Card[]>(cards);
  const movesRef = useRef(0);
  const matchesRef = useRef(0);
  const timerRef = useRef(0);
  const startedRef = useRef(false);

  const totalPairs = cfg.pairCount;

  function calcScore(moveCount: number, elapsed: number) {
    // Only penalize moves beyond the minimum (pairCount = perfect memory)
    const minMoves = totalPairs;
    const excessMoves = Math.max(0, moveCount - minMoves);
    const moveScore = Math.max(0, 1 - excessMoves / (minMoves * 2));
    // Time component: spread over available time (or 120s for untimed)
    const totalTime = cfg.timeLimitSec ?? 120;
    const timeScore = Math.max(0, 1 - elapsed / totalTime);
    // 70% moves, 30% time
    return Math.round(cfg.maxScore * (moveScore * 0.7 + timeScore * 0.3));
  }

  useEffect(() => {
    unmounted.current = false;
    return () => { unmounted.current = true; };
  }, []);

  useEffect(() => {
    return () => clearInterval(interval.current);
  }, []);

  // Timer
  useEffect(() => {
    if (started && !done) {
      interval.current = setInterval(() => {
        if (!document.hidden) {
          timerRef.current += 1;
          if (!unmounted.current) setTimer(timerRef.current);

          // Time limit: auto-end when expired
          if (cfg.timeLimitSec !== null && timerRef.current >= cfg.timeLimitSec) {
            clearInterval(interval.current);
            if (!unmounted.current) {
              setLastResult("timeUp");
              setDone(true);
              const computed = calcScore(movesRef.current, timerRef.current);
              setFinalScore(computed);
              setTimeout(() => {
                if (!unmounted.current) onComplete(computed);
              }, 800);
            }
          }
        }
      }, 1000);
      return () => clearInterval(interval.current);
    }
  }, [started, done]); // eslint-disable-line react-hooks/exhaustive-deps

  const flip = useCallback(
    (id: number) => {
      if (locked.current) return;
      if (selectedRef.current.length >= 2) return;

      const card = cardsRef.current.find((c) => c.id === id);
      if (!card || card.flipped || card.matched) return;
      if (selectedRef.current.includes(id)) return;

      sfx("tap");
      if (!startedRef.current) {
        startedRef.current = true;
        setStarted(true);
      }

      const next = cardsRef.current.map((c) =>
        c.id === id ? { ...c, flipped: true } : c,
      );
      cardsRef.current = next;
      setCards(next);

      const sel = [...selectedRef.current, id];
      selectedRef.current = sel;

      if (sel.length === 2) {
        locked.current = true;
        movesRef.current += 1;
        setMoves(movesRef.current);
        const [a, b] = sel;
        const cardA = next.find((c) => c.id === a)!;
        const cardB = next.find((c) => c.id === b)!;

        if (cardA.emoji === cardB.emoji) {
          const newMatches = matchesRef.current + 1;
          matchesRef.current = newMatches;
          setLastResult("match");
          setTimeout(() => {
            if (unmounted.current) return;
            sfx("success");
            const matched = cardsRef.current.map((c) =>
              c.id === a || c.id === b ? { ...c, matched: true } : c,
            );
            cardsRef.current = matched;
            setCards(matched);
            setMatches(newMatches);
            selectedRef.current = [];
            locked.current = false;

            if (newMatches === totalPairs) {
              setDone(true);
              clearInterval(interval.current);
              const computed = calcScore(movesRef.current, timerRef.current);
              setFinalScore(computed);
              setTimeout(() => {
                if (!unmounted.current) onComplete(computed);
              }, 600);
            } else {
              setTimeout(() => {
                if (!unmounted.current) setLastResult(null);
              }, 800);
            }
          }, 400);
        } else {
          setLastResult("miss");
          setTimeout(() => {
            if (unmounted.current) return;
            sfx("error");
            const unflipped = cardsRef.current.map((c) =>
              c.id === a || c.id === b ? { ...c, flipped: false } : c,
            );
            cardsRef.current = unflipped;
            setCards(unflipped);
            selectedRef.current = [];
            setLastResult(null);
            locked.current = false;
          }, 700);
        }
      }
    },
    [sfx, onComplete, totalPairs], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const score = finalScore ?? calcScore(moves, timer);
  const stars = score >= cfg.maxScore * 0.8 ? 3 : score >= cfg.maxScore * 0.5 ? 2 : 1;
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const timeLeft = cfg.timeLimitSec !== null ? Math.max(0, cfg.timeLimitSec - timer) : null;

  return {
    cards, moves, matches, timer, done, started, flip, score, stars, fmt,
    TOTAL_PAIRS: totalPairs, lastResult, cols: cfg.cols, timeLeft,
    hasTimeLimit: cfg.timeLimitSec !== null,
  };
}
