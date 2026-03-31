import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, ChevronDown, Check } from "lucide-react";
import { themeMeta } from "../hooks/useTheme";
import type { ThemeId } from "../hooks/useTheme";
import { useSound } from "../hooks/useSound";

interface Props {
  themeId: ThemeId;
  onThemeChange: (id: ThemeId) => void;
}

function ThemeCircle({
  id,
  size = 24,
  ring,
}: {
  id: ThemeId;
  size?: number;
  ring?: string;
}) {
  const m = themeMeta[id];
  return (
    <div
      className="rounded-full flex-shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${m.preview} 0deg, ${m.accent} 120deg, ${m.secondary} 240deg, ${m.preview} 360deg)`,
        boxShadow: ring || "0 0 0 1.5px var(--color-border)",
      }}
    />
  );
}

export default function ThemePicker({ themeId, onThemeChange }: Props) {
  const sfx = useSound();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <motion.div
        whileHover={{ y: -1 }}
        onClick={() => {
          sfx("tap");
          setOpen((o) => !o);
        }}
        className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
      >
        <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-coral-light flex items-center justify-center flex-shrink-0">
          <Palette size={18} className="text-coral" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] md:text-[15px] font-semibold text-ink">
            Theme
          </p>
          <p className="text-[11px] md:text-[12px] text-ink-muted">
            {themeMeta[themeId].label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeCircle id={themeId} />
          <span className="text-[12px] md:text-[13px] font-semibold text-ink-secondary">
            {themeMeta[themeId].label}
          </span>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="text-ink-muted" />
          </motion.div>
        </div>
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-2xl p-2 shadow-[var(--shadow-elevated)] flex flex-col gap-0.5 max-h-[320px] overflow-y-auto thin-scrollbar border border-border"
            style={{ background: "var(--color-card)" }}
          >
            {(Object.keys(themeMeta) as ThemeId[]).map((id) => {
              const active = themeId === id;
              return (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    sfx("toggle", true);
                    onThemeChange(id);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl border-none cursor-pointer transition-colors w-full text-left ${
                    active
                      ? "bg-coral-light"
                      : "bg-transparent hover:bg-muted/50"
                  }`}
                >
                  <ThemeCircle
                    id={id}
                    ring={active ? "0 0 0 2px var(--color-coral)" : undefined}
                  />
                  <span
                    className={`text-[12px] md:text-[13px] font-semibold flex-1 ${active ? "text-coral" : "text-ink"}`}
                  >
                    {themeMeta[id].label}
                  </span>
                  {active && (
                    <Check size={14} className="text-coral flex-shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
