import { useMemo } from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import GameResult from "../game-result";
import { useColorVision } from "../../../hooks/use-color-vision";
import type { ColorVisionConfig } from "../../../hooks/use-color-vision";
import type { ColorVisionLevel, GameLevelConfig } from "../../../data/level-configs";

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

export default function ColorVision({ onComplete, onPlayAgain, onNextLevel, onBack, levelNumber, newBest, starScores, levelConfig }: Props) {
  const config: ColorVisionConfig | undefined = useMemo(() => {
    if (!levelConfig) return undefined;
    const lc = levelConfig as ColorVisionLevel;
    return {
      rounds: lc.rounds,
      startGrid: lc.startGrid,
      startDiff: lc.startDiff,
      maxScore: lc.maxScore,
    };
  }, [levelConfig]);

  const { round, score, level, feedback, done, handleTap, totalRounds } =
    useColorVision(onComplete, config);

  if (done) {
    const stars = starScores
      ? (score >= starScores[0] ? 3 : score >= starScores[1] ? 2 : 1)
      : (score >= 385 ? 3 : score >= 220 ? 2 : 1);
    const title = stars === 3 ? "Sharp Eyes!" : stars === 2 ? "Good Vision" : "Keep Training";
    return (
      <GameResult
        icon={<Eye size={36} className="text-violet" />}
        iconBg="bg-violet-light"
        title={title}
        stars={stars}
        score={score}
        subtitle={`out of ${config?.maxScore ?? totalRounds * (totalRounds + 1) * 5}`}
        accentColor="bg-violet"
        onReset={onPlayAgain}
        onNextLevel={onNextLevel}
        onBack={onBack}
        levelNumber={levelNumber}
        newBest={newBest}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-ink-secondary">
          {round + 1}/{totalRounds}
        </span>
        <span className="text-[13px] font-bold text-ink tabular-nums">
          Score: {score}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-[6px] bg-muted rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${(round / totalRounds) * 100}%` }}
            className="h-full bg-violet rounded-full"
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <p className="text-center text-[14px] font-medium text-ink-secondary">
        Tap the square that's a different shade
      </p>

      {/* Feedback text */}
      <div className="h-5 flex items-center justify-center">
        {feedback === "correct" && (
          <motion.p
            key={`fb-${round}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [0.5, 1.15, 1] }}
            transition={{ duration: 0.35 }}
            className="text-[13px] font-bold text-green text-center"
          >
            Correct!
          </motion.p>
        )}
        {feedback === "wrong" && (
          <motion.p
            key={`fb-${round}-w`}
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
            transition={{ duration: 0.4 }}
            className="text-[13px] font-bold text-rose text-center"
          >
            Wrong!
          </motion.p>
        )}
      </div>

      {/* Feedback flash */}
      <motion.div
        animate={
          feedback === "correct"
            ? { scale: [1, 1.02, 1] }
            : feedback === "wrong"
              ? { x: [-4, 4, -4, 0] }
              : {}
        }
        transition={{ duration: 0.3 }}
      >
        <div
          className="grid gap-2 md:gap-2.5 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${level.cols}, 1fr)`,
            maxWidth: level.cols <= 3 ? 240 : level.cols <= 4 ? 300 : 340,
          }}
        >
          {Array.from({ length: level.gridSize }).map((_, i) => (
            <motion.button
              key={`${round}-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: i * 0.02,
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
              aria-label={`Square ${i + 1}`}
              whileTap={{ scale: 0.85 }}
              onClick={() => handleTap(i)}
              className="aspect-square rounded-xl md:rounded-2xl border-none cursor-pointer"
              style={{
                background: i === level.oddIndex ? level.odd : level.base,
                boxShadow:
                  feedback === "correct" && i === level.oddIndex
                    ? "0 0 0 3px var(--color-green)"
                    : feedback === "wrong" && i === level.oddIndex
                      ? "0 0 0 3px var(--color-green)"
                      : "none",
              }}
            />
          ))}
        </div>
      </motion.div>

    </div>
  );
}
