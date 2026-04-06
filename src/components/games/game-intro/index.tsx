import { motion } from "framer-motion";
import { Play, Star, Coins, Zap, Clock, Target, TrendingUp, Info } from "@/components/animate-ui/icons/index.ts";
import type { GameDef } from "../../../data/games";
import { useSound } from "../../../hooks/use-sound";

interface Props {
  game: GameDef;
  icon: React.ReactNode;
  onStart: () => void;
  coinRewards?: [number, number, number]; // level-specific [3-star, 2-star, 1-star]
  starScores?: [number, number]; // level-specific [3-star min, 2-star min]
  levelNumber?: number; // which level (for level-based games)
  isEndless?: boolean;
}

export default function GameIntro({ game, icon, onStart, coinRewards, starScores, levelNumber, isEndless }: Props) {
  const sfx = useSound();
  const { rules } = game;
  const coins = coinRewards ?? game.starCoins;
  const [threeMin, twoMin] = starScores ?? rules.starScores;
  const starDescs: [string, string, string] = starScores
    ? [`Score ${threeMin}+`, `Score ${twoMin}–${threeMin - 1}`, `Score below ${twoMin}`]
    : rules.stars;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
      className="flex flex-col gap-4"
    >
      {/* Game icon + name */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
        className="flex flex-col items-center gap-3 pt-2 pb-1"
      >
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.1 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: `color-mix(in srgb, ${game.bg} 80%, var(--color-card))`,
            color: game.fg,
          }}
        >
          {icon}
        </motion.div>
        <div className="text-center">
          <h2 className="text-[20px] font-bold text-ink">{game.name}</h2>
          <p className="text-[12px] text-ink-muted mt-0.5">{game.description}</p>
          {levelNumber ? (
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-violet-light text-violet text-[11px] font-bold">
              {isEndless ? "Endless Mode" : `Level ${levelNumber}`}
            </span>
          ) : !game.hasLevels ? (
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-teal-light text-teal text-[11px] font-bold">
              Quick Test
            </span>
          ) : null}
        </div>
      </motion.div>

      {/* How to play */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        className="glass-card rounded-2xl p-4 flex flex-col gap-2 shadow-[var(--shadow-soft)]"
      >
        <div className="flex items-center gap-2">
          <Info size={14} style={{ color: game.fg }} />
          <span className="text-[13px] font-bold text-ink">How to Play</span>
        </div>
        <p className="text-[12px] text-ink-secondary leading-relaxed">
          {rules.howToPlay}
        </p>
      </motion.div>

      {/* Scoring */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        className="glass-card rounded-2xl p-4 flex flex-col gap-2 shadow-[var(--shadow-soft)]"
      >
        <div className="flex items-center gap-2">
          <Target size={14} style={{ color: game.fg }} />
          <span className="text-[13px] font-bold text-ink">Scoring</span>
        </div>
        <p className="text-[12px] text-ink-secondary leading-relaxed">
          {rules.scoring}
        </p>
      </motion.div>

      {/* Star ratings */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        className="glass-card rounded-2xl p-4 flex flex-col gap-2.5 shadow-[var(--shadow-soft)]"
      >
        <div className="flex items-center gap-2">
          <TrendingUp size={14} style={{ color: game.fg }} />
          <span className="text-[13px] font-bold text-ink">Star Ratings</span>
        </div>
        <div className="flex flex-col gap-2">
          {starDescs.map((desc, i) => (
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
                <Coins size={11} /> {coins[i]}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Rewards summary */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        className="flex items-center justify-center gap-5 py-1"
      >
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-secondary">
          <Coins size={14} className="text-gold" /> Up to {coins[0]} coins
        </span>
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-secondary">
          <Clock size={14} className="text-ink-muted" /> {game.time}
        </span>
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-secondary">
          <Zap size={14} className="text-coral" /> 1 energy
        </span>
      </motion.div>

      {/* Start button */}
      <motion.button
        variants={{ hidden: { opacity: 0, y: 20, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1 } }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02, boxShadow: "0 6px 24px color-mix(in srgb, var(--color-coral) 30%, transparent)" }}
        onClick={() => {
          sfx("gameStart");
          onStart();
        }}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white font-bold text-[15px] border-none cursor-pointer shadow-[var(--shadow-btn)]"
        style={{ background: game.fg }}
      >
        <Play size={18} fill="white" />{" "}
            {isEndless
              ? "Start Endless"
              : levelNumber
                ? `Start Level ${levelNumber}`
                : game.hasLevels
                  ? "Start Game"
                  : "Start Test"}
      </motion.button>
    </motion.div>
  );
}
