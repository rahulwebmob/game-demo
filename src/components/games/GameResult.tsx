import { useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Star } from "lucide-react";
import { useSound } from "../../hooks/useSound";

interface Props {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  stars: number;
  score: number | string;
  subtitle?: string;
  accentColor?: string;
  children?: React.ReactNode;
  onReset: () => void;
}

export default function GameResult({
  icon,
  iconBg,
  title,
  stars,
  score,
  subtitle,
  accentColor = "bg-coral",
  children,
  onReset,
}: Props) {
  const sfx = useSound();

  // Play celebration sound when result screen mounts
  useEffect(() => {
    sfx("gameComplete");
  }, [sfx]);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-5 py-10"
    >
      <div
        className={`w-20 h-20 rounded-3xl ${iconBg} flex items-center justify-center`}
      >
        {icon}
      </div>
      <h3 className="text-[22px] font-bold text-ink">{title}</h3>
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <Star
            key={i}
            size={28}
            className={i <= stars ? "text-gold" : "text-muted"}
            fill={i <= stars ? "var(--color-gold)" : "none"}
          />
        ))}
      </div>
      <p className="text-[36px] font-extrabold text-gradient-coral leading-none">
        {score}
      </p>
      {subtitle && <p className="text-[13px] text-ink-muted">{subtitle}</p>}
      {children}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          sfx("gameStart");
          onReset();
        }}
        className={`flex items-center gap-2 px-6 py-3 rounded-2xl ${accentColor} text-white font-semibold text-[14px] border-none cursor-pointer shadow-[var(--shadow-btn)]`}
      >
        <RotateCcw size={16} /> Play Again
      </motion.button>
    </motion.div>
  );
}
