import { motion } from "framer-motion";
import {
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Award,
  ChevronRight,
} from "@/components/animate-ui/icons/index.ts";
import Toggle from "./toggle";
import ThemePicker from "../theme-picker";
import { fade } from "./fade";
import { useAppNavigate } from "../../hooks/use-app-navigate";
import { useAppDispatch } from "../../store/hooks";
import { toggleSound, toggleNotifications } from "../../store/player-slice";
import type { SoundName } from "../../hooks/use-sound";
import type { ThemeId } from "../../hooks/use-theme";

interface Props {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  theme: { themeId: ThemeId; setThemeId: (v: ThemeId | ((prev: ThemeId) => ThemeId)) => void };
  sfx: (name: SoundName, ...args: unknown[]) => void;
}

export default function SettingsSection({
  soundEnabled,
  notificationsEnabled,
  theme,
  sfx,
}: Props) {
  const navigate = useAppNavigate();
  const dispatch = useAppDispatch();

  return (
    <motion.div variants={fade}>
      <h3 className="text-[15px] md:text-[18px] font-bold text-ink mb-3 md:mb-4">
        Settings
      </h3>
      <div className="flex flex-col gap-2.5 md:gap-3">
        {/* Theme */}
        <ThemePicker themeId={theme.themeId} onThemeChange={theme.setThemeId} />

        {/* Sound */}
        <motion.div
          whileHover={{ y: -1 }}
          className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
          onClick={() => {
            sfx("toggle", !soundEnabled);
            dispatch(toggleSound());
          }}
        >
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-teal-light flex items-center justify-center flex-shrink-0">
            {soundEnabled ? (
              <Volume2 size={18} className="text-teal" />
            ) : (
              <VolumeX size={18} className="text-teal" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] md:text-[15px] font-semibold text-ink">
              Sound Effects
            </p>
            <p className="text-[11px] md:text-[12px] text-ink-muted">
              {soundEnabled ? "On" : "Off"}
            </p>
          </div>
          <Toggle on={soundEnabled} />
        </motion.div>

        {/* Notifications */}
        <motion.div
          whileHover={{ y: -1 }}
          className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
          onClick={() => {
            sfx("toggle", !notificationsEnabled);
            dispatch(toggleNotifications());
          }}
        >
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-gold-light flex items-center justify-center flex-shrink-0">
            {notificationsEnabled ? (
              <Bell size={18} className="text-gold" />
            ) : (
              <BellOff size={18} className="text-gold" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] md:text-[15px] font-semibold text-ink">
              Notifications
            </p>
            <p className="text-[11px] md:text-[12px] text-ink-muted">
              {notificationsEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>
          <Toggle on={notificationsEnabled} />
        </motion.div>

        {/* Avatar shop link */}
        <motion.div
          whileHover={{ y: -1 }}
          className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
          onClick={() => navigate("customize")}
        >
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-violet-light flex items-center justify-center flex-shrink-0">
            <Award size={18} className="text-violet" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] md:text-[15px] font-semibold text-ink">
              Customize Avatar
            </p>
            <p className="text-[11px] md:text-[12px] text-ink-muted">
              Change avatar & accessories
            </p>
          </div>
          <ChevronRight size={16} className="text-ink-muted flex-shrink-0" />
        </motion.div>
      </div>
    </motion.div>
  );
}
