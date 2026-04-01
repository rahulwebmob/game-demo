import { useState, useEffect, useRef, useCallback } from "react";
import { useSound } from "./use-sound";

const EMOJIS = ["🧠", "👁️", "❤️", "⚡", "🎯", "🌟", "🔬", "💊"];
const TOTAL_PAIRS = EMOJIS.length;

export interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function shuffle(): Card[] {
  const cards = [...EMOJIS, ...EMOJIS].map((emoji, i) => ({
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

function calcScore(moves: number, timer: number) {
  return Math.max(100 - moves * 2 - timer, 10);
}

export function useMemoryMatch(onComplete: (score: number) => void) {
  const sfx = useSound();
  const [cards, setCards] = useState<Card[]>(shuffle);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timer, setTimer] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<"match" | "miss" | null>(null);
  const interval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const locked = useRef(false);
  const unmounted = useRef(false);

  // Refs to avoid stale closures in flip callback —
  // these are updated synchronously so rapid clicks always
  // see the latest values even before React re-renders.
  const selectedRef = useRef<number[]>([]);
  const cardsRef = useRef<Card[]>(cards);
  const movesRef = useRef(0);
  const matchesRef = useRef(0);
  const timerRef = useRef(0);
  const startedRef = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    return () => { unmounted.current = true; };
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => clearInterval(interval.current);
  }, []);

  // Timer: pause when tab is hidden
  useEffect(() => {
    if (started && !done) {
      interval.current = setInterval(() => {
        if (!document.hidden) {
          setTimer((t) => {
            timerRef.current = t + 1;
            return t + 1;
          });
        }
      }, 1000);
      return () => clearInterval(interval.current);
    }
  }, [started, done]);

  const reset = useCallback(() => {
    const newCards = shuffle();
    cardsRef.current = newCards;
    setCards(newCards);
    selectedRef.current = [];
    movesRef.current = 0;
    setMoves(0);
    matchesRef.current = 0;
    setMatches(0);
    timerRef.current = 0;
    setTimer(0);
    setDone(false);
    startedRef.current = false;
    setStarted(false);
    setFinalScore(null);
    setLastResult(null);
    locked.current = false;
  }, []);

  const flip = useCallback(
    (id: number) => {
      // Block taps while a pair is being evaluated
      if (locked.current) return;
      if (selectedRef.current.length >= 2) return;

      const card = cardsRef.current.find((c) => c.id === id);
      if (!card || card.flipped || card.matched) return;

      // Prevent double-click on same card
      if (selectedRef.current.includes(id)) return;

      sfx("tap");
      if (!startedRef.current) {
        startedRef.current = true;
        setStarted(true);
      }

      // Flip card — update ref synchronously so next click sees it
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

            if (newMatches === TOTAL_PAIRS) {
              setDone(true);
              clearInterval(interval.current);
              const computed = calcScore(movesRef.current, timerRef.current);
              setFinalScore(computed);
              setTimeout(() => {
                if (!unmounted.current) onComplete(computed);
              }, 600);
            } else {
              // Auto-clear "Match!" feedback after a short delay
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
    [sfx, onComplete],
  );

  // Use frozen final score when done to avoid timer drift
  const score = finalScore ?? calcScore(moves, timer);
  const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;
  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return { cards, moves, matches, timer, done, started, flip, reset, score, stars, fmt, TOTAL_PAIRS, lastResult };
}
