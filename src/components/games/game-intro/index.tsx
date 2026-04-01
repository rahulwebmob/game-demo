import { motion } from "framer-motion";
import { Play, Star, Coins, Zap, Clock, Target, TrendingUp, Info } from "lucide-react";
import type { GameDef } from "../../../data/games";
import { useSound } from "../../../hooks/use-sound";

interface Props {
  game: GameDef;
  icon: React.ReactNode;
  onStart: () => void;
}

export default function GameIntro({ game, icon, onStart }: Props) {
  const sfx = useSound();
  const { rules } = game;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* Game icon + name */}
      <div className="flex flex-col items-center gap-3 pt-2 pb-1">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: `color-mix(in srgb, ${game.bg} 80%, var(--color-card))`,
            color: game.fg,
          }}
        >
          {icon}
        </div>
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-ink">{game.name}</h2>
          <p className="text-[12px] text-ink-muted mt-0.5">{game.description}</p>
        </div>
      </div>

      {/* How to play */}
      <div className="glass-card rounded-2xl p-4 flex flex-col gap-2 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2">
          <Info size={14} style={{ color: game.fg }} />
          <span className="text-[13px] font-bold text-ink">How to Play</span>
        </div>
        <p className="text-[12px] text-ink-secondary leading-relaxed">
          {rules.howToPlay}
        </p>
      </div>

      {/* Scoring */}
      <div className="glass-card rounded-2xl p-4 flex flex-col gap-2 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2">
          <Target size={14} style={{ color: game.fg }} />
          <span className="text-[13px] font-bold text-ink">Scoring</span>
        </div>
        <p className="text-[12px] text-ink-secondary leading-relaxed">
          {rules.scoring}
        </p>
      </div>

      {/* Star ratings */}
      <div className="glass-card rounded-2xl p-4 flex flex-col gap-2.5 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} style={{ color: game.fg }} />
          <span className="text-[13px] font-bold text-ink">Star Ratings</span>
        </div>
        <div className="flex flex-col gap-2">
          {rules.stars.map((desc, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="flex gap-0.5 w-[52px] flex-shrink-0">
                {[0, 1, 2].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={s <= 2 - i ? "text-gold" : "text-muted"}
                    fill={s <= 2 - i ? "var(--color-gold)" : "none"}
                  />
                ))}
              </div>
              <span className="text-[11px] text-ink-secondary flex-1">{desc}</span>
              <span className="text-[11px] font-bold text-gold flex items-center gap-1 flex-shrink-0">
                <Coins size={11} /> {game.starCoins[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards summary */}
      <div className="flex items-center justify-center gap-5 py-1">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-secondary">
          <Coins size={14} className="text-gold" /> Up to {game.starCoins[0]} coins
        </span>
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-secondary">
          <Clock size={14} className="text-ink-muted" /> {game.time}
        </span>
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-secondary">
          <Zap size={14} className="text-coral" /> 1 energy
        </span>
      </div>

      {/* Start button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          sfx("gameStart");
          onStart();
        }}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white font-bold text-[15px] border-none cursor-pointer shadow-[var(--shadow-btn)]"
        style={{ background: game.fg }}
      >
        <Play size={18} fill="white" /> Start Game
      </motion.button>
    </motion.div>
  );
}
