import { motion, AnimatePresence } from "framer-motion";
import { Check, ShoppingBag, X } from "lucide-react";
import { Z } from "../constants";

export interface ToastData {
  id: number;
  message: string;
  type: "success" | "purchase";
}

export default function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 pointer-events-none w-[90%] max-w-[380px]"
      style={{ zIndex: Z.TOAST, paddingTop: "env(safe-area-inset-top)" }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ y: -40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="pointer-events-auto glass-card rounded-2xl px-4 py-3 flex items-center gap-3 shadow-[var(--shadow-elevated)]"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                t.type === "purchase" ? "bg-gold-light" : "bg-green-light"
              }`}
            >
              {t.type === "purchase" ? (
                <ShoppingBag size={16} className="text-gold" />
              ) : (
                <Check size={16} className="text-green" />
              )}
            </div>
            <span className="text-[13px] font-semibold text-ink flex-1">
              {t.message}
            </span>
            <button
              onClick={() => onDismiss(t.id)}
              className="w-6 h-6 rounded-lg flex items-center justify-center bg-transparent border-none cursor-pointer text-ink-muted hover:text-ink"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
