import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock } from "lucide-react";
import GameResult from "../game-result";
import { useMemoryMatch } from "../../../hooks/use-memory-match";

interface Props {
  onComplete: (score: number) => void;
  onPlayAgain: () => void;
}

export default function MemoryMatch({ onComplete, onPlayAgain }: Props) {
  const { cards, moves, matches, timer, done, flip, score, stars, fmt, TOTAL_PAIRS, lastResult } =
    useMemoryMatch(onComplete);

  if (done) {
    return (
      <GameResult
        icon={<Trophy size={36} className="text-gold" />}
        iconBg="bg-gold-light"
        title={stars === 3 ? "Perfect Memory!" : stars === 2 ? "Well Done!" : "Keep Practicing"}
        stars={stars}
        score={score}
        subtitle="out of 100"
        onReset={onPlayAgain}
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
          {matches}/{TOTAL_PAIRS} pairs · {moves} moves
        </span>
      </div>

      {/* Match/miss feedback */}
      <div className="h-5 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {lastResult === "match" && (
            <motion.p
              key="match"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[13px] font-bold text-green text-center"
            >
              Match!
            </motion.p>
          )}
          {lastResult === "miss" && (
            <motion.p
              key="miss"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[13px] font-bold text-rose text-center"
            >
              Not a match
            </motion.p>
          )}
        </AnimatePresence>
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
