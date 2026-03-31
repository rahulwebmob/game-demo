import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function ParallaxHeader({ children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const y = useTransform(scrollY, [0, 200], [0, -18]);
  const opacity = useTransform(scrollY, [0, 150], [1, 0.85]);
  const scale = useTransform(scrollY, [0, 200], [1, 0.97]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity, scale }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
