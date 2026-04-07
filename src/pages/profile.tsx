import { motion } from "framer-motion";
import { Info, Calendar } from "lucide-react";
import CoinBadge from "../components/coin-badge";
import ParallaxHeader from "../components/parallax-header";
import { useAppSelector } from "../store/hooks";
import { useTheme } from "../hooks/use-theme";
import { useSound } from "../hooks/use-sound";
import { fade } from "../components/profile/fade";
import ProfileCard from "../components/profile/profile-card";
import GameStats from "../components/profile/game-stats";
import SkillBreakdown from "../components/profile/skill-breakdown";
import AchievementsGrid from "../components/profile/achievements-grid";
import AccountSection from "../components/profile/account-section";
import SettingsSection from "../components/profile/settings-section";
import LogoutSection from "../components/profile/logout-section";

export default function Profile() {
  const sfx = useSound();
  const {
    coins,
    score,
    streak,
    avatar,
    accessory,
    name,
    email,
    soundEnabled,
    notificationsEnabled,
    twoFactorEnabled,
  } = useAppSelector((s) => s.player);
  const theme = useTheme();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      transition={{ staggerChildren: 0.045 }}
      className="flex flex-col gap-5 md:gap-7 px-5 md:px-8 lg:px-10 pt-7 md:pt-10 pb-2"
    >
      {/* Header */}
      <ParallaxHeader>
        <motion.div variants={fade} className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div>
              <h1 className="text-[22px] md:text-[28px] font-bold text-ink tracking-tight">
                Profile
              </h1>
              <p className="text-[11px] md:text-[13px] text-ink-muted">
                Your stats & settings
              </p>
            </div>
          </div>
          <CoinBadge amount={coins} small />
        </motion.div>
      </ParallaxHeader>

      <ProfileCard
        name={name}
        email={email}
        avatar={avatar}
        accessory={accessory}
        score={score}
        streak={streak}
        sfx={sfx}
      />

      <GameStats />
      <SkillBreakdown />
      <AchievementsGrid />

      <AccountSection
        name={name}
        email={email}
        twoFactorEnabled={twoFactorEnabled}
        sfx={sfx}
      />

      <SettingsSection
        soundEnabled={soundEnabled}
        notificationsEnabled={notificationsEnabled}
        theme={theme}
        sfx={sfx}
      />

      {/* About */}
      <motion.div
        variants={fade}
        className="glass-card rounded-2xl p-4 md:p-5 flex items-start gap-3.5 shadow-[var(--shadow-soft)]"
      >
        <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-sky-light flex items-center justify-center flex-shrink-0">
          <Info size={18} className="text-sky" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] md:text-[15px] font-bold text-ink">
            Pupilfy v1.0
          </p>
          <p className="text-[11px] md:text-[13px] text-ink-muted mt-0.5">
            Medical games for cognitive health & eye care. Train your brain
            daily!
          </p>
        </div>
      </motion.div>

      <LogoutSection sfx={sfx} />

      {/* Member since */}
      <motion.div
        variants={fade}
        className="flex items-center justify-center gap-2 py-2"
      >
        <Calendar size={13} className="text-ink-muted" />
        <span className="text-[11px] md:text-[12px] text-ink-muted font-medium">
          Member since{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
      </motion.div>
    </motion.div>
  );
}
