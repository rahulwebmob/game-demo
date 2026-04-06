import { motion } from "framer-motion";

export default function Toggle({ on }: { on: boolean }) {
  return (
    <motion.div
      animate={{ backgroundColor: on ? "var(--color-coral)" : "var(--color-muted)" }}
      transition={{ duration: 0.2 }}
      className="w-11 h-6 rounded-full flex items-center px-0.5 cursor-pointer flex-shrink-0"
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white"
        animate={{
          x: on ? 20 : 0,
          scale: on ? [1, 1.15, 1] : 1,
          boxShadow: on
            ? "0 2px 8px color-mix(in srgb, var(--color-coral) 30%, transparent)"
            : "0 1px 3px rgba(0,0,0,0.1)",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />
    </motion.div>
  );
}
