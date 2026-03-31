import { motion } from "framer-motion";
import {
  Zap,
  Flame,
  Star,
  Trophy,
  Gamepad2,
  BarChart3,
  Search,
  Medal,
  Gift,
  Coins,
  Paintbrush,
  Clock,
  Brain,
  Eye,
  Heart,
  Activity,
  Sun,
  Moon,
  Lock,
} from "lucide-react";
import AvatarImg from "../components/avatar-img";
import CoinBadge from "../components/coin-badge";
import EnergyBadge from "../components/energy-badge";
import EnergyControl from "../components/energy-control";
import AnimatedNumber from "../components/animated-number";
import type { AvatarId } from "../data/avatars";
import { dailyQuests, playerStats } from "../data/avatars";
import { games } from "../data/games";
import type { Tab } from "../components/nav-bar";
import type { ThemeId } from "../hooks/use-theme";
import { useSound } from "../hooks/use-sound";
import ParallaxHeader from "../components/parallax-header";

interface Props {
  coins: number;
  score: number;
  streak: number;
  avatar: AvatarId;
  name: string;
  navigate: (t: Tab) => void;
  themeId: ThemeId;
  onThemeChange: (id: ThemeId) => void;
  energy: number;
  maxEnergy: number;
  onStartEyeCheck: () => void;
  onAddEnergy: () => void;
  onSpendEnergy: () => void;
  onResetEnergy: () => void;
}

