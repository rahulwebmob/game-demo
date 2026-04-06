import { motion } from "framer-motion";
import { BarChart3 } from "@/components/animate-ui/icons/index.ts";
import { fade } from "./fade";

const skillBreakdown = [
  { label: "Memory", pct: 78, fg: "var(--color-coral)" },
  { label: "Reaction", pct: 65, fg: "var(--color-teal)" },
  { label: "Pattern", pct: 82, fg: "var(--color-violet)" },
  { label: "Vision", pct: 55, fg: "var(--color-gold)" },
];

export default function SkillBreakdown() {
  return (
    <motion.div
      variants={fade}
      className="glass-card rounded-2xl p-4 md:p-5 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-violet-light flex items-center justify-center">
          <BarChart3 size={17} className="text-violet" strokeWidth={2} />
        </div>
        <h3 className="text-[15px] md:text-[17px] font-bold text-ink">
          Skill Breakdown
        </h3>
      </div>
      <div className="flex flex-col gap-3">
        {skillBreakdown.map((s, i) => (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] md:text-[13px] font-semibold text-ink">
                {s.label}
              </span>
              <span
                className="text-[11px] md:text-[12px] font-bold tabular-nums"
                style={{ color: s.fg }}
              >
                {s.pct}%
              </span>
            </div>
            <div className="w-full h-[5px] md:h-[6px] bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.pct}%` }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + i * 0.1,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                className="h-full rounded-full progress-bar"
                style={{ background: s.fg }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
