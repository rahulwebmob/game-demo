import { motion, AnimatePresence } from "framer-motion";
import { Battery, Plus, Minus, RotateCcw, Eye } from "lucide-react";
import AnimatedNumber from "../animated-number";
import { useSound } from "../../hooks/use-sound";

interface Props {
  energy: number;
  maxEnergy: number;
  onAdd: () => void;
  onSpend: () => void;
  onReset: () => void;
  onStartEyeCheck: () => void;
}

export default function EnergyControl({
  energy,
  maxEnergy,
  onAdd,
  onSpend,
  onReset,
  onStartEyeCheck,
}: Props) {
  const sfx = useSound();
  const pct = (energy / maxEnergy) * 100;
  const empty = energy === 0;
  const full = energy >= maxEnergy;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 md:p-5 shadow-[var(--shadow-card)]"
    >
      {/* Top row: icon + label + value */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${empty ? "bg-rose-light" : "bg-teal-light"}`}
          >
            <Battery
              size={18}
              className={empty ? "text-rose" : "text-teal"}
              strokeWidth={2}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] md:text-[15px] font-bold text-ink">
                Energy
              </p>
              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-coral bg-coral-light px-1.5 py-0.5 rounded-full">
                Demo
              </span>
            </div>
            <p className="text-[10px] md:text-[11px] text-ink-muted">
              Tap +/− or take eye check
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[18px] md:text-[22px] font-bold text-ink tabular-nums">
          <AnimatedNumber value={energy} duration={400} />
          <span className="text-ink-muted text-[14px] md:text-[16px] font-semibold">
            / {maxEnergy}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-[6px] md:h-[8px] bg-muted rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: empty
              ? "var(--color-rose)"
              : "linear-gradient(90deg, var(--color-coral), var(--color-teal))",
          }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>

      {/* Buttons row */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Minus */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.06 }}
          onClick={() => {
            sfx("energyDown");
            onSpend();
          }}
          disabled={empty}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 md:py-3 rounded-xl text-[12px] md:text-[13px] font-bold border-none cursor-pointer transition-colors ${
            empty
              ? "bg-muted text-ink-muted cursor-not-allowed"
              : "bg-rose-light text-rose"
          }`}
        >
          <Minus size={14} />
          <span className="hidden md:inline">Spend</span>
        </motion.button>

        {/* Plus */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.06 }}
          onClick={() => {
            sfx("energyUp");
            onAdd();
          }}
          disabled={full}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 md:py-3 rounded-xl text-[12px] md:text-[13px] font-bold border-none cursor-pointer transition-colors ${
            full
              ? "bg-muted text-ink-muted cursor-not-allowed"
              : "bg-teal-light text-teal"
          }`}
        >
          <Plus size={14} />
          <span className="hidden md:inline">Add</span>
        </motion.button>

        {/* Reset */}
        <motion.button
          whileTap={{ scale: 0.88, rotate: -90 }}
          whileHover={{ scale: 1.06 }}
          onClick={() => {
            sfx("tap");
            onReset();
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 md:py-3 rounded-xl bg-gold-light text-gold text-[12px] md:text-[13px] font-bold border-none cursor-pointer"
        >
          <RotateCcw size={14} />
          <span className="hidden md:inline">Reset</span>
        </motion.button>

        {/* Eye Check */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.06 }}
          onClick={() => {
            sfx("navigate");
            onStartEyeCheck();
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 md:py-3 rounded-xl bg-coral text-white text-[12px] md:text-[13px] font-bold border-none cursor-pointer shadow-[var(--shadow-btn)]"
        >
          <Eye size={14} />
          <span className="hidden md:inline">Eye Check</span>
        </motion.button>
      </div>

      {/* Status message */}
      <AnimatePresence mode="wait">
        {empty && (
          <motion.p
            key="empty"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[11px] md:text-[12px] text-rose font-semibold text-center mt-3"
          >
            No energy — games are locked!
          </motion.p>
        )}
        {full && (
          <motion.p
            key="full"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[11px] md:text-[12px] text-teal font-semibold text-center mt-3"
          >
            Full energy — all games unlocked!
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
