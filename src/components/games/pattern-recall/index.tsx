import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import GameResult from "../game-result";
import { usePatternRecall, GRID, COLS } from "../../../hooks/use-pattern-recall";

interface Props {
  onComplete: (score: number) => void;
}

export default function PatternRecall({ onComplete }: Props) {
  const { level, pattern, userPattern, phase, highlighted, score, lives, handleTap, reset } =
    usePatternRecall(onComplete);

  if (phase === "done") {
    const stars = score >= 100 ? 3 : score >= 50 ? 2 : 1;
    return (
      <GameResult
        icon={<Brain size={36} className="text-teal" />}
        iconBg="bg-teal-light"
        title="Pattern Master"
        stars={stars}
        score={score}
        subtitle={`Reached level ${level}`}
        accentColor="bg-teal"
        onReset={reset}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-ink-secondary">
          Level {level}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold text-ink tabular-nums">
            Score: {score}
          </span>
          <span className="text-[13px] font-semibold text-coral">
            {"❤️".repeat(lives)}
          </span>
        </div>
      </div>

      {phase === "showing" && (
        <p className="text-center text-[14px] font-medium text-ink-secondary">
          Watch the pattern...
        </p>
      )}
      {phase === "input" && (
        <p className="text-center text-[14px] font-medium text-ink-secondary">
          Repeat it! ({userPattern.length}/{pattern.length})
        </p>
      )}
      {phase === "correct" && (
        <motion.p
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-center text-[14px] font-bold text-green"
        >
          Correct! +{level * 15} pts
        </motion.p>
      )}
      {phase === "wrong" && (
        <motion.p
          initial={{ x: -8 }}
          animate={{ x: [8, -8, 0] }}
          className="text-center text-[14px] font-bold text-rose"
        >
          Wrong! Try again...
        </motion.p>
      )}

      <div
        className="grid gap-3 md:gap-4 mx-auto w-full"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, maxWidth: 280 }}
      >
        {Array.from({ length: GRID }).map((_, i) => (
          <motion.button
            key={i}
            aria-label={`Cell ${i + 1}${highlighted === i ? " (highlighted)" : ""}`}
            whileTap={phase === "input" ? { scale: 0.88 } : undefined}
            onClick={() => handleTap(i)}
            animate={{
              scale: highlighted === i ? 1.08 : 1,
              backgroundColor:
                highlighted === i ? "var(--color-teal)" : "var(--color-muted)",
            }}
            transition={{ duration: 0.15 }}
            className="aspect-square rounded-2xl border-none cursor-pointer shadow-[var(--shadow-soft)]"
          />
        ))}
      </div>
    </div>
  );
}
