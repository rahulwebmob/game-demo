import { useMemo } from "react";
import { motion } from "framer-motion";
import { Hash, Clock } from "lucide-react";
import GameResult from "../game-result";
import { useNumberSequence } from "../../../hooks/use-number-sequence";
import type { NumberSequenceConfig } from "../../../hooks/use-number-sequence";
import type { NumberSequenceLevel, GameLevelConfig } from "../../../data/level-configs";

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

export default function NumberSequence({ onComplete, onPlayAgain, onNextLevel, onBack, levelNumber, newBest, starScores, levelConfig }: Props) {
  const config: NumberSequenceConfig | undefined = useMemo(() => {
    if (!levelConfig) return undefined;
    const lc = levelConfig as NumberSequenceLevel;
    return {
      rounds: lc.rounds,
      seqLength: lc.seqLength,
      allowedTypes: lc.allowedTypes,
      timeLimitSec: lc.timeLimitSec,
      maxScore: lc.maxScore,
    };
  }, [levelConfig]);

  const {
    round, score, problem, choices, selected, done, handleChoice,
    totalRounds, maxScore, timeLeft, hasTimeLimit, fmt,
  } = useNumberSequence(onComplete, config);

  if (done) {
    const stars = starScores
      ? (score >= starScores[0] ? 3 : score >= starScores[1] ? 2 : 1)
      : (score >= Math.round(maxScore * 0.7) ? 3 : score >= Math.round(maxScore * 0.4) ? 2 : 1);
    const title = stars === 3 ? "Math Wizard!" : stars === 2 ? "Good Math!" : "Keep Practicing";
    return (
      <GameResult
        icon={<Hash size={36} className="text-sky" />}
        iconBg="bg-sky-light"
        title={title}
        stars={stars}
        score={score}
        subtitle={`out of ${maxScore}`}
        accentColor="bg-sky"
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
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold text-ink tabular-nums">
            Score: {score}
          </span>
          {hasTimeLimit && timeLeft !== null && (
            <span className="text-[13px] font-semibold text-ink-secondary flex items-center gap-1">
              <Clock size={13} className="text-coral" /> {fmt(timeLeft)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-[6px] bg-muted rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${(round / totalRounds) * 100}%` }}
            className="h-full bg-sky rounded-full"
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Sequence display */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 py-4">
        {problem.seq.map((num, i) => (
          <motion.div
            key={`${round}-${i}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: i * 0.06,
              type: "spring",
              stiffness: 400,
              damping: 20,
            }}
          >
            {i === problem.missingIdx ? (
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 border-dashed border-coral flex items-center justify-center">
                {selected !== null ? (
                  <span
                    className={`text-[16px] md:text-[18px] font-bold ${selected === problem.answer ? "text-green" : "text-rose"}`}
                  >
                    {problem.answer}
                  </span>
                ) : (
                  <span className="text-[18px] font-bold text-coral">?</span>
                )}
              </div>
            ) : (
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-muted flex items-center justify-center">
                <span className="text-[16px] md:text-[18px] font-bold text-ink tabular-nums">
                  {num}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Feedback text */}
      <div className="h-5 flex items-center justify-center">
        {selected !== null && (
          <motion.p
            key={`fb-${round}`}
            initial={
              selected === problem.answer
                ? { opacity: 0, scale: 0.5 }
                : { opacity: 0, x: 0 }
            }
            animate={
              selected === problem.answer
                ? { opacity: 1, scale: [0.5, 1.15, 1] }
                : { opacity: 1, x: [0, -6, 6, -4, 4, 0] }
            }
            transition={{ duration: selected === problem.answer ? 0.35 : 0.4 }}
            className={`text-[13px] font-bold text-center ${selected === problem.answer ? "text-green" : "text-rose"}`}
          >
            {selected === problem.answer ? "Correct!" : `Wrong — answer was ${problem.answer}`}
          </motion.p>
        )}
        {selected === null && (
          <p className="text-[14px] font-medium text-ink-secondary">
            What's the missing number?
          </p>
        )}
      </div>

      {/* Choices */}
      <div className="grid grid-cols-2 gap-3 max-w-[280px] mx-auto w-full">
        {choices.map((c) => {
          const isCorrect = selected !== null && c === problem.answer;
          const isWrong = selected === c && c !== problem.answer;
          return (
            <motion.button
              key={`${round}-${c}`}
              whileTap={selected === null ? { scale: 0.92 } : undefined}
              onClick={() => handleChoice(c)}
              className={`py-4 rounded-2xl border-2 font-bold text-[18px] cursor-pointer transition-colors ${
                isCorrect
                  ? "bg-green-light border-green text-green"
                  : isWrong
                    ? "bg-rose-light border-rose text-rose"
                    : selected !== null
                      ? "bg-muted border-transparent text-ink-muted"
                      : "bg-card border-border text-ink"
              }`}
            >
              {c}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
