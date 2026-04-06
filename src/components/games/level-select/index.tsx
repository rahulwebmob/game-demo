import { motion } from "framer-motion";
import { Star, Lock, Infinity, Trophy, ChevronRight } from "@/components/animate-ui/icons/index.ts";
import type { GameDef } from "../../../data/games";
import type { GameProgress } from "../../../store/progress-slice";
import { TOTAL_LEVELS } from "../../../data/level-configs";
import { useSound } from "../../../hooks/use-sound";

interface Props {
  game: GameDef;
  progress: GameProgress;
  onSelectLevel: (level: number) => void;
  onSelectEndless: () => void;
}

export default function LevelSelect({ game, progress, onSelectLevel, onSelectEndless }: Props) {
  const sfx = useSound();

  const starsCollected = progress.totalStars;
  const maxStars = TOTAL_LEVELS * 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-4"
    >
      {/* Progress summary */}
      <div className="glass-card rounded-2xl p-4 shadow-[var(--shadow-soft)] flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: game.bg, color: game.fg }}
        >
          <Trophy size={22} />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-bold text-ink">
            Level {Math.min(progress.currentLevel, TOTAL_LEVELS)} / {TOTAL_LEVELS}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: game.fg }}
                initial={{ width: 0 }}
                animate={{ width: `${(Math.min(progress.currentLevel - 1, TOTAL_LEVELS) / TOTAL_LEVELS) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span className="flex items-center gap-0.5 text-[11px] font-bold text-gold flex-shrink-0">
              <Star size={11} fill="var(--color-gold)" /> {starsCollected}/{maxStars}
            </span>
          </div>
        </div>
      </div>

      {/* Level grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.02 } } }}
        className="grid grid-cols-5 gap-2 md:gap-2.5"
      >
        {Array.from({ length: TOTAL_LEVELS }, (_, i) => {
          const lvl = i + 1;
          const result = progress.levels[lvl];
          const unlocked = lvl <= progress.currentLevel;
          const stars = result?.stars ?? 0;

          return (
            <motion.button
              key={lvl}
              variants={{
                hidden: { opacity: 0, scale: 0.7 },
                visible: { opacity: unlocked ? 1 : 0.5, scale: 1 },
              }}
              whileTap={unlocked ? { scale: 0.88 } : undefined}
              whileHover={unlocked ? { y: -2, scale: 1.06 } : undefined}
              onClick={() => {
                if (!unlocked) return;
                sfx("tap");
                onSelectLevel(lvl);
              }}
              className="relative aspect-square rounded-xl border-none flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors"
              style={{
                background: unlocked
                  ? result
                    ? `color-mix(in srgb, ${game.bg} 70%, var(--color-card))`
                    : "var(--color-card)"
                  : "var(--color-muted)",
                boxShadow: unlocked ? "var(--shadow-soft)" : "none",
                cursor: unlocked ? "pointer" : "not-allowed",
              }}
            >
              {unlocked ? (
                <>
                  <span
                    className="text-[15px] font-bold"
                    style={{ color: result ? game.fg : "var(--color-ink)" }}
                  >
                    {lvl}
                  </span>
                  {/* Stars */}
                  <div className="flex gap-px">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        size={8}
                        className={s <= stars ? "text-gold" : "text-muted"}
                        fill={s <= stars ? "var(--color-gold)" : "none"}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <Lock size={14} className="text-ink-muted" />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Endless mode */}
      <motion.button
        whileTap={progress.endlessUnlocked ? { scale: 0.97 } : undefined}
        onClick={() => {
          if (!progress.endlessUnlocked) return;
          sfx("tap");
          onSelectEndless();
        }}
        className="flex items-center gap-3 p-4 rounded-2xl border-none cursor-pointer shadow-[var(--shadow-soft)]"
        style={{
          background: progress.endlessUnlocked
            ? `linear-gradient(135deg, ${game.bg}, color-mix(in srgb, ${game.fg} 15%, var(--color-card)))`
            : "var(--color-muted)",
          opacity: progress.endlessUnlocked ? 1 : 0.5,
          cursor: progress.endlessUnlocked ? "pointer" : "not-allowed",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: progress.endlessUnlocked
              ? "color-mix(in srgb, var(--color-card) 50%, transparent)"
              : "transparent",
            color: progress.endlessUnlocked ? game.fg : "var(--color-ink-muted)",
          }}
        >
          {progress.endlessUnlocked ? <Infinity size={22} /> : <Lock size={18} />}
        </div>
        <div className="flex-1 text-left">
          <p
            className="text-[14px] font-bold"
            style={{ color: progress.endlessUnlocked ? "var(--color-ink)" : "var(--color-ink-muted)" }}
          >
            Endless Mode
          </p>
          <p className="text-[11px] text-ink-muted">
            {progress.endlessUnlocked
              ? progress.endlessHighScore > 0
                ? `Best: ${progress.endlessHighScore} pts`
                : "Infinite levels with scaling difficulty"
              : `Complete all ${TOTAL_LEVELS} levels to unlock`}
          </p>
        </div>
        {progress.endlessUnlocked && (
          <ChevronRight size={18} style={{ color: game.fg }} />
        )}
      </motion.button>
    </motion.div>
  );
}
