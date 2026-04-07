import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock } from "lucide-react";
import GameResult from "../game-result";
import { useMemoryMatch } from "../../../hooks/use-memory-match";
import type { MemoryMatchConfig } from "../../../hooks/use-memory-match";
import type { MemoryMatchLevel, GameLevelConfig } from "../../../data/level-configs";

interface Props {
  onComplete: (score: number) => void;
  onPlayAgain: () => void;
  onNextLevel?: () => void;
  onBack?: () => void;
  levelNumber?: number;
  newBest?: boolean;
  starScores?: [number, number];
  levelConfig?: GameLevelConfig;
}

export default function MemoryMatch({ onComplete, onPlayAgain, onNextLevel, onBack, levelNumber, newBest, starScores, levelConfig }: Props) {
  const config: MemoryMatchConfig | undefined = useMemo(() => {
    if (!levelConfig) return undefined;
    const lc = levelConfig as MemoryMatchLevel;
    return {
      pairCount: lc.pairCount,
      cols: lc.cols,
      timeLimitSec: lc.timeLimitSec,
      maxScore: lc.maxScore,
    };
  }, [levelConfig]);

  const {
    cards, moves, matches, timer, done, flip, score, stars: hookStars, fmt,
    TOTAL_PAIRS, lastResult, cols, timeLeft, hasTimeLimit,
  } = useMemoryMatch(onComplete, config);

  if (done) {
    const stars = starScores
      ? (score >= starScores[0] ? 3 : score >= starScores[1] ? 2 : 1)
      : hookStars;
    return (
      <GameResult
        icon={<Trophy size={36} className="text-gold" />}
        iconBg="bg-gold-light"
        title={stars === 3 ? "Perfect Memory!" : stars === 2 ? "Well Done!" : "Keep Practicing"}
        stars={stars}
        score={score}
        onReset={onPlayAgain}
        onNextLevel={onNextLevel}
        onBack={onBack}
        levelNumber={levelNumber}
        newBest={newBest}
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
          <Clock size={14} className="text-coral" />
          {hasTimeLimit ? fmt(timeLeft ?? 0) : fmt(timer)}
        </span>
        <span className="text-[13px] font-bold text-ink tabular-nums">
          Score: {score}
        </span>
        <span className="text-[13px] font-semibold text-ink-secondary">
          {matches}/{TOTAL_PAIRS} pairs · {moves} moves
        </span>
      </div>

      {/* Time limit bar */}
      {hasTimeLimit && timeLeft !== null && (
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              timeLeft > 30 ? "bg-green" : timeLeft > 10 ? "bg-gold" : "bg-rose"
            }`}
            initial={false}
            animate={{ width: `${(timeLeft / ((levelConfig as MemoryMatchLevel)?.timeLimitSec ?? 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: "linear" }}
          />
        </div>
      )}

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
          {lastResult === "timeUp" && (
            <motion.p
              key="timeup"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: [0.8, 1.1, 1] }}
              exit={{ opacity: 0 }}
              className="text-[14px] font-bold text-coral text-center"
            >
              Time's up!
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div
        className="grid gap-2.5 md:gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(44px, 1fr))`, maxWidth: cols > 6 ? cols * 56 : undefined }}
      >
        {cards.map((card) => (
          <motion.button
            key={card.id}
            aria-label={
              card.flipped || card.matched ? card.emoji : `Card ${card.id + 1}`
            }
            whileTap={
              !card.flipped && !card.matched ? { scale: 0.9 } : undefined
            }
            animate={
              card.matched
                ? { scale: [1, 1.1, 0.95, 1], transition: { duration: 0.4 } }
                : {}
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
                className={`absolute inset-0 rounded-2xl flex items-center justify-center card-face transition-shadow duration-300 ${card.matched ? "bg-green-light shadow-[0_0_16px_color-mix(in_srgb,var(--color-green)_30%,transparent)]" : "bg-card shadow-[var(--shadow-soft)]"}`}
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
