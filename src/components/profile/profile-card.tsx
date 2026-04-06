import { motion } from "framer-motion";
import { Zap, Flame, Trophy } from "@/components/animate-ui/icons/index.ts";
import AvatarImg from "../avatar-img";
import { avatars, playerStats } from "../../data/avatars";
import type { AvatarId } from "../../data/avatars";
import { useAppNavigate } from "../../hooks/use-app-navigate";
import { fade } from "./fade";
import type { SoundName } from "../../hooks/use-sound";

interface Props {
  name: string;
  email: string;
  avatar: AvatarId;
  accessory: string | null;
  score: number;
  streak: number;
  sfx: (name: SoundName, ...args: unknown[]) => void;
}

export default function ProfileCard({
  name,
  email,
  avatar,
  accessory,
  score,
  streak,
  sfx,
}: Props) {
  const navigate = useAppNavigate();
  const avatarDef = avatars.find((a) => a.id === avatar);

  return (
    <motion.div
      variants={fade}
      className="glass-card rounded-2xl p-5 md:p-6 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center gap-4 md:gap-5">
        <motion.div
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: 1.06 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          onClick={() => {
            sfx("tap");
            navigate("customize");
          }}
          className="cursor-pointer"
        >
          <AvatarImg avatar={avatar} accessory={accessory} size={72} level={playerStats.level} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] md:text-[22px] font-bold text-ink truncate">
            {name}
          </h2>
          <p className="text-[12px] md:text-[13px] text-ink-muted mt-0.5">
            {email || "No email set"} — {avatarDef?.name || avatar}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[11px] md:text-[12px] font-semibold text-coral flex items-center gap-1">
              <Zap size={12} /> {score.toLocaleString()} pts
            </span>
            <span className="text-[11px] md:text-[12px] font-semibold text-gold flex items-center gap-1">
              <Flame size={12} /> {streak}d streak
            </span>
            <span className="text-[11px] md:text-[12px] font-semibold text-teal flex items-center gap-1">
              <Trophy size={12} /> #42
            </span>
          </div>
        </div>
      </div>

      {/* XP bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] md:text-[12px] font-semibold text-ink-muted">
            Level {playerStats.level}
          </span>
          <span className="text-[11px] md:text-[12px] font-semibold text-ink-muted tabular-nums">
            {playerStats.xp}/{playerStats.xpToNext} XP
          </span>
        </div>
        <div className="w-full h-[6px] md:h-[8px] bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(playerStats.xp / playerStats.xpToNext) * 100}%`,
            }}
            transition={{
              duration: 1,
              delay: 0.3,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="h-full xp-gradient rounded-full progress-bar"
          />
        </div>
      </div>
    </motion.div>
  );
}
