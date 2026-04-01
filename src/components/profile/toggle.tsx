import { motion } from "framer-motion";

export default function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className={`w-11 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors flex-shrink-0 ${
        on ? "bg-coral" : "bg-muted"
      }`}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white shadow-sm"
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );
}
