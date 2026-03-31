import { motion } from "framer-motion";
import { Eye, Battery, X } from "lucide-react";
import { avatarSrc, avatarSleepSrc } from "../data/avatars";
import type { AvatarId } from "../data/avatars";
import { useSound } from "../hooks/useSound";

interface Props {
  avatar: AvatarId;
  onStartEyeCheck: () => void;
  onClose: () => void;
}

/* ── twinkling star ── */
function Star({
  delay,
  x,
  y,
  size,
}: {
  delay: number;
  x: string;
  y: string;
  size: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{ width: size, height: size, left: x, top: y }}
      animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.7, 1.3, 0.7] }}
      transition={{
        duration: 2.5 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

/* ── moon with glow & animations ── */
function Moon() {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ top: "3%", right: "4%", width: 140, height: 140 }}
      initial={{ opacity: 0, scale: 0.6, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
    >
      {/* Outer soft halo */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: -40,
          background:
            "radial-gradient(circle, rgba(253,224,71,0.10) 0%, rgba(253,224,71,0.03) 50%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Inner warm glow ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: -16,
          background:
            "radial-gradient(circle, rgba(253,224,71,0.12) 0%, rgba(255,200,60,0.04) 60%, transparent 80%)",
          filter: "blur(8px)",
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      {/* Moon image */}
      <motion.img
        src="/moon.png"
        alt="moon"
        draggable={false}
        className="w-full h-full"
        style={{ objectFit: "contain", mixBlendMode: "screen" }}
        animate={{
          rotate: [0, 3, 0, -2, 0],
          y: [0, -4, 0, -2, 0],
          scale: [1, 1.03, 1, 1.015, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Pulsing light rays */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)",
          filter: "blur(4px)",
        }}
        animate={{ opacity: [0, 0.6, 0], scale: [0.9, 1.15, 0.9] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </motion.div>
  );
}

export default function SleepOverlay({
  avatar,
  onStartEyeCheck,
  onClose,
}: Props) {
  const sfx = useSound();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: "brightness(2)" }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[55] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(170deg, #0c1222 0%, #162036 35%, #1a2744 65%, #0f1829 100%)",
      }}
    >
      {/* Close / Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        whileTap={{ scale: 0.85 }}
        onClick={onClose}
        className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <X size={16} className="text-white/40" />
      </motion.button>

      {/* ── Stars ── */}
      <Star delay={0} x="10%" y="7%" size={3} />
      <Star delay={0.6} x="80%" y="11%" size={2} />
      <Star delay={1.1} x="22%" y="20%" size={2.5} />
      <Star delay={0.2} x="90%" y="26%" size={2} />
      <Star delay={1.7} x="6%" y="34%" size={3} />
      <Star delay={0.4} x="68%" y="16%" size={2} />
      <Star delay={1.4} x="42%" y="5%" size={2.5} />
      <Star delay={0.8} x="94%" y="42%" size={2} />
      <Star delay={1.9} x="16%" y="58%" size={2} />
      <Star delay={1.0} x="75%" y="55%" size={2.5} />
      <Star delay={0.3} x="35%" y="78%" size={2} />
      <Star delay={1.5} x="85%" y="70%" size={3} />
      <Star delay={0.1} x="52%" y="85%" size={2} />
      <Star delay={1.2} x="18%" y="90%" size={2.5} />
      <Star delay={2.1} x="60%" y="30%" size={2} />
      <Star delay={0.9} x="48%" y="48%" size={2} />

      {/* ── Moon (crescent) ── */}
      <Moon />
      {/* Moon ambient glow — large area light cast */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 260,
          height: 260,
          top: "-2%",
          right: "-4%",
          background:
            "radial-gradient(circle, rgba(253,224,71,0.07) 0%, rgba(253,224,71,0.02) 40%, transparent 70%)",
          filter: "blur(12px)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Avatar section ── */}
      <motion.div
        className="relative mb-5"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Soft pillow glow */}
        <motion.div
          className="absolute -inset-8 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(123,167,181,0.12) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Avatar image */}
        <motion.div
          className="relative w-[140px] h-[140px] md:w-[180px] md:h-[180px] rounded-3xl overflow-hidden"
          animate={{ scale: [1, 1.025, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src={avatarSleepSrc[avatar] || avatarSrc[avatar]}
            alt={avatar}
            draggable={false}
            className="w-full h-full object-contain select-none"
            style={
              avatarSleepSrc[avatar]
                ? undefined
                : { filter: "grayscale(0.45) brightness(0.65) saturate(0.7)" }
            }
          />
          {/* Sleepy dim overlay */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              background:
                "linear-gradient(180deg, transparent 50%, rgba(15,24,41,0.25) 100%)",
            }}
            animate={{ opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* ── Z Z Z floating up from avatar ── */}
        {/* Z1 — big, close, starts first */}
        <motion.span
          className="absolute font-extrabold pointer-events-none select-none"
          style={{
            fontSize: 26,
            color: "rgba(253,224,71,0.55)",
            right: -14,
            top: -8,
          }}
          animate={{
            y: [0, -40, -85],
            x: [0, 8, 18],
            opacity: [0, 0.6, 0],
            rotate: [-12, 8, -5],
            scale: [0.7, 1, 0.85],
          }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0,
          }}
        >
          Z
        </motion.span>
        {/* Z2 — medium, offset right more */}
        <motion.span
          className="absolute font-extrabold pointer-events-none select-none"
          style={{
            fontSize: 20,
            color: "rgba(253,224,71,0.4)",
            right: -24,
            top: -20,
          }}
          animate={{
            y: [0, -50, -100],
            x: [0, 12, 28],
            opacity: [0, 0.5, 0],
            rotate: [5, -10, 8],
            scale: [0.6, 1, 0.8],
          }}
          transition={{
            duration: 3.6,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.9,
          }}
        >
          z
        </motion.span>
        {/* Z3 — small, drifts farthest */}
        <motion.span
          className="absolute font-extrabold pointer-events-none select-none"
          style={{
            fontSize: 14,
            color: "rgba(253,224,71,0.28)",
            right: -30,
            top: -28,
          }}
          animate={{
            y: [0, -55, -115],
            x: [0, 15, 35],
            opacity: [0, 0.4, 0],
            rotate: [-8, 12, -3],
            scale: [0.5, 1, 0.7],
          }}
          transition={{
            duration: 4.0,
            repeat: Infinity,
            ease: "easeOut",
            delay: 1.8,
          }}
        >
          z
        </motion.span>
      </motion.div>

      {/* ── Text ── */}
      <motion.div
        className="text-center mb-7 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h2 className="text-[24px] md:text-[30px] font-bold text-white mb-2">
          Shh... I'm sleeping
        </h2>
        <motion.p
          className="text-[14px] md:text-[16px] text-white/45"
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          Wake me up with an eye check!
        </motion.p>
      </motion.div>

      {/* ── Energy pill ── */}
      <motion.div
        className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Battery size={16} className="text-white/35" />
        <span className="text-[13px] font-semibold text-white/35">
          0 / 5 Energy
        </span>
      </motion.div>

      {/* ── CTA button ── */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.04 }}
        onClick={() => {
          sfx("tap");
          onStartEyeCheck();
        }}
        className="relative flex items-center gap-3 px-8 py-4 rounded-2xl border-none cursor-pointer overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--color-coral), var(--color-teal))",
          boxShadow:
            "0 8px 32px color-mix(in srgb, var(--color-teal) 30%, transparent)",
        }}
      >
        {/* Shimmer sweep */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
          }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1.2,
          }}
        />
        <Eye size={20} color="white" strokeWidth={2.2} />
        <span className="text-[16px] font-bold text-white relative z-10">
          Start Eye Check
        </span>
      </motion.button>

      {/* ── Bottom hint ── */}
      <motion.p
        className="absolute bottom-8 text-[11px] text-white/20 text-center px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Complete a quick eye test to restore energy and unlock all games
      </motion.p>
    </motion.div>
  );
}
