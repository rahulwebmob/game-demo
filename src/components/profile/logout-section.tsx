import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "@/components/animate-ui/icons/index.ts";
import { fade } from "./fade";
import type { SoundName } from "../../hooks/use-sound";

interface Props {
  sfx: (name: SoundName, ...args: unknown[]) => void;
}

export default function LogoutSection({ sfx }: Props) {
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (!showLogout) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        sfx("modalClose");
        setShowLogout(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showLogout, sfx]);

  return (
    <>
      <motion.div variants={fade}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -1 }}
          onClick={() => {
            sfx("tap");
            setShowLogout(true);
          }}
          className="w-full glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer border-none text-left"
        >
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-rose-light flex items-center justify-center flex-shrink-0">
            <LogOut size={18} className="text-rose" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] md:text-[15px] font-semibold text-rose">
              Log Out
            </p>
            <p className="text-[11px] md:text-[12px] text-ink-muted">
              Clears all data & resets app
            </p>
          </div>
        </motion.button>
      </motion.div>

      {/* Logout confirmation modal */}
      <AnimatePresence>
        {showLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] flex items-center justify-center px-5"
            style={{
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => {
              sfx("modalClose");
              setShowLogout(false);
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-modal-title"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-5 md:p-6 w-full max-w-[360px] shadow-[var(--shadow-elevated)] flex flex-col items-center gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-light flex items-center justify-center">
                <LogOut size={24} className="text-rose" />
              </div>
              <div className="text-center">
                <h4
                  id="logout-modal-title"
                  className="text-[16px] md:text-[18px] font-bold text-ink"
                >
                  Log Out?
                </h4>
                <p className="text-[12px] md:text-[13px] text-ink-muted mt-1">
                  This will clear all your data, coins, avatars, and progress.
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-2 w-full mt-1">
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => {
                    sfx("modalClose");
                    setShowLogout(false);
                  }}
                  className="flex-1 py-2.5 md:py-3 rounded-xl bg-muted text-ink text-[13px] md:text-[14px] font-semibold border-none cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => {
                    sfx("logout");
                    setShowLogout(false);
                    setTimeout(() => {
                      localStorage.clear();
                      window.location.reload();
                    }, 400);
                  }}
                  className="flex-1 py-2.5 md:py-3 rounded-xl bg-rose text-white text-[13px] md:text-[14px] font-bold border-none cursor-pointer"
                >
                  Log Out
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
