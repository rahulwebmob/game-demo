import { motion } from "framer-motion";
import { Moon, Lightbulb, Smartphone, Maximize } from "lucide-react";

const colors = [
  { bg: "var(--color-coral-light)", fg: "var(--color-coral)" },
  { bg: "var(--color-gold-light)", fg: "var(--color-gold)" },
  { bg: "var(--color-violet-light)", fg: "var(--color-violet)" },
  { bg: "var(--color-teal-light)", fg: "var(--color-teal)" },
];

const steps = [
  {
    icon: Moon,
    text: "Stay in a dark room with a table lamp in front of you.",
  },
  { icon: Lightbulb, text: "Avoid any glare or light source behind you." },
  {
    icon: Smartphone,
    text: "Use a high-resolution front camera (e.g., iPhone 14 Pro Max or above).",
  },
  {
    icon: Maximize,
    text: "Ensure the test runs in fullscreen mode for better tracking.",
  },
];

const item = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0 },
};

export default function TestPreparation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glass-card rounded-2xl p-5 md:p-6 lg:p-8 shadow-[var(--shadow-card)]"
    >
      <h3 className="text-[16px] md:text-[20px] font-bold text-ink mb-4 md:mb-5">
        Step 1: Test Preparation Guidelines
      </h3>
      <motion.ul
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.08 }}
        className="flex flex-col gap-3 md:gap-4 list-none p-0 m-0"
      >
        {steps.map((s, i) => (
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
              <s.icon
                size={16}
                className="md:!w-[18px] md:!h-[18px]"
                style={{ color: colors[i % colors.length].fg }}
              />
            </div>
            <span className="text-[13px] md:text-[15px] text-ink-secondary leading-relaxed">
              {s.text}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}
