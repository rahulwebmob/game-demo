import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Trophy, Clock } from "lucide-react";
import GameResult from "../game-result";
import { useSound } from "../../../hooks/use-sound";

const EMOJIS = ["🧠", "👁️", "❤️", "⚡", "🎯", "🌟", "🔬", "💊"];

interface Props {
  onComplete: (score: number) => void;
}

interface Card {
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
  // Fisher-Yates shuffle (unbiased)
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function MemoryMatch({ onComplete }: Props) {
  const sfx = useSound();
  const [cards, setCards] = useState<Card[]>(shuffle);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timer, setTimer] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const interval = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  useEffect(() => {
    return () => clearInterval(interval.current);
  }, []);

  useEffect(() => {
    if (started && !done) {
      interval.current = setInterval(() => setTimer((t) => t + 1), 1000);
      return () => clearInterval(interval.current);
    }
  }, [started, done]);

  function reset() {
    setCards(shuffle());
    setSelected([]);
    setMoves(0);
    setMatches(0);
    setTimer(0);
    setDone(false);
    setStarted(false);
  }

  function flip(id: number) {
    if (selected.length >= 2) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;

    sfx("tap");
    if (!started) setStarted(true);

    const next = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    setCards(next);
    const sel = [...selected, id];
    setSelected(sel);

    if (sel.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = sel;
      const cardA = next.find((c) => c.id === a)!;
      const cardB = next.find((c) => c.id === b)!;
      if (cardA.emoji === cardB.emoji) {
        const newMatches = matches + 1;
        setTimeout(() => {
          sfx("success");
          setCards((prev) =>
            prev.map((c) =>
              c.id === a || c.id === b ? { ...c, matched: true } : c,
            ),
          );
          setMatches(newMatches);
          setSelected([]);
          if (newMatches === 8) {
            setDone(true);
            clearInterval(interval.current);
            const score = Math.max(100 - (moves + 1) * 2 - timer, 10);
            setTimeout(() => onComplete(score), 600);
          }
        }, 400);
      } else {
        setTimeout(() => {
          sfx("error");
          setCards((prev) =>
            prev.map((c) =>
              c.id === a || c.id === b ? { ...c, flipped: false } : c,
            ),
          );
          setSelected([]);
        }, 700);
      }
    }
  }

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (done) {
    const score = Math.max(100 - moves * 2 - timer, 10);
    const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;
    return (
      <GameResult
        icon={<Trophy size={36} className="text-gold" />}
        iconBg="bg-gold-light"
        title="Complete!"
        stars={stars}
        score={score}
        onReset={reset}
      >
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-[20px] font-bold text-ink">{moves}</p>
            <p className="text-[11px] text-ink-muted font-medium">Moves</p>
          </div>
          <div>
            <p className="text-[20px] font-bold text-ink">{fmt(timer)}</p>
            <p className="text-[11px] text-ink-muted font-medium">Time</p>
          </div>
        </div>
      </GameResult>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-ink-secondary flex items-center gap-1.5">
          <Clock size={14} className="text-coral" /> {fmt(timer)}
        </span>
        <span className="text-[13px] font-semibold text-ink-secondary">
          {matches}/8 pairs · {moves} moves
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2.5 md:gap-3">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            aria-label={
              card.flipped || card.matched ? card.emoji : `Card ${card.id + 1}`
            }
            whileTap={
              !card.flipped && !card.matched ? { scale: 0.9 } : undefined
            }
            onClick={() => flip(card.id)}
            className="aspect-square rounded-2xl border-none cursor-pointer relative"
            style={{ perspective: 600 }}
          >
            <motion.div
              animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full h-full relative card-3d"
            >
              {/* Back of card */}
              <div className="absolute inset-0 rounded-2xl bg-coral flex items-center justify-center shadow-[var(--shadow-soft)] card-face">
                <span className="text-white text-[18px] font-bold">?</span>
              </div>
              {/* Front of card */}
              <div
                className={`absolute inset-0 rounded-2xl flex items-center justify-center shadow-[var(--shadow-soft)] card-face ${card.matched ? "bg-green-light" : "bg-card"}`}
                style={{ transform: "rotateY(180deg)" }}
              >
                <span className="text-[28px] md:text-[32px]">{card.emoji}</span>
              </div>
            </motion.div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
