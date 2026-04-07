import { motion } from "framer-motion";
import { Zap, Flame, Trophy, Star } from "lucide-react";
import AnimatedNumber from "../animated-number";
import { playerStats } from "../../data/avatars";

const fade = {
  initial: { y: 18, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

interface Props {
  score: number;
  streak: number;
}

export default function StatsStrip({ score, streak }: Props) {
  return (
    <motion.div variants={fade} className="grid grid-cols-4 gap-2 md:gap-3">
      {[
        {
          icon: Zap,
          label: "Score",
          val: score,
          bg: "var(--color-coral-light)",
          fg: "var(--color-coral)",
        },
        {
          icon: Flame,
          label: "Streak",
          val: streak,
          bg: "var(--color-gold-light)",
          fg: "var(--color-gold)",
          suffix: "d",
        },
        {
          icon: Trophy,
          label: "Rank",
          val: 42,
          bg: "var(--color-teal-light)",
          fg: "var(--color-teal)",
          prefix: "#",
        },
        {
          icon: Star,
          label: "Level",
          val: playerStats.level,
          bg: "var(--color-violet-light)",
          fg: "var(--color-violet)",
        },
      ].map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 14, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.05 + i * 0.06, type: "spring", stiffness: 350, damping: 22 }}
          whileHover={{ y: -3, scale: 1.04 }}
          className="glass-card rounded-2xl py-3 md:py-5 flex flex-col items-center gap-1.5 md:gap-2 shadow-[var(--shadow-soft)]"
        >
          <div
            className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center"
            style={{ background: s.bg }}
          >
            <s.icon size={16} style={{ color: s.fg }} strokeWidth={2} />
          </div>
          <AnimatedNumber
            value={s.val}
            prefix={s.prefix}
            suffix={s.suffix}
            duration={800 + i * 150}
            className="text-[14px] md:text-[18px] font-bold text-ink"
          />
          <span className="text-[9px] md:text-[10px] font-semibold text-ink-muted uppercase tracking-[0.08em]">
            {s.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
