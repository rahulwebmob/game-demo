import { motion } from "framer-motion";
import { Hash } from "lucide-react";
import GameResult from "../game-result";
import { useNumberSequence, TOTAL } from "../../../hooks/use-number-sequence";

interface Props {
  onComplete: (score: number) => void;
}

export default function NumberSequence({ onComplete }: Props) {
  const { round, score, problem, choices, selected, done, handleChoice, reset } =
    useNumberSequence(onComplete);

  if (done) {
    const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;
    return (
      <GameResult
        icon={<Hash size={36} className="text-sky" />}
        iconBg="bg-sky-light"
        title="Math Wizard!"
        stars={stars}
        score={score}
        accentColor="bg-sky"
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
                    className="text-[16px] md:text-[18px] font-bold text-green"
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
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
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
