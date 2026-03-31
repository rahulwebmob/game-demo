import { useState } from "react";
import { motion } from "framer-motion";
import { useSound } from "../hooks/use-sound";
import {
  Gift,
  CheckCircle,
  Flame,
  Target,
  Lock,
  Coins,
  Crown,
  Rocket,
  Clock,
  CalendarHeart,
  Check,
  Eye,
} from "lucide-react";
import CoinBadge from "../components/coin-badge";
import EnergyBadge from "../components/energy-badge";
import AnimatedNumber from "../components/animated-number";
import Confetti from "../components/confetti";
import { dailyRewards } from "../data/avatars";
import ParallaxHeader from "../components/parallax-header";

interface Props {
  coins: number;
  streak: number;
  claimed: boolean;
  onClaim: () => void;
  energy: number;
  maxEnergy: number;
  onStartEyeCheck: () => void;
}

export default function DailyLogin({
  coins,
  streak,
  claimed,
  onClaim,
  energy,
  maxEnergy,
  onStartEyeCheck,
}: Props) {
  const sfx = useSound();
  const noEnergy = energy === 0;
  const todayIdx = streak % 7;
  const days6 = dailyRewards.slice(0, 6);
  const day7 = dailyRewards[6];
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClaim = () => {
    sfx("streak");
    onClaim();
    setShowConfetti(true);
    setTimeout(() => sfx("coinEarn"), 300);
    setTimeout(() => setShowConfetti(false), 1500);
  };

  return (
    <div className="flex flex-col px-5 md:px-8 lg:px-10 pt-7 md:pt-10 pb-2 gap-5 md:gap-7">
      {/* Header */}
      <ParallaxHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-coral-light flex items-center justify-center">
              <CalendarHeart size={20} className="text-coral" />
            </div>
            <h1 className="text-[22px] md:text-[28px] font-bold text-ink tracking-tight">
              Daily Rewards
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <EnergyBadge energy={energy} maxEnergy={maxEnergy} />
            <CoinBadge amount={coins} small />
          </div>
        </div>
      </ParallaxHeader>

      {/* No energy banner */}
      {noEnergy && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center gap-3 shadow-[var(--shadow-card)]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-coral-light), var(--color-teal-light))",
          }}
        >
          <Eye size={20} className="text-coral flex-shrink-0" />
          <p className="text-[13px] font-semibold text-ink flex-1">
            Low Energy — complete an eye check!
          </p>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              sfx("tap");
              onStartEyeCheck();
            }}
            className="px-3 py-1.5 rounded-xl bg-coral text-white text-[12px] font-bold border-none cursor-pointer shadow-[var(--shadow-btn)] flex-shrink-0"
          >
            Eye Check
          </motion.button>
        </motion.div>
      )}

      {/* Streak hero */}
      <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col items-center gap-4 md:gap-5 shadow-[var(--shadow-elevated)]">
        <div className="w-[68px] h-[68px] md:w-[84px] md:h-[84px] rounded-[22px] bg-coral-light flex items-center justify-center">
          <Flame size={34} className="text-coral" />
        </div>
        <div className="text-center">
          <motion.div
            key={streak}
            initial={{ scale: 1 }}
            animate={claimed ? { scale: [1, 1.25, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <AnimatedNumber
              value={streak}
              className="text-[32px] md:text-[42px] font-extrabold text-gradient-coral leading-none inline-block"
            />
          </motion.div>
          <p className="text-[14px] md:text-[16px] font-semibold text-ink-secondary mt-1">
            Day Streak
          </p>
          <p className="text-[11px] md:text-[13px] text-ink-muted flex items-center justify-center gap-1 mt-2">
            <Target size={12} className="text-coral" /> Next milestone: 7-day
            streak
          </p>
        </div>

        {/* Week dots */}
        <div className="flex items-center">
          {[0, 1, 2, 3, 4, 5, 6].map((d) => {
            const filled = d < todayIdx || (d === todayIdx && claimed);
            const current = d === todayIdx && !claimed;
            return (
              <div key={d} className="flex items-center">
                {d > 0 && (
                  <div
                    className={`w-[10px] md:w-[14px] h-[3px] transition-colors ${d <= todayIdx && (d < todayIdx || claimed) ? "bg-coral" : "bg-muted"}`}
                  />
                )}
                <motion.div
                  initial={false}
                  animate={filled ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3, delay: d * 0.05 }}
                  className={`w-[34px] h-[34px] md:w-[42px] md:h-[42px] rounded-full flex items-center justify-center text-[11px] md:text-[13px] font-bold transition-all ${
                    filled
                      ? "bg-coral text-white"
                      : current
                        ? "bg-coral text-white shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-coral)_18%,transparent)]"
                        : "bg-muted text-ink-secondary"
                  }`}
                  style={
                    current
                      ? { animation: "gentle-pulse 2s ease-in-out infinite" }
                      : undefined
                  }
                >
                  {filled ? <Check size={14} strokeWidth={3} /> : d + 1}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day 1-6 grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="grid grid-cols-3 md:grid-cols-6 gap-2.5 md:gap-3"
      >
        {days6.map((rw, i) => {
          const done = i < todayIdx;
          const today = i === todayIdx;
          const locked = i > todayIdx;
          return (
            <motion.div
              key={rw.day}
              variants={{
                hidden: { y: 14, opacity: 0, scale: 0.95 },
                visible: { y: 0, opacity: 1, scale: 1 },
              }}
              whileHover={!locked ? { y: -2 } : undefined}
              className={`flex flex-col items-center gap-2 py-4 md:py-5 rounded-2xl shadow-[var(--shadow-soft)] ${locked ? "opacity-30" : ""}`}
              style={{
                background: today
                  ? "var(--color-coral-light)"
                  : done
                    ? "var(--color-green-light)"
                    : "var(--glass-bg)",
                border: today
                  ? "2px solid var(--color-coral)"
                  : "2px solid transparent",
                backdropFilter: "blur(8px)",
              }}
            >
              {done ? (
                <CheckCircle size={24} className="text-green" />
              ) : today ? (
                <Gift size={24} className="text-coral" />
              ) : (
                <Lock size={20} className="text-ink-muted" />
              )}
              <span className="text-[10px] md:text-[12px] font-semibold text-ink-secondary">
                {rw.label}
              </span>
              <span className="text-[14px] md:text-[16px] font-bold text-gold flex items-center gap-0.5 tabular-nums">
                <Coins size={13} /> {rw.coins}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Day 7 jackpot */}
      <motion.div
        whileHover={{ y: -1 }}
        className={`flex items-center gap-4 p-4 md:p-5 rounded-2xl shadow-[var(--shadow-soft)] ${todayIdx >= 6 ? "" : "opacity-35"}`}
        style={{
          background: "var(--color-gold-light)",
          border:
            todayIdx >= 6
              ? "2px solid var(--color-gold)"
              : "2px solid transparent",
        }}
      >
        <div
          className="w-[52px] h-[52px] md:w-[60px] md:h-[60px] rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background:
              "color-mix(in srgb, var(--color-card) 60%, transparent)",
          }}
        >
          <Crown size={28} className="text-gold" />
        </div>
        <div className="flex-1">
          <p className="text-[15px] md:text-[17px] font-bold text-ink">
            Jackpot — {day7.label}
          </p>
          <p className="text-[11px] md:text-[13px] text-ink-muted mt-0.5">
            Complete a full week
          </p>
        </div>
        <span className="text-[20px] md:text-[24px] font-extrabold text-gradient-gold tabular-nums flex items-center gap-0.5">
          <Coins size={16} className="text-gold" /> {day7.coins}
        </span>
      </motion.div>

      {/* Claim button + confetti */}
      <div className="relative">
        <Confetti active={showConfetti} />
        <motion.button
          whileTap={{ scale: 0.96, y: 2 }}
          whileHover={!claimed ? { boxShadow: "var(--shadow-btn)" } : undefined}
          onClick={handleClaim}
          disabled={claimed}
          className={`w-full py-4 md:py-5 rounded-2xl font-bold text-[15px] md:text-[17px] border-none cursor-pointer transition-all ${
            claimed
              ? "bg-green-light text-green"
              : "bg-coral text-white pulse-claim"
          }`}
        >
          {claimed ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle size={18} /> Claimed Today
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Gift size={18} /> Claim Day {todayIdx + 1} Reward
            </span>
          )}
        </motion.button>
      </div>

      {/* 2x bonus */}
      <div className="bg-violet-light rounded-2xl p-4 md:p-5 flex items-center gap-3.5">
        <div
          className="w-11 h-11 md:w-14 md:h-14 rounded-[14px] md:rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background:
              "color-mix(in srgb, var(--color-card) 60%, transparent)",
          }}
        >
          <Rocket size={22} className="text-violet" />
        </div>
        <div>
          <p className="text-[13px] md:text-[15px] font-bold text-ink">
            7-day streak = 2x rewards
          </p>
          <p className="text-[11px] md:text-[13px] text-ink-muted mt-0.5">
            Keep logging in daily
          </p>
        </div>
      </div>

      {/* Weekly summary */}
      <div className="glass-card rounded-2xl p-5 md:p-6 shadow-[var(--shadow-soft)]">
        <h3 className="text-[11px] md:text-[12px] font-bold text-ink-muted uppercase tracking-[0.08em] flex items-center gap-1.5 mb-4">
          <Clock size={12} /> This Week
        </h3>
        <div className="flex justify-around">
          <Stat
            icon={<Coins size={20} className="text-gold" />}
            val={60}
            label="Earned"
          />
          <div className="w-px bg-muted" />
          <Stat
            icon={<Flame size={20} className="text-coral" />}
            val={streak}
            label="Streak"
          />
          <div className="w-px bg-muted" />
          <Stat
            icon={<Rocket size={20} className="text-violet" />}
            val="1x"
            label="Multi"
          />
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  val,
  label,
}: {
  icon: React.ReactNode;
  val: number | string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {icon}
      {typeof val === "number" ? (
        <AnimatedNumber
          value={val}
          className="text-[18px] md:text-[22px] font-extrabold text-ink"
        />
      ) : (
        <span className="text-[18px] md:text-[22px] font-extrabold text-ink">
          {val}
        </span>
      )}
      <span className="text-[9px] md:text-[11px] font-semibold text-ink-muted uppercase tracking-[0.08em]">
        {label}
      </span>
    </div>
  );
}
