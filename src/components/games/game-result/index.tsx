import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Star, Zap, ChevronRight, Trophy, ArrowLeft } from "lucide-react";
import { useSound } from "../../../hooks/use-sound";
import Confetti from "../../confetti";

interface Props {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  stars: number;
  score: number | string;
  subtitle?: string;
  accentColor?: string;
  children?: React.ReactNode;
  onReset: () => void;
  onNextLevel?: () => void;
  onBack?: () => void;
  levelNumber?: number;
  newBest?: boolean;
}

function useCountUp(target: number, duration = 800, delay = 400) {
  const [val, setVal] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, delay]);
  return val;
}

export default function GameResult({
  icon,
  iconBg,
  title,
  stars,
  score,
  subtitle,
  accentColor = "bg-coral",
  children,
  onReset,
  onNextLevel,
  onBack,
  levelNumber,
  newBest,
}: Props) {
  const sfx = useSound();
  const numericScore = typeof score === "number" ? score : null;
  const displayScore = useCountUp(numericScore ?? 0, 800, 400);

  useEffect(() => {
    sfx("gameComplete");
  }, [sfx]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-5 py-10 relative"
    >
      {/* Confetti for 3-star */}
      <Confetti active={stars === 3} />

      {/* Icon with entrance bounce */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 15 }}
        className={`w-20 h-20 rounded-3xl ${iconBg} flex items-center justify-center`}
      >
        {icon}
      </motion.div>

      {levelNumber && (
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[11px] font-bold text-ink-muted uppercase tracking-wider"
        >
          Level {levelNumber}
        </motion.span>
      )}

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-[22px] font-bold text-ink"
      >
        {title}
      </motion.h3>

      {/* Stars with staggered pop-in */}
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={
              i <= stars
                ? { scale: [0, 1.35, 1], rotate: [-30, 10, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{
              delay: 0.35 + i * 0.15,
              duration: 0.4,
              ease: "easeOut",
            }}
          >
            <Star
              size={28}
              className={i <= stars ? "text-gold" : "text-muted"}
              fill={i <= stars ? "var(--color-gold)" : "none"}
            />
          </motion.div>
        ))}
      </div>

      {/* Score count-up */}
      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 18 }}
        className="text-[36px] font-extrabold text-gradient-coral leading-none"
      >
        {numericScore !== null ? displayScore : score}
      </motion.p>

      {/* New best badge */}
      <AnimatePresence>
        {newBest && (
          <motion.span
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1, y: 0 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-light text-gold text-[12px] font-bold"
          >
            <Trophy size={13} /> New Best!
          </motion.span>
        )}
      </AnimatePresence>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-[13px] text-ink-muted"
        >
          {subtitle}
        </motion.p>
      )}
      {children}

      {/* Buttons slide up */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 300, damping: 24 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sfx("gameStart");
              onReset();
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${onNextLevel ? "bg-muted text-ink" : `${accentColor} text-white shadow-[var(--shadow-btn)]`} font-semibold text-[14px] border-none cursor-pointer`}
          >
            <RotateCcw size={16} /> Retry <Zap size={14} className="opacity-70" />
          </motion.button>

          {onNextLevel && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sfx("gameStart");
                onNextLevel();
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${accentColor} text-white font-bold text-[14px] border-none cursor-pointer shadow-[var(--shadow-btn)]`}
            >
              Next Level <ChevronRight size={16} />
            </motion.button>
          )}
        </div>

        {onBack && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              sfx("navigate");
              onBack();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-ink-muted text-[13px] font-medium border-none cursor-pointer bg-transparent hover:bg-muted transition-colors"
          >
            <ArrowLeft size={14} /> {onNextLevel ? "Back to Levels" : "Back to Games"}
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
