import { motion } from "framer-motion";
import { Search, Sun, Moon, Brain } from "lucide-react";
import AvatarImg from "../components/avatar-img";
import CoinBadge from "../components/coin-badge";
import EnergyBadge from "../components/energy-badge";
import EnergyControl from "../components/energy-control";
import { playerStats } from "../data/avatars";
import type { Tab } from "../components/nav-bar";
import { useTheme } from "../hooks/use-theme";
import { useSound } from "../hooks/use-sound";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addEnergy,
  spendEnergy,
  resetEnergy,
} from "../store/player-slice";
import { setShowPupilTest } from "../store/ui-slice";
import ParallaxHeader from "../components/parallax-header";
import { MAX_ENERGY } from "../constants";
import CategoriesGrid from "../components/home/categories-grid";
import EyeCheckCta from "../components/home/eye-check-cta";
import FeaturedGames from "../components/home/featured-games";
import StatsStrip from "../components/home/stats-strip";
import DailyQuests from "../components/home/daily-quests";
import QuickActions from "../components/home/quick-actions";

interface Props {
  navigate: (t: Tab) => void;
}

const fade = {
  initial: { y: 18, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

export default function Home({ navigate }: Props) {
  const sfx = useSound();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { coins, score, streak, avatar, accessory, name, energy } =
    useAppSelector((s) => s.player);
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
              sfx("toggle", theme.themeId === "cool");
              theme.setThemeId(theme.themeId === "cool" ? "warm" : "cool");
            }}
            className="w-10 h-10 md:w-11 md:h-11 rounded-full glass-card border border-border flex items-center justify-center cursor-pointer shadow-[var(--shadow-soft)]"
          >
            <motion.div
              key={theme.themeId}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              {theme.themeId === "cool" ? (
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
              accessory={accessory}
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
            <AvatarImg avatar={avatar} size={36} accessory={accessory} />
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
            <EnergyBadge energy={energy} maxEnergy={MAX_ENERGY} />
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
          maxEnergy={MAX_ENERGY}
          onAdd={() => dispatch(addEnergy())}
          onSpend={() => dispatch(spendEnergy())}
          onReset={() => dispatch(resetEnergy())}
          onStartEyeCheck={() => dispatch(setShowPupilTest(true))}
        />
      </motion.div>

      <CategoriesGrid navigate={navigate} />
      <EyeCheckCta noEnergy={noEnergy} sfx={sfx} dispatch={dispatch} />
      <FeaturedGames noEnergy={noEnergy} navigate={navigate} />
      <StatsStrip score={score} streak={streak} />
      <DailyQuests navigate={navigate} />
      <QuickActions navigate={navigate} />

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
