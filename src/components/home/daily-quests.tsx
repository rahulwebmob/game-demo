import { motion } from "framer-motion";
import { Gamepad2, Trophy, BarChart3, Coins } from "lucide-react";
import { dailyQuests } from "../../data/avatars";
import type { Tab } from "../nav-bar";

const fade = {
  initial: { y: 18, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

interface Props {
  navigate: (t: Tab) => void;
}

export default function DailyQuests({ navigate }: Props) {
  return (
    <motion.div variants={fade}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-[15px] md:text-[18px] font-bold text-ink">
          Daily Quests
        </h3>
        <motion.span
          whileHover={{ x: 2 }}
          className="text-[12px] md:text-[14px] font-semibold text-coral cursor-pointer"
          onClick={() => navigate("games")}
        >
          See all
        </motion.span>
      </div>
      <div className="flex flex-col gap-2.5 md:gap-3">
        {dailyQuests.map((q, qi) => {
          const done = q.progress >= q.total;
          const colors = [
            { bg: "var(--color-coral-light)", fg: "var(--color-coral)" },
            { bg: "var(--color-teal-light)", fg: "var(--color-teal)" },
            { bg: "var(--color-violet-light)", fg: "var(--color-violet)" },
          ];
          const qc = colors[qi % 3];
          const pct = (q.progress / q.total) * 100;
          return (
            <motion.div
              key={q.id}
              whileHover={{ y: -1 }}
              className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)]"
            >
              <div
                className="w-11 h-11 md:w-14 md:h-14 rounded-[14px] md:rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: done ? "var(--color-green-light)" : qc.bg,
                }}
              >
                {q.icon === "gamepad" && (
                  <Gamepad2
                    size={20}
                    style={{ color: done ? "var(--color-green)" : qc.fg }}
                  />
                )}
                {q.icon === "trophy" && (
                  <Trophy
                    size={20}
                    style={{ color: done ? "var(--color-green)" : qc.fg }}
                  />
                )}
                {q.icon === "bar-chart" && (
                  <BarChart3
                    size={20}
                    style={{ color: done ? "var(--color-green)" : qc.fg }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] md:text-[15px] font-semibold text-ink">
                  {q.title}
                </p>
                <div className="w-full h-[5px] md:h-[6px] bg-muted rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 0.8,
                      delay: 0.3 + qi * 0.12,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="h-full rounded-full progress-bar"
                    style={{
                      background: done ? "var(--color-green)" : qc.fg,
                    }}
                  />
                </div>
              </div>
              <span className="text-[11px] md:text-[13px] font-bold text-gold flex items-center gap-0.5 flex-shrink-0 tabular-nums">
                <Coins size={13} /> {q.reward}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
