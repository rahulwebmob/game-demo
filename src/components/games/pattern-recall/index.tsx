import { useMemo } from "react";
import { motion } from "framer-motion";
import { Brain } from "@/components/animate-ui/icons/index.ts";
import GameResult from "../game-result";
import { usePatternRecall } from "../../../hooks/use-pattern-recall";
import type { PatternRecallConfig } from "../../../hooks/use-pattern-recall";
import type { PatternRecallLevel, GameLevelConfig } from "../../../data/level-configs";

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

export default function PatternRecall({ onComplete, onPlayAgain, onNextLevel, onBack, levelNumber, newBest, starScores, levelConfig }: Props) {
  const config: PatternRecallConfig | undefined = useMemo(() => {
    if (!levelConfig) return undefined;
    const lc = levelConfig as PatternRecallLevel;
    return {
      gridCols: lc.gridCols,
      gridSize: lc.gridSize,
      startLength: lc.startLength,
      maxRounds: lc.maxRounds,
      lives: lc.lives,
      showMs: lc.showMs,
      gapMs: lc.gapMs,
      maxScore: lc.maxScore,
    };
  }, [levelConfig]);

  const {
    level, pattern, userPattern, phase, highlighted, score, lives, handleTap,
    gridSize, gridCols, maxRounds, pointsPerRound, maxScore,
  } = usePatternRecall(onComplete, config);

  if (phase === "done") {
    const stars = starScores
      ? (score >= starScores[0] ? 3 : score >= starScores[1] ? 2 : 1)
      : (score >= Math.round(maxScore * 0.7) ? 3 : score >= Math.round(maxScore * 0.4) ? 2 : 1);
    const title = stars === 3 ? "Pattern Master!" : stars === 2 ? "Good Memory!" : "Keep Practicing";
    return (
      <GameResult
        icon={<Brain size={36} className="text-teal" />}
        iconBg="bg-teal-light"
        title={title}
        stars={stars}
        score={score}
        subtitle={`Reached round ${level} of ${maxRounds}`}
        accentColor="bg-teal"
        onReset={onPlayAgain}
        onNextLevel={onNextLevel}
        onBack={onBack}
        levelNumber={levelNumber}
        newBest={newBest}
      />
    );
  }

  const maxWidth = gridCols <= 3 ? 280 : gridCols <= 4 ? 340 : 400;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-ink-secondary">
          Round {level}/{maxRounds}
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

      <div className="flex items-center gap-3">
        <div className="flex-1 h-[6px] bg-muted rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${((level - 1) / maxRounds) * 100}%` }}
            className="h-full bg-teal rounded-full"
            transition={{ duration: 0.3 }}
          />
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
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.15, 1], opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center text-[14px] font-bold text-green"
        >
          Correct! +{level * pointsPerRound} pts
        </motion.p>
      )}
      {phase === "wrong" && (
        <motion.p
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: [0, -8, 8, -6, 6, 0], opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center text-[14px] font-bold text-rose"
        >
          Wrong! Try again...
        </motion.p>
      )}

      <div
        className="grid gap-3 md:gap-4 mx-auto w-full"
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(44px, 1fr))`, maxWidth }}
      >
        {Array.from({ length: gridSize }).map((_, i) => (
          <motion.button
            key={i}
            aria-label={`Cell ${i + 1}${highlighted === i ? " (highlighted)" : ""}`}
            whileTap={phase === "input" ? { scale: 0.88 } : undefined}
            onClick={() => handleTap(i)}
            animate={{
              scale: highlighted === i ? 1.08 : 1,
              backgroundColor:
                highlighted === i ? "var(--color-teal)" : "var(--color-muted)",
              boxShadow:
                highlighted === i
                  ? "0 0 20px color-mix(in srgb, var(--color-teal) 40%, transparent)"
                  : "var(--shadow-soft)",
            }}
            transition={{ duration: 0.15 }}
            className={`aspect-square rounded-2xl border-none ${phase === "input" ? "cursor-pointer" : "cursor-default"}`}
          />
        ))}
      </div>
    </div>
  );
}
