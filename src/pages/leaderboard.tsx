import { useState } from "react";
import { motion } from "framer-motion";
import { useSound } from "../hooks/use-sound";
import {
  Trophy,
  Crown,
  Medal,
  Zap,
  Calendar,
  CalendarDays,
  Infinity as InfinityIcon,
  TrendingUp,
  Clock,
} from "@/components/animate-ui/icons/index.ts";
import AvatarImg from "../components/avatar-img";
import AnimatedNumber from "../components/animated-number";
import { leaderboardData } from "../data/avatars";
import type { AvatarId } from "../data/avatars";
import ParallaxHeader from "../components/parallax-header";

const filters = [
  { id: "daily", label: "Daily", icon: Calendar },
  { id: "weekly", label: "Weekly", icon: CalendarDays },
  { id: "all", label: "All Time", icon: InfinityIcon },
];

const row = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function Leaderboard() {
  const sfx = useSound();
  const [active, setActive] = useState("weekly");
  const [first, second, third, ...rest] = leaderboardData;

  return (
    <div className="flex flex-col px-5 md:px-8 lg:px-10 pt-7 md:pt-10 pb-2 gap-5 md:gap-7">
      {/* Header */}
      <ParallaxHeader>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-gold-light flex items-center justify-center">
            <Trophy size={20} className="text-gold" />
          </div>
          <h1 className="text-[22px] md:text-[28px] font-bold text-ink tracking-tight">
            Leaderboard
          </h1>
        </div>
      </ParallaxHeader>

      {/* Filter pills with layoutId */}
      <div className="flex gap-2 glass-card rounded-2xl p-1.5 md:p-2 shadow-[var(--shadow-soft)]">
        {filters.map((f) => {
          const on = active === f.id;
          return (
            <motion.button
              key={f.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sfx("filter");
                setActive(f.id);
              }}
              className={`flex-1 flex items-center justify-center gap-1 py-2.5 md:py-3 rounded-xl text-[12px] md:text-[14px] font-semibold border-none cursor-pointer relative z-10 ${
                on ? "text-white" : "bg-transparent text-ink-muted"
              }`}
            >
              {on && (
                <motion.div
                  layoutId="filter-pill"
                  className="absolute inset-0 bg-coral rounded-xl shadow-[var(--shadow-btn)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                <f.icon size={14} />
                {f.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 md:gap-5 pt-3 pb-1 md:px-8 lg:px-16">
        <PodiumCard player={second} pos={2} delay={0.08} />
        <PodiumCard player={first} pos={1} delay={0} />
        <PodiumCard player={third} pos={3} delay={0.12} />
      </div>

      {/* Your rank */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 24 }}
        whileHover={{ y: -2, scale: 1.01 }}
        className="bg-coral-light rounded-2xl px-4 md:px-6 py-3.5 md:py-4 flex items-center gap-3 border-2 border-coral/15 shadow-[var(--shadow-soft)]"
      >
        <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-coral/10 flex items-center justify-center">
          <TrendingUp size={18} className="text-coral" />
        </div>
        <div className="flex-1">
          <span className="text-[13px] md:text-[15px] font-bold text-ink">
            Your Rank: #42
          </span>
          <span className="text-[11px] md:text-[13px] text-ink-muted ml-2">
            Top 5%
          </span>
        </div>
        <AnimatedNumber
          value={4820}
          className="text-[14px] md:text-[17px] font-extrabold text-coral"
        />
      </motion.div>

      {/* Players list */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.055 } } }}
        className="flex flex-col gap-2 md:gap-2.5"
      >
        {rest.map((p) => (
          <motion.div
            key={p.rank}
            variants={row}
            whileHover={{ y: -2, boxShadow: "var(--shadow-card)", scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card rounded-2xl px-4 md:px-5 py-3 md:py-3.5 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
          >
            <span className="text-[13px] md:text-[15px] font-bold text-ink-muted w-5 md:w-6 text-center tabular-nums">
              {p.rank}
            </span>
            <AvatarImg avatar={p.avatar} size={38} />
            <span className="text-[13px] md:text-[15px] font-semibold text-ink flex-1 truncate">
              {p.name}
            </span>
            <span className="text-[13px] md:text-[15px] font-semibold text-ink-secondary flex items-center gap-1 tabular-nums">
              <Zap size={13} className="text-coral" />
              {p.score.toLocaleString()}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <p className="text-center text-[11px] md:text-[13px] text-ink-muted flex items-center justify-center gap-1 pb-1">
        <Clock size={11} /> Updated 5 min ago
      </p>
    </div>
  );
}

function PodiumCard({
  player,
  pos,
  delay,
}: {
  player: (typeof leaderboardData)[0];
  pos: number;
  delay: number;
}) {
  const isFirst = pos === 1;
  const heights = [
    "",
    "h-[100px] md:h-[130px]",
    "h-[68px] md:h-[90px]",
    "h-[52px] md:h-[70px]",
  ];
  const colors = [
    "",
    "var(--color-gold-light)",
    "var(--color-muted)",
    "var(--color-coral-light)",
  ];
  const medals = [
    "",
    "var(--color-gold)",
    "var(--color-ink-muted)",
    "var(--color-violet)",
  ];

  return (
    <motion.div
      initial={{ y: 40, opacity: 0, scale: isFirst ? 0.6 : 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 18 }}
      className={`flex flex-col items-center gap-1.5 ${isFirst ? "flex-[1.25]" : "flex-1"}`}
    >
      {isFirst ? (
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 0.6, delay: delay + 0.3 }}
        >
          <Crown size={22} style={{ color: medals[pos] }} />
        </motion.div>
      ) : (
        <Medal size={17} style={{ color: medals[pos] }} />
      )}
      <AvatarImg avatar={player.avatar as AvatarId} size={isFirst ? 58 : 46} />
      <span className="text-[11px] md:text-[13px] font-semibold text-ink truncate max-w-full">
        {player.name}
      </span>
      <div
        className={`w-full ${heights[pos]} rounded-t-2xl flex items-start justify-center pt-3`}
        style={{ background: colors[pos] }}
      >
        <span className="text-[12px] md:text-[14px] font-extrabold text-coral flex items-center gap-0.5 tabular-nums">
          <Zap size={12} /> {player.score.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}
