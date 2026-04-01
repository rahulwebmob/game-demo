import { motion } from "framer-motion";
import {
  Gamepad2,
  Eye,
  Zap,
  Brain,
  Clock,
  Coins,
  Lock,
} from "lucide-react";
import { games } from "../../data/games";
import type { Tab } from "../nav-bar";

const fade = {
  initial: { y: 18, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

const featuredGames = games.slice(0, 3);

interface Props {
  noEnergy: boolean;
  navigate: (t: Tab) => void;
}

export default function FeaturedGames({ noEnergy, navigate }: Props) {
  return (
    <motion.div variants={fade}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-[15px] md:text-[18px] font-bold text-ink">
          Featured Games
        </h3>
        <motion.span
          whileHover={{ x: 2 }}
          className="text-[12px] md:text-[14px] font-semibold text-coral cursor-pointer"
          onClick={() => navigate("games")}
        >
          See all
        </motion.span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {featuredGames.map((g) => (
          <motion.div
            key={g.id}
            whileTap={noEnergy ? undefined : { scale: 0.97, y: 1 }}
            whileHover={
              noEnergy
                ? undefined
                : { y: -3, boxShadow: "var(--shadow-elevated)" }
            }
            onClick={() => !noEnergy && navigate("games")}
            className={`rounded-3xl p-4 md:p-5 flex md:flex-col gap-3 relative overflow-hidden shadow-[var(--shadow-soft)] border border-border/30 ${noEnergy ? "cursor-not-allowed" : "cursor-pointer"}`}
            style={{
              background: `color-mix(in srgb, ${g.bg} 60%, var(--color-card))`,
            }}
          >
            {noEnergy && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-3xl gap-1.5"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-bg) 70%, transparent)",
                  backdropFilter: "blur(3px)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-rose) 15%, transparent)",
                  }}
                >
                  <Lock size={16} className="text-rose" />
                </div>
                <span className="text-[11px] font-bold text-ink-secondary">
                  Low Energy
                </span>
              </div>
            )}
            <div
              className="w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  "color-mix(in srgb, var(--color-card) 50%, transparent)",
              }}
            >
              {g.icon === "grid" && (
                <Gamepad2
                  size={28}
                  style={{ color: g.fg }}
                  strokeWidth={1.8}
                />
              )}
              {g.icon === "eye" && (
                <Eye size={28} style={{ color: g.fg }} strokeWidth={1.8} />
              )}
              {g.icon === "zap" && (
                <Zap size={28} style={{ color: g.fg }} strokeWidth={1.8} />
              )}
              {g.icon === "brain" && (
                <Brain size={28} style={{ color: g.fg }} strokeWidth={1.8} />
              )}
            </div>
            <div className="flex flex-col justify-center md:justify-start gap-1">
              <span className="text-[15px] md:text-[17px] font-bold text-ink">
                {g.name}
              </span>
              <div className="flex items-center gap-3 text-ink-secondary">
                <span className="flex items-center gap-1 text-[11px] md:text-[12px] font-medium">
                  <Clock size={12} /> {g.time}
                </span>
                <span
                  className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    g.difficulty === "Easy"
                      ? "bg-green-light text-green"
                      : g.difficulty === "Medium"
                        ? "bg-gold-light text-gold"
                        : "bg-rose-light text-rose"
                  }`}
                >
                  {g.difficulty}
                </span>
                <span className="flex items-center gap-0.5 text-[11px] md:text-[12px] font-bold text-gold">
                  <Coins size={11} /> {g.starCoins[0]}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
