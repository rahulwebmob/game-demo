import { motion } from "framer-motion";
import { Gamepad2, Medal, Gift, Paintbrush } from "lucide-react";
import type { Tab } from "../nav-bar";

const fade = {
  initial: { y: 18, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

function QBtn({
  icon: Icon,
  label,
  bg,
  fg,
  onClick,
}: {
  icon: typeof Medal;
  label: string;
  bg: string;
  fg: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.93, y: 2 }}
      whileHover={{ y: -3, boxShadow: "var(--shadow-elevated)" }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 md:gap-2 py-4 md:py-6 rounded-2xl text-[11px] md:text-[13px] font-semibold border-none cursor-pointer shadow-[var(--shadow-soft)]"
      style={{ background: bg, color: fg }}
    >
      <Icon size={20} strokeWidth={1.8} />
      {label}
    </motion.button>
  );
}

interface Props {
  navigate: (t: Tab) => void;
}

export default function QuickActions({ navigate }: Props) {
  return (
    <motion.div variants={fade} className="grid grid-cols-4 gap-2 md:gap-3">
      <QBtn
        icon={Gamepad2}
        label="Games"
        bg="var(--color-coral-light)"
        fg="var(--color-coral)"
        onClick={() => navigate("games")}
      />
      <QBtn
        icon={Medal}
        label="Ranks"
        bg="var(--color-teal-light)"
        fg="var(--color-teal)"
        onClick={() => navigate("leaderboard")}
      />
      <QBtn
        icon={Gift}
        label="Daily"
        bg="var(--color-gold-light)"
        fg="var(--color-gold)"
        onClick={() => navigate("daily")}
      />
      <QBtn
        icon={Paintbrush}
        label="Shop"
        bg="var(--color-violet-light)"
        fg="var(--color-violet)"
        onClick={() => navigate("customize")}
      />
    </motion.div>
  );
}
