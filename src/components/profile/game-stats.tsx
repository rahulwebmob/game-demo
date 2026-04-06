import { motion } from "framer-motion";
import { Gamepad2, Target, Flame, Clock } from "@/components/animate-ui/icons/index.ts";
import AnimatedNumber from "../animated-number";
import { fade } from "./fade";

const gameStats = [
  {
    label: "Games Played",
    value: 47,
    icon: Gamepad2,
    bg: "var(--color-coral-light)",
    fg: "var(--color-coral)",
  },
  {
    label: "Win Rate",
    value: 72,
    suffix: "%",
    icon: Target,
    bg: "var(--color-teal-light)",
    fg: "var(--color-teal)",
  },
  {
    label: "Best Streak",
    value: 8,
    suffix: "d",
    icon: Flame,
    bg: "var(--color-gold-light)",
    fg: "var(--color-gold)",
  },
  {
    label: "Time Played",
    value: 3,
    suffix: "h",
    icon: Clock,
    bg: "var(--color-violet-light)",
    fg: "var(--color-violet)",
  },
];

export default function GameStats() {
  return (
    <motion.div variants={fade}>
      <h3 className="text-[15px] md:text-[18px] font-bold text-ink mb-3 md:mb-4">
        Game Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {gameStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.06 + i * 0.07, type: "spring", stiffness: 350, damping: 22 }}
            whileHover={{ y: -3, scale: 1.03 }}
            className="glass-card rounded-2xl p-3.5 md:p-4 flex flex-col items-center gap-2 shadow-[var(--shadow-soft)]"
          >
            <div
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center"
              style={{ background: s.bg }}
            >
              <s.icon size={17} style={{ color: s.fg }} strokeWidth={2} />
            </div>
            <AnimatedNumber
              value={s.value}
              suffix={s.suffix}
              duration={700 + i * 120}
              className="text-[18px] md:text-[22px] font-bold text-ink"
            />
            <span className="text-[9px] md:text-[10px] font-semibold text-ink-muted uppercase tracking-[0.06em] text-center">
              {s.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
