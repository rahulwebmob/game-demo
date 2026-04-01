import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import GameResult from "../game-result";
import { useColorVision, ROUNDS } from "../../../hooks/use-color-vision";

interface Props {
  onComplete: (score: number) => void;
}

export default function ColorVision({ onComplete }: Props) {
  const { round, score, level, feedback, done, handleTap, reset } =
    useColorVision(onComplete);

  if (done) {
    const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;
    return (
      <GameResult
        icon={<Eye size={36} className="text-violet" />}
        iconBg="bg-violet-light"
        title="Vision Score"
        stars={stars}
        score={score}
        subtitle={`out of ${ROUNDS * (ROUNDS + 1) * 5}`}
        accentColor="bg-violet"
        onReset={reset}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-[6px] bg-muted rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${((round + 1) / ROUNDS) * 100}%` }}
            className="h-full bg-violet rounded-full"
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[13px] font-semibold text-ink-secondary">
          {round + 1}/{ROUNDS}
        </span>
      </div>

      <p className="text-center text-[14px] font-medium text-ink-secondary">
        Tap the square that's a different shade
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
                      ? "0 0 0 3px var(--color-coral)"
                      : "none",
              }}
            />
          ))}
        </div>
      </motion.div>

      <div className="text-center">
        <span className="text-[13px] font-bold text-ink tabular-nums">
          Score: {score}
        </span>
      </div>
    </div>
  );
}
