import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onDone: () => void;
  accentColor?: string;
}

export default function GameCountdown({ onDone, accentColor = "var(--color-coral)" }: Props) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      const t = setTimeout(onDone, 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [count, onDone]);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: [0.3, 1.2, 1], opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          {count > 0 ? (
            <span
              className="text-[72px] font-extrabold tabular-nums"
              style={{ color: accentColor }}
            >
              {count}
            </span>
          ) : (
            <span
              className="text-[48px] font-extrabold tracking-tight"
              style={{ color: accentColor }}
            >
              GO!
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pulse ring */}
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          className="absolute w-32 h-32 rounded-full"
          style={{ border: `3px solid ${accentColor}` }}
          initial={{ scale: 0.5, opacity: 0.6 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </AnimatePresence>

      <p className="text-[14px] font-semibold text-ink-muted">
        {count > 0 ? "Get ready..." : ""}
      </p>
    </div>
  );
}
