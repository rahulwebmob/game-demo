import { motion } from "framer-motion";
import { Brain, Eye, Heart, Activity } from "lucide-react";
import type { Tab } from "../nav-bar";

const fade = {
  initial: { y: 18, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

const cats = [
  {
    icon: Brain,
    label: "Brain",
    bg: "var(--color-teal-light)",
    fg: "var(--color-teal)",
  },
  {
    icon: Eye,
    label: "Eye Care",
    bg: "var(--color-violet-light)",
    fg: "var(--color-violet)",
  },
  {
    icon: Heart,
    label: "Memory",
    bg: "var(--color-coral-light)",
    fg: "var(--color-coral)",
  },
  {
    icon: Activity,
    label: "Stats",
    bg: "var(--color-sky-light)",
    fg: "var(--color-sky)",
  },
];

interface Props {
  navigate: (t: Tab) => void;
}

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.85 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function CategoriesGrid({ navigate }: Props) {
  return (
    <motion.div
      variants={fade}
      className="grid grid-cols-4 gap-3 md:gap-5"
    >
      {cats.map((c, i) => (
        <motion.button
          key={c.label}
          variants={item}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 350, damping: 20 }}
          whileTap={{ scale: 0.88, y: 2 }}
          whileHover={{ y: -4, scale: 1.05 }}
          onClick={() => navigate("games")}
          className="flex flex-col items-center gap-1.5 md:gap-2 bg-transparent border-none cursor-pointer"
        >
          <motion.div
            className="w-[54px] h-[54px] md:w-[68px] md:h-[68px] rounded-2xl md:rounded-[20px] flex items-center justify-center shadow-[var(--shadow-soft)]"
            style={{ background: c.bg }}
            whileHover={{ boxShadow: `0 6px 20px color-mix(in srgb, ${c.fg} 25%, transparent)` }}
          >
            <c.icon size={24} style={{ color: c.fg }} strokeWidth={1.8} />
          </motion.div>
          <span className="text-[11px] md:text-[13px] font-medium text-ink-secondary">
            {c.label}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}
