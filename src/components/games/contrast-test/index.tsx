import { useMemo } from "react";
import { motion } from "framer-motion";
import { ScanEye } from "lucide-react";
import GameResult from "../game-result";
import { useContrastTest } from "../../../hooks/use-contrast-test";
import type { ContrastTestConfig } from "../../../hooks/use-contrast-test";
import type { ContrastTestLevel, GameLevelConfig } from "../../../data/level-configs";

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

export default function ContrastTest({ onComplete, onPlayAgain, onNextLevel, onBack, levelNumber, newBest, starScores, levelConfig }: Props) {
  const config: ContrastTestConfig | undefined = useMemo(() => {
    if (!levelConfig) return undefined;
    const lc = levelConfig as ContrastTestLevel;
    return {
      rounds: lc.rounds,
      startGrid: lc.startGrid,
      startDiff: lc.startDiff,
      maxScore: lc.maxScore,
    };
  }, [levelConfig]);

  const {
    round, score, feedback, done, positions, handleTap,
    currentGrid, currentCols, currentDiff, currentBase, totalRounds,
  } = useContrastTest(onComplete, config);

  if (done) {
    const stars = starScores
      ? (score >= starScores[0] ? 3 : score >= starScores[1] ? 2 : 1)
      : (score >= 223 ? 3 : score >= 127 ? 2 : 1);
    const rating =
      stars === 3
        ? "Eagle Eyes!"
        : stars === 2
          ? "Good Vision"
          : "Keep Training";
    return (
      <GameResult
        icon={<ScanEye size={36} className="text-rose" />}
        iconBg="bg-rose-light"
        title={rating}
        stars={stars}
        score={score}
        subtitle="Contrast sensitivity score"
        accentColor="bg-rose"
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
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-ink-secondary">
          Round {round + 1}/{totalRounds}
        </span>
        <span className="text-[13px] font-bold text-ink tabular-nums">
          Score: {score}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-[6px] bg-muted rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${(round / totalRounds) * 100}%` }}
            className="h-full bg-rose rounded-full"
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <p className="text-center text-[14px] font-medium text-ink-secondary">
        Tap the square that looks slightly different
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

      <motion.div
        animate={feedback === "wrong" ? { x: [-4, 4, -4, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <div
          className="grid gap-2.5 md:gap-3 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${currentCols}, 1fr)`,
            maxWidth: currentCols <= 2 ? 200 : currentCols <= 3 ? 260 : 300,
          }}
        >
          {Array.from({ length: currentGrid }).map((_, i) => {
            const isOdd = i === positions.oddIdx;
            const gray = isOdd ? currentBase + currentDiff : currentBase;
            return (
              <motion.button
                key={`${round}-${i}`}
                aria-label={`Square ${i + 1}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: i * 0.03,
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleTap(i)}
                className="aspect-square rounded-xl md:rounded-2xl border-none cursor-pointer"
                style={{
                  background: `rgb(${gray}%, ${gray}%, ${gray}%)`,
                  boxShadow:
                    feedback === "correct" && isOdd
                      ? "0 0 0 3px var(--color-green)"
                      : feedback === "wrong" && isOdd
                        ? "0 0 0 3px var(--color-green)"
                        : "var(--shadow-soft)",
                }}
              />
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
