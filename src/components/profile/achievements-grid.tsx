import { motion } from "framer-motion";
import { Gamepad2, Eye, Brain, Coins, Flame, Trophy } from "@/components/animate-ui/icons/index.ts";
import { fade } from "./fade";

const achievements = [
  {
    id: "first-game",
    label: "First Game",
    icon: Gamepad2,
    unlocked: true,
    bg: "var(--color-coral-light)",
    fg: "var(--color-coral)",
  },
  {
    id: "sharp-eye",
    label: "Sharp Eye",
    icon: Eye,
    unlocked: true,
    bg: "var(--color-teal-light)",
    fg: "var(--color-teal)",
  },
  {
    id: "brain-master",
    label: "Brain Master",
    icon: Brain,
    unlocked: false,
    bg: "var(--color-violet-light)",
    fg: "var(--color-violet)",
  },
  {
    id: "coin-collector",
    label: "1K Coins",
    icon: Coins,
    unlocked: false,
    bg: "var(--color-gold-light)",
    fg: "var(--color-gold)",
  },
  {
    id: "streak-king",
    label: "7-Day Streak",
    icon: Flame,
    unlocked: false,
    bg: "var(--color-coral-light)",
    fg: "var(--color-coral)",
  },
  {
    id: "top-10",
    label: "Top 10",
    icon: Trophy,
    unlocked: false,
    bg: "var(--color-sky-light)",
    fg: "var(--color-sky)",
  },
];

export default function AchievementsGrid() {
  return (
    <motion.div variants={fade}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-[15px] md:text-[18px] font-bold text-ink">
          Achievements
        </h3>
        <span className="text-[12px] md:text-[13px] font-semibold text-ink-muted">
          {achievements.filter((a) => a.unlocked).length}/
          {achievements.length}
        </span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 md:gap-3">
        {achievements.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.06, type: "spring", stiffness: 350, damping: 20 }}
            whileHover={a.unlocked ? { y: -3, scale: 1.06 } : undefined}
            className={`flex flex-col items-center gap-1.5 py-3 md:py-4 rounded-2xl shadow-[var(--shadow-soft)] relative ${
              a.unlocked ? "glass-card" : "bg-muted/50"
            }`}
          >
            <div
              className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center ${!a.unlocked ? "opacity-30" : ""}`}
              style={{ background: a.bg }}
            >
              <a.icon size={18} style={{ color: a.fg }} strokeWidth={2} />
            </div>
            <span
              className={`text-[9px] md:text-[10px] font-semibold text-center px-1 ${
                a.unlocked ? "text-ink" : "text-ink-muted"
              }`}
            >
              {a.label}
            </span>
            {a.unlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 500, damping: 15 }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green flex items-center justify-center"
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