const fade = {
  initial: { y: 18, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

const cats = [
  {
    icon: Brain,
    label: "Brain",
    bg: "var(--color-teal-light)",
    fg: "var(--color-teal)",
  },
  {
    icon: Eye,
    label: "Eye Care",
    bg: "var(--color-violet-light)",
    fg: "var(--color-violet)",
  },
  {
    icon: Heart,
    label: "Memory",
    bg: "var(--color-coral-light)",
    fg: "var(--color-coral)",
  },
  {
    icon: Activity,
    label: "Stats",
    bg: "var(--color-sky-light)",
    fg: "var(--color-sky)",
  },
];

const featuredGames = games.slice(0, 3);

export default function Home({
  coins,
  score,
  streak,
  avatar,
  name,
  navigate,
  themeId,
  onThemeChange,
  energy,
  maxEnergy,
  onStartEyeCheck,
  onAddEnergy,
  onSpendEnergy,
  onResetEnergy,
}: Props) {
  const sfx = useSound();
  const noEnergy = energy === 0;
  return (
    <motion.div
      initial="initial"
      animate="animate"
      transition={{ staggerChildren: 0.045 }}
      className="flex flex-col gap-5 md:gap-7 px-5 md:px-8 lg:px-10 pt-7 md:pt-10 pb-2"
    >
      {/* ── Header ── */}
      <ParallaxHeader>
        <motion.div variants={fade} className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] md:text-[28px] font-bold text-ink leading-tight tracking-tight">
              Hello, {name}
            </h1>
            <p className="text-[12px] md:text-[14px] text-ink-muted mt-0.5 flex items-center gap-1">
              <MapPin /> Level {playerStats.level} player
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
            whileTap={{ scale: 0.85, rotate: 30 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => {
              sfx("toggle", themeId === "cool");
              onThemeChange(themeId === "cool" ? "warm" : "cool");
            }}
            className="w-10 h-10 md:w-11 md:h-11 rounded-full glass-card border border-border flex items-center justify-center cursor-pointer shadow-[var(--shadow-soft)]"
          >
            <motion.div
              key={themeId}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              {themeId === "cool" ? (
                <Moon size={18} className="text-coral" />
              ) : (
                <Sun size={18} className="text-coral" />
              )}
            </motion.div>
          </motion.button>
          <motion.div
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            onClick={() => navigate("profile")}
            className="cursor-pointer"
          >
            <AvatarImg
              avatar={avatar}
              size={48}
              level={playerStats.level}
              sleeping={noEnergy}
            />
          </motion.div>
        </div>
      </motion.div>
      </ParallaxHeader>

      {/* ── Hero text ── */}
      <motion.div variants={fade}>
        <h2 className="text-[20px] md:text-[26px] font-bold text-ink leading-snug tracking-tight">
          Train Your Brain Stay{" "}
          <span className="text-gradient-coral">Sharp!</span>
        </h2>
        <p className="text-[12px] md:text-[14px] text-ink-muted mt-1.5">
          Medical games for cognitive health & eye care
        </p>
      </motion.div>

      {/* ── Search ── */}
      <motion.div
        variants={fade}
        className="flex items-center gap-3 glass-card rounded-2xl pl-4 md:pl-5 pr-1.5 py-1.5 md:py-2 shadow-[var(--shadow-card)]"
      >
        <Search size={18} className="text-ink-muted flex-shrink-0" />
        <span className="flex-1 text-[13px] md:text-[15px] text-ink-muted">
          Search games...
        </span>
        <motion.div
          whileTap={{ scale: 0.9, y: 1 }}
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-coral flex items-center justify-center shadow-[var(--shadow-btn)] cursor-pointer"
        >
          <Search size={16} color="#fff" strokeWidth={2.4} />
        </motion.div>
      </motion.div>

      {/* ── XP bar ── */}
      <motion.div
        variants={fade}
        className="glass-card rounded-2xl p-4 md:p-5 shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <AvatarImg avatar={avatar} size={36} />
            <div>
              <span className="text-[13px] md:text-[15px] font-bold text-ink">
                Level {playerStats.level}
              </span>
              <p className="text-[10px] md:text-[12px] text-ink-muted tabular-nums">
                {playerStats.xp}/{playerStats.xpToNext} XP
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EnergyBadge energy={energy} maxEnergy={maxEnergy} />
            <CoinBadge amount={coins} small />
          </div>
        </div>
        <div className="w-full h-[6px] md:h-[8px] bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(playerStats.xp / playerStats.xpToNext) * 100}%`,
            }}
            transition={{
              duration: 1,
              delay: 0.4,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="h-full xp-gradient rounded-full progress-bar"
          />
        </div>
      </motion.div>

      {/* ── Energy Control (demo) ── */}
      <motion.div variants={fade}>
        <EnergyControl
          energy={energy}
          maxEnergy={maxEnergy}
          onAdd={onAddEnergy}
          onSpend={onSpendEnergy}
          onReset={onResetEnergy}
          onStartEyeCheck={onStartEyeCheck}
        />
      </motion.div>

      {/* ── Categories ── */}
      <motion.div variants={fade} className="grid grid-cols-4 gap-3 md:gap-5">
        {cats.map((c) => (
          <motion.button
            key={c.label}
            whileTap={{ scale: 0.9, y: 1 }}
            whileHover={{ y: -3 }}
            onClick={() => navigate("games")}
            className="flex flex-col items-center gap-1.5 md:gap-2 bg-transparent border-none cursor-pointer"
          >
            <div
              className="w-[54px] h-[54px] md:w-[68px] md:h-[68px] rounded-2xl md:rounded-[20px] flex items-center justify-center shadow-[var(--shadow-soft)]"
              style={{ background: c.bg }}
            >
              <c.icon size={24} style={{ color: c.fg }} strokeWidth={1.8} />
            </div>
            <span className="text-[11px] md:text-[13px] font-medium text-ink-secondary">
              {c.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* ── Eye Check CTA (always visible) ── */}
      <motion.div variants={fade}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -2 }}
          onClick={() => {
            sfx("tap");
            onStartEyeCheck();
          }}
          className="w-full border-none rounded-2xl p-5 md:p-6 flex items-center gap-4 cursor-pointer shadow-[var(--shadow-elevated)] relative overflow-hidden text-left"
          style={{
            background:
              "linear-gradient(135deg, var(--color-coral), var(--color-teal))",
          }}
        >
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Eye size={28} color="white" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <p className="text-[16px] md:text-[18px] font-bold text-white">
              {noEnergy ? "Wake Up Your Brain" : "Eye Check"}
            </p>
            <p className="text-[12px] md:text-[13px] text-white/80 mt-0.5">
              {noEnergy
                ? "Complete an eye check to restore energy"
                : "Take a quick test to keep your eyes healthy"}
            </p>
          </div>
          <motion.div
            animate={noEnergy ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="px-4 py-2.5 rounded-xl bg-white font-bold text-[13px] flex-shrink-0"
            style={{ color: "var(--color-coral)" }}
          >
            Start
          </motion.div>
        </motion.button>
      </motion.div>

      {/* ── Featured Games ── */}
      <motion.div variants={fade}>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-[15px] md:text-[18px] font-bold text-ink">
            Featured Games
          </h3>
          <motion.span
            whileHover={{ x: 2 }}
            className="text-[12px] md:text-[14px] font-semibold text-coral cursor-pointer"
            onClick={() => navigate("games")}
          >
            See all
          </motion.span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {featuredGames.map((g) => (
            <motion.div
              key={g.id}
              whileTap={noEnergy ? undefined : { scale: 0.97, y: 1 }}
              whileHover={
                noEnergy
                  ? undefined
                  : { y: -3, boxShadow: "var(--shadow-elevated)" }
              }
              onClick={() => !noEnergy && navigate("games")}
              className={`rounded-3xl p-4 md:p-5 flex md:flex-col gap-3 relative overflow-hidden shadow-[var(--shadow-soft)] border border-border/30 ${noEnergy ? "cursor-not-allowed" : "cursor-pointer"}`}
              style={{
                background: `color-mix(in srgb, ${g.bg} 60%, var(--color-card))`,
              }}
            >
              {noEnergy && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-3xl gap-1.5"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-bg) 70%, transparent)",
                    backdropFilter: "blur(3px)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "color-mix(in srgb, var(--color-rose) 15%, transparent)",
                    }}
                  >
                    <Lock size={16} className="text-rose" />
                  </div>
                  <span className="text-[11px] font-bold text-ink-secondary">
                    Low Energy
                  </span>
                </div>
              )}
              <div
                className="w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-card) 50%, transparent)",
                }}
              >
                {g.icon === "grid" && (
                  <Gamepad2
                    size={28}
                    style={{ color: g.fg }}
                    strokeWidth={1.8}
                  />
                )}
                {g.icon === "eye" && (
                  <Eye size={28} style={{ color: g.fg }} strokeWidth={1.8} />
                )}
                {g.icon === "zap" && (
                  <Zap size={28} style={{ color: g.fg }} strokeWidth={1.8} />
                )}
                {g.icon === "brain" && (
                  <Brain size={28} style={{ color: g.fg }} strokeWidth={1.8} />
                )}
              </div>
              <div className="flex flex-col justify-center md:justify-start gap-1">
                <span className="text-[15px] md:text-[17px] font-bold text-ink">
                  {g.name}
                </span>
                <div className="flex items-center gap-3 text-ink-secondary">
                  <span className="flex items-center gap-1 text-[11px] md:text-[12px] font-medium">
                    <Clock size={12} /> {g.time}
                  </span>
                  <span
                    className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      g.difficulty === "Easy"
                        ? "bg-green-light text-green"
                        : g.difficulty === "Medium"
                          ? "bg-gold-light text-gold"
                          : "bg-rose-light text-rose"
                    }`}
                  >
                    {g.difficulty}
                  </span>
                  <span className="flex items-center gap-0.5 text-[11px] md:text-[12px] font-bold text-gold">
                    <Coins size={11} /> {g.coinReward}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Stats strip ── */}
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
            whileHover={{ y: -2 }}
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

      {/* ── Daily Quests ── */}
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

      {/* ── Quick actions ── */}
      <motion.div variants={fade} className="grid grid-cols-4 gap-2 md:gap-3">
        <QBtn
          icon={Gamepad2}
          label="Games"
          bg="var(--color-coral-light)"
          fg="var(--color-coral)"
          onClick={() => navigate("games")}
        />
        <QBtn
          icon={Medal}
          label="Ranks"
          bg="var(--color-teal-light)"
          fg="var(--color-teal)"
          onClick={() => navigate("leaderboard")}
        />
        <QBtn
          icon={Gift}
          label="Daily"
          bg="var(--color-gold-light)"
          fg="var(--color-gold)"
          onClick={() => navigate("daily")}
        />
        <QBtn
          icon={Paintbrush}
          label="Shop"
          bg="var(--color-violet-light)"
          fg="var(--color-violet)"
          onClick={() => navigate("customize")}
        />
      </motion.div>

      {/* ── Health tip banner ── */}
      <motion.div
        variants={fade}
        className="glass-card rounded-2xl p-4 md:p-5 flex items-start gap-3.5 shadow-[var(--shadow-soft)]"
      >
        <div className="w-11 h-11 md:w-14 md:h-14 rounded-[14px] md:rounded-2xl bg-teal-light flex items-center justify-center flex-shrink-0">
          <Brain size={20} className="text-teal" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] md:text-[15px] font-bold text-ink">
            Did You Know?
          </p>
          <p className="text-[11px] md:text-[13px] text-ink-muted mt-0.5">
            15 minutes of daily brain training can improve memory retention by
            up to 30%
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MapPin() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-coral)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline -mt-px"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function QBtn({
  icon: Icon,
  label,
  bg,
  fg,
  onClick,
}: {
  icon: typeof Medal;
  label: string;
  bg: string;
  fg: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.93, y: 2 }}
      whileHover={{ y: -3, boxShadow: "var(--shadow-elevated)" }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 md:gap-2 py-4 md:py-6 rounded-2xl text-[11px] md:text-[13px] font-semibold border-none cursor-pointer shadow-[var(--shadow-soft)]"
      style={{ background: bg, color: fg }}
    >
      <Icon size={20} strokeWidth={1.8} />
      {label}
    </motion.button>
  );
}
