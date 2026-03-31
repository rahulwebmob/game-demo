import { motion } from "framer-motion";

function getThemeColors() {
  const s = getComputedStyle(document.documentElement);
  return [
    s.getPropertyValue("--color-coral").trim(),
    s.getPropertyValue("--color-gold").trim(),
    s.getPropertyValue("--color-teal").trim(),
    s.getPropertyValue("--color-violet").trim(),
    s.getPropertyValue("--color-sky").trim(),
    s.getPropertyValue("--color-rose").trim(),
  ];
}
const COUNT = 32;

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const colors = getThemeColors();
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: COUNT }).map((_, i) => {
        const color = colors[i % colors.length];
        const x = rand(-120, 120);
        const y = rand(-200, -60);
        const r = rand(-360, 360);
        const size = rand(5, 10);
        const delay = rand(0, 0.3);
        const shape = i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0";
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
            animate={{ x, y, rotate: r, scale: 0, opacity: 0 }}
            transition={{ duration: rand(0.8, 1.4), delay, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: "50%",
              bottom: "50%",
              width: size,
              height: size,
              borderRadius: shape,
              background: color,
            }}
          />
        );
      })}
    </div>
  );
}
