import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { avatarSrc, avatarSleepSrc, avatarAccessorySrc } from "../../data/avatars";
import type { AvatarId } from "../../data/avatars";

interface Props {
  avatar: AvatarId;
  size?: number;
  className?: string;
  ring?: boolean;
  level?: number;
  sleeping?: boolean;
  /** Accessory id — swaps to pre-rendered variant image */
  accessory?: string | null;
}

/* ── Floating Z — mirrors the sleep-overlay style ── */
function FloatingZ({
  fontSize,
  delay,
  dx,
  dy,
  opacity,
}: {
  fontSize: number;
  delay: number;
  dx: number;
  dy: number;
  opacity: number;
}) {
  return (
    <motion.span
      className="absolute font-extrabold pointer-events-none select-none"
      style={{
        fontSize,
        color: "var(--color-coral)",
        right: -4,
        top: -2,
      }}
      animate={{
        y: [0, dy * 0.5, dy],
        x: [0, dx * 0.4, dx],
        opacity: [0, opacity, 0],
        rotate: [-12, 8, -5],
        scale: [0.7, 1, 0.85],
      }}
      transition={{
        duration: 3.2 + delay * 0.4,
        repeat: Infinity,
        ease: "easeOut",
        delay,
      }}
    >
      {fontSize > 12 ? "Z" : "z"}
    </motion.span>
  );
}

/** Hook to track actual rendered size via ResizeObserver */
function useRenderedSize(fallback: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [renderedSize, setRenderedSize] = useState(fallback);

  const updateSize = useCallback(() => {
    if (ref.current) {
      setRenderedSize(ref.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateSize]);

  return { ref, renderedSize };
}

export default function AvatarImg({
  avatar,
  size = 80,
  className = "",
  ring,
  level,
  sleeping,
  accessory,
}: Props) {
  const { ref, renderedSize } = useRenderedSize(size);
  const r = size <= 36 ? 10 : size <= 48 ? 12 : size <= 64 ? 16 : 20;
  const s = renderedSize / 80;

  // Determine the image source: sleep > accessory variant > default
  const imgSrc =
    sleeping && avatarSleepSrc[avatar]
      ? avatarSleepSrc[avatar]!
      : !sleeping && accessory && avatarAccessorySrc[avatar]?.[accessory]
        ? avatarAccessorySrc[avatar]![accessory]!
        : avatarSrc[avatar];

  return (
    <div
      ref={ref}
      className={`relative inline-block flex-shrink-0 ${className}`}
      style={{ width: size, height: size, overflow: "visible" }}
    >
      <div
        className={`w-full h-full overflow-hidden flex items-center justify-center ${ring ? "ring-[3px] ring-coral/25" : ""}`}
        style={{ borderRadius: r }}
      >
        <img
          src={imgSrc}
          alt={avatar}
          loading="lazy"
          draggable={false}
          className="w-full h-full object-contain select-none"
          style={
            sleeping && !avatarSleepSrc[avatar]
              ? { filter: "grayscale(0.4) brightness(0.85)" }
              : undefined
          }
        />
      </div>

      {/* Sleeping ZZZ */}
      {sleeping && (
        <>
          <FloatingZ fontSize={Math.round(24 * s)} delay={0} dx={Math.round(16 * s)} dy={Math.round(-36 * s)} opacity={0.7} />
          <FloatingZ fontSize={Math.round(18 * s)} delay={0.9} dx={Math.round(24 * s)} dy={Math.round(-48 * s)} opacity={0.55} />
          <FloatingZ fontSize={Math.round(13 * s)} delay={1.8} dx={Math.round(30 * s)} dy={Math.round(-58 * s)} opacity={0.4} />
        </>
      )}

      {/* Level badge */}
      {level != null && (
        <div
          className="absolute -bottom-1 -right-1 bg-coral text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-[var(--shadow-btn)]"
          style={{
            width: renderedSize * 0.32,
            height: renderedSize * 0.32,
            minWidth: 18,
            minHeight: 18,
            zIndex: 3,
          }}
        >
          {level}
        </div>
      )}
    </div>
  );
}
