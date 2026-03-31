import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { avatarSrc, avatarSleepSrc, accessories } from "../../data/avatars";
import type { AvatarId } from "../../data/avatars";

interface Props {
  avatar: AvatarId;
  size?: number;
  className?: string;
  ring?: boolean;
  level?: number;
  sleeping?: boolean;
  /** Accessory id to overlay on the avatar */
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

/* ── Single accessory image with entrance + idle animation ── */
function AccessoryImage({
  accessoryId,
  avatarId,
  size,
}: {
  accessoryId: string;
  avatarId: AvatarId;
  size: number;
}) {
  const acc = accessories.find((a) => a.id === accessoryId);
  if (!acc) return null;

  const placement = acc.placement[avatarId] || acc.placement.default;
  if (!placement) return null;

  const { cx, cy, width, rotate = 0 } = placement;
  const pxLeft = (cx / 100) * size;
  const pxTop = (cy / 100) * size;
  const pxWidth = (width / 100) * size;
  const idleAnimation = getIdleAnimation(accessoryId);

  return (
    <motion.img
      key={accessoryId}
      src={acc.src}
      alt={acc.name}
      draggable={false}
      className="absolute pointer-events-none select-none"
      style={{
        left: pxLeft,
        top: pxTop,
        width: pxWidth,
        height: "auto",
        x: "-50%",
        y: "-50%",
        zIndex: 2,
        filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.18))",
      }}
      initial={{ scale: 0, opacity: 0, rotate: rotate - 15 }}
      animate={{
        scale: 1,
        opacity: 1,
        rotate,
        ...idleAnimation.animate,
      }}
      exit={{ scale: 0, opacity: 0, rotate: rotate + 15 }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 20,
        ...idleAnimation.transition,
      }}
    />
  );
}

/** Each accessory gets a unique subtle idle animation */
function getIdleAnimation(id: string) {
  switch (id) {
    case "crown":
      return {
        animate: {
          y: [0, -1.5, 0],
          rotate: [0, 1, 0, -1, 0],
        },
        transition: {
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
          rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
        },
      };
    case "glasses":
      return {
        animate: {
          y: [0, 0.5, 0],
        },
        transition: {
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" as const, delay: 0.5 },
        },
      };
    case "mask":
      return {
        animate: {
          y: [0, 1, 0],
          scale: [1, 1.01, 1],
        },
        transition: {
          y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" as const },
          scale: { duration: 3.5, repeat: Infinity, ease: "easeInOut" as const },
        },
      };
    case "grad-cap":
      return {
        animate: {
          y: [0, -1, 0],
          rotate: [-5, -3, -5],
        },
        transition: {
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
          rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" as const },
        },
      };
    default:
      return { animate: {}, transition: {} };
  }
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
          src={
            sleeping && avatarSleepSrc[avatar]
              ? avatarSleepSrc[avatar]!
              : avatarSrc[avatar]
          }
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

      {/* Accessory overlay — uses renderedSize so positioning matches actual CSS size */}
      <AnimatePresence mode="popLayout">
        {accessory && !sleeping && (
          <AccessoryImage accessoryId={accessory} avatarId={avatar} size={renderedSize} />
        )}
      </AnimatePresence>

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
