import { motion } from "framer-motion";
import { ScanEye } from "lucide-react";
import GameResult from "../game-result";
import { useContrastTest, TOTAL } from "../../../hooks/use-contrast-test";

interface Props {
  onComplete: (score: number) => void;
}

export default function ContrastTest({ onComplete }: Props) {
  const {
    round, score, feedback, done, positions, handleTap, reset,
    currentGrid, currentCols, currentDiff, currentBase,
  } = useContrastTest(onComplete);

  if (done) {
    const stars = score >= 120 ? 3 : score >= 70 ? 2 : 1;
    const rating =
      score >= 120
        ? "Eagle Eyes!"
        : score >= 70
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
        onReset={reset}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-ink-secondary">
          Round {round + 1}/{TOTAL}
        </span>
        <span className="text-[13px] font-bold text-ink tabular-nums">
          Score: {score}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-1">
        <div className="flex-1 h-[6px] bg-muted rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${((round + 1) / TOTAL) * 100}%` }}
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
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[13px] font-bold text-green text-center"
          >
            Correct!
          </motion.p>
        )}
        {feedback === "wrong" && (
          <motion.p
            key={`fb-${round}-w`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
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
                        ? "0 0 0 3px var(--color-coral)"
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
