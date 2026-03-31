import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Hash } from "lucide-react";
import GameResult from "./GameResult";
import { useSound } from "../../hooks/useSound";

const TOTAL = 8;

function genSequence(level: number): {
  seq: number[];
  answer: number;
  missingIdx: number;
} {
  const type = Math.floor(Math.random() * 3);
  const start = Math.floor(Math.random() * 10) + 1;
  const step = Math.floor(Math.random() * (3 + level)) + 1;
  const len = 5 + Math.min(level, 3);

  let seq: number[];
  if (type === 0) {
    // arithmetic
    seq = Array.from({ length: len }, (_, i) => start + step * i);
  } else if (type === 1) {
    // multiply
    const mul = 2 + Math.floor(Math.random() * 2);
    seq = Array.from({ length: len }, (_, i) => start * Math.pow(mul, i));
  } else {
    // add increasing
    seq = [start];
    for (let i = 1; i < len; i++) seq.push(seq[i - 1] + step * i);
  }

  const missingIdx = 1 + Math.floor(Math.random() * (len - 2));
  const answer = seq[missingIdx];

  return { seq, answer, missingIdx };
}

function genChoices(answer: number): number[] {
  const set = new Set([answer]);
  while (set.size < 4) {
    const offset =
      (Math.floor(Math.random() * 10) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const v = answer + offset;
    if (v > 0) set.add(v);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

interface Props {
  onComplete: (score: number) => void;
}

export default function NumberSequence({ onComplete }: Props) {
  const sfx = useSound();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState(() => genSequence(0));
  const [choices, setChoices] = useState(() => genChoices(problem.answer));
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const nextRound = useCallback(
    (correct: boolean) => {
      const pts = correct ? (round + 1) * 12 : 0;
      const newScore = score + pts;
      setScore(newScore);

      setTimeout(() => {
        if (round + 1 >= TOTAL) {
          setDone(true);
          onComplete(newScore);
        } else {
          const next = genSequence(round + 1);
          setProblem(next);
          setChoices(genChoices(next.answer));
          setSelected(null);
          setRound((r) => r + 1);
        }
      }, 800);
    },
    [round, score, onComplete],
  );

  function handleChoice(val: number) {
    if (selected !== null) return;
    sfx("tap");
    const correct = val === problem.answer;
    if (correct) sfx("success");
    else sfx("error");
    setSelected(val);
    nextRound(correct);
  }

  function reset() {
    const p = genSequence(0);
    setRound(0);
    setScore(0);
    setProblem(p);
    setChoices(genChoices(p.answer));
    setSelected(null);
    setDone(false);
  }

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

      <p className="text-center text-[14px] font-medium text-ink-secondary">
        What's the missing number?
      </p>

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
