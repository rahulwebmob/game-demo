import { motion } from "framer-motion";
import { Eye } from "@/components/animate-ui/icons/index.ts";
import { useAppNavigate } from "../../hooks/use-app-navigate";
import type { SoundName } from "../../hooks/use-sound";

const fade = {
  initial: { y: 18, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

interface Props {
  noEnergy: boolean;
  sfx: (name: SoundName, ...args: unknown[]) => void;
}

export default function EyeCheckCta({ noEnergy, sfx }: Props) {
  const navigate = useAppNavigate();

  return (
    <motion.div variants={fade}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -2 }}
        onClick={() => {
          sfx("tap");
          navigate("eye-check");
        }}
        className="w-full border-none rounded-2xl p-5 md:p-6 flex items-center gap-4 cursor-pointer shadow-[var(--shadow-elevated)] relative overflow-hidden text-left"
        style={{
          background:
            "linear-gradient(135deg, var(--color-coral), var(--color-teal))",
        }}
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0"
        >
          <Eye size={28} color="white" strokeWidth={1.8} />
        </motion.div>
        <div className="flex-1">
          <p className="text-[16px] md:text-[18px] font-bold text-white">
            {noEnergy ? "Wake Up Your Brain" : "Eye Check"}
          </p>
          <p className="text-[12px] md:text-[13px] text-white/80 mt-0.5">
            {noEnergy
              ? "Complete an eye check to restore energy"
              : "Take a quick test to keep your eyes healthy"}
          </p>
        </div>
        <motion.div
          animate={noEnergy ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="px-4 py-2.5 rounded-xl bg-white font-bold text-[13px] flex-shrink-0"
          style={{ color: "var(--color-coral)" }}
        >
          Start
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
