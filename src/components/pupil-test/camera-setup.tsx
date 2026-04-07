import { motion } from "framer-motion";
import { Camera, User, Eye, MonitorSmartphone } from "lucide-react";
import { useSound } from "../../hooks/use-sound";

const checks = [
  {
    icon: User,
    text: "Your face is centered and clearly visible on the screen",
  },
  {
    icon: Eye,
    text: "You are looking directly at the camera and remain still",
  },
  {
    icon: MonitorSmartphone,
    text: "The phone is positioned at eye level with the camera facing you",
  },
  { icon: Camera, text: "For best results, use a device with a 4K camera." },
];

interface Props {
  shouldStartTest: boolean;
  setShouldStartTest: (v: boolean) => void;
}

const colors = [
  { bg: "var(--color-teal-light)", fg: "var(--color-teal)" },
  { bg: "var(--color-coral-light)", fg: "var(--color-coral)" },
  { bg: "var(--color-violet-light)", fg: "var(--color-violet)" },
  { bg: "var(--color-sky-light)", fg: "var(--color-sky)" },
];

const item = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0 },
};

export default function CameraSetup({
  shouldStartTest,
  setShouldStartTest,
}: Props) {
  const sfx = useSound();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glass-card rounded-2xl p-5 md:p-6 lg:p-8 shadow-[var(--shadow-card)]"
    >
      <h3 className="text-[16px] md:text-[20px] font-bold text-ink mb-4 md:mb-5">
        Step 2: Camera Setup
      </h3>
      <motion.ul
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.08 }}
        className="flex flex-col gap-3 md:gap-4 list-none p-0 m-0 mb-5 md:mb-6"
      >
        {checks.map((c, i) => (
          <motion.li
            key={i}
            variants={item}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="flex items-start gap-3 md:gap-4"
          >
            <div
              className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-[14px] flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: colors[i % colors.length].bg }}
            >
              <c.icon
                size={16}
                className="md:!w-[18px] md:!h-[18px]"
                style={{ color: colors[i % colors.length].fg }}
              />
            </div>
            <span className="text-[13px] md:text-[15px] text-ink-secondary leading-relaxed">
              {c.text}
            </span>
          </motion.li>
        ))}
      </motion.ul>
      {!shouldStartTest && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-center"
        >
          <motion.button
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.04 }}
            onClick={() => {
              sfx("tap");
              setShouldStartTest(true);
            }}
            className="px-6 md:px-8 py-3 md:py-3.5 rounded-xl bg-coral text-white text-[14px] md:text-[15px] font-bold border-none cursor-pointer shadow-[var(--shadow-btn)] relative overflow-hidden"
          >
            {/* Subtle shimmer */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
            />
            <Camera size={16} className="inline -mt-0.5 mr-1.5 relative z-10" />
            <span className="relative z-10">Enable Camera</span>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
