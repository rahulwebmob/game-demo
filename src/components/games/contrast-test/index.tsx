
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ScanEye } from "lucide-react";
import GameResult from "../game-result";
import { useSound } from "../../../hooks/use-sound";

const TOTAL = 12;

interface Props {
  onComplete: (score: number) => void;
}

function generatePositions(size: number) {
  return { oddIdx: Math.floor(Math.random() * size) };
}

export default function ContrastTest({ onComplete }: Props) {
  const sfx = useSound();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const [positions, setPositions] = useState(() => generatePositions(4));

  const nextRound = useCallback(
    (correct: boolean) => {
      setFeedback(correct ? "correct" : "wrong");
      const pts = correct ? Math.round(10 + round * 3) : 0;
      const newScore = score + pts;
      setScore(newScore);

      setTimeout(() => {
        setFeedback(null);
        if (round + 1 >= TOTAL) {
          setDone(true);
          onComplete(newScore);
        } else {
          setRound((r) => r + 1);
          setPositions(generatePositions(round < 3 ? 4 : round < 7 ? 9 : 16));
        }
      }, 500);
    },
    [round, score, onComplete],
  );

  function handleTap(idx: number) {
    if (feedback) return;
    sfx("tap");
    const correct = idx === positions.oddIdx;
    if (correct) sfx("success");
    else sfx("error");
    nextRound(correct);
  }

  function reset() {
    setRound(0);
    setScore(0);
    setFeedback(null);
    setDone(false);
    setPositions(generatePositions(4));
  }

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

  const currentGrid = round < 4 ? 4 : round < 8 ? 9 : 16;
  const currentCols = Math.sqrt(currentGrid);
  const currentDiff = Math.max(2, 20 - round * 1.5);
  const currentBase = 45 + ((round * 3) % 30);

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
