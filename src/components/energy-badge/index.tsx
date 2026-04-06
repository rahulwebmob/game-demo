import { motion, AnimatePresence } from "framer-motion";
import { Battery } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AnimatedNumber from "../animated-number";

interface Props {
  energy: number;
  maxEnergy: number;
  onClick?: () => void;
}

export default function EnergyBadge({ energy, maxEnergy, onClick }: Props) {
  const prev = useRef(energy);
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    if (energy !== prev.current) {
      setDiff(energy - prev.current);
      prev.current = energy;
      const t = setTimeout(() => setDiff(null), 1100);
      return () => clearTimeout(t);
    }
  }, [energy]);

  const empty = energy === 0;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center gap-1.5 rounded-full font-semibold text-ink px-3 py-[5px] text-[12px] ${
        empty
          ? "bg-rose-light animate-[gentle-pulse_2s_ease-in-out_infinite]"
          : "bg-teal-light"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      <motion.div
        key={energy}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.3 }}
      >
        <Battery
          size={14}
          className={empty ? "text-rose" : "text-teal"}
          strokeWidth={2.2}
        />
      </motion.div>
      <AnimatedNumber value={energy} duration={500} />
      <span className="text-ink-muted">/</span>
      <span>{maxEnergy}</span>
      <AnimatePresence>
        {diff !== null && diff > 0 && (
          <motion.span
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -18, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute -top-2 right-1 text-[11px] font-bold text-green pointer-events-none"
          >
            +{diff}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
