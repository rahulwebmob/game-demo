import { motion, AnimatePresence } from "framer-motion";
import { Coins } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AnimatedNumber from "./AnimatedNumber";

export default function CoinBadge({
  amount,
  small,
}: {
  amount: number;
  small?: boolean;
}) {
  const prev = useRef(amount);
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    if (amount !== prev.current) {
      setDiff(amount - prev.current);
      prev.current = amount;
      const t = setTimeout(() => setDiff(null), 1100);
      return () => clearTimeout(t);
    }
  }, [amount]);

  return (
    <div
      className={`relative inline-flex items-center gap-1.5 bg-gold-light rounded-full font-semibold text-ink ${
        small ? "px-3 py-[5px] text-[12px]" : "px-4 py-[6px] text-[13px]"
      }`}
    >
      <Coins size={small ? 14 : 16} className="text-gold" strokeWidth={2.2} />
      <AnimatedNumber value={amount} duration={500} />
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
