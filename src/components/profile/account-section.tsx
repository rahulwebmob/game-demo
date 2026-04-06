import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  KeyRound,
  ShieldCheck,
  Pencil,
  X,
} from "@/components/animate-ui/icons/index.ts";
import Toggle from "./toggle";
import { fade } from "./fade";
import { useAppDispatch } from "../../store/hooks";
import {
  setName,
  setEmail,
  toggleTwoFactor,
} from "../../store/player-slice";
import { addToast } from "../../store/ui-slice";
import type { SoundName } from "../../hooks/use-sound";

interface Props {
  name: string;
  email: string;
  twoFactorEnabled: boolean;
  sfx: (name: SoundName, ...args: unknown[]) => void;
}

export default function AccountSection({
  name,
  email,
  twoFactorEnabled,
  sfx,
}: Props) {
  const dispatch = useAppDispatch();
  const [editingField, setEditingField] = useState<
    "name" | "email" | "password" | null
  >(null);
  const [editValue, setEditValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const startEdit = (field: "name" | "email" | "password") => {
    sfx("modalOpen");
    setEditingField(field);
    setEditValue(field === "name" ? name : field === "email" ? email : "");
    setConfirmPassword("");
  };

  const cancelEdit = useCallback(() => {
    sfx("modalClose");
    setEditingField(null);
    setEditValue("");
    setConfirmPassword("");
  }, [sfx]);

  useEffect(() => {
    if (!editingField) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelEdit();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [editingField, cancelEdit]);

  const saveEdit = () => {
    if (!editingField) return;
    const trimmed = editValue.trim();
    if (editingField === "name") {
      if (trimmed && trimmed !== name) {
        dispatch(setName(trimmed));
        dispatch(addToast({ message: "Name updated!" }));
        sfx("success");
      }
    } else if (editingField === "email") {
      if (trimmed && trimmed !== email && trimmed.includes("@")) {
        dispatch(setEmail(trimmed));
        dispatch(addToast({ message: "Email updated!" }));
        sfx("success");
      }
    } else if (editingField === "password") {
      if (trimmed.length >= 6 && trimmed === confirmPassword) {
        dispatch(addToast({ message: "Password updated!" }));
        sfx("success");
      } else if (trimmed !== confirmPassword) {
        dispatch(addToast({ message: "Passwords don't match" }));
        sfx("error");
        return;
      } else if (trimmed.length < 6) {
        dispatch(addToast({ message: "Min 6 characters" }));
        sfx("error");
        return;
      }
    }
    cancelEdit();
  };

  return (
    <motion.div variants={fade}>
      <h3 className="text-[15px] md:text-[18px] font-bold text-ink mb-3 md:mb-4">
        Account
      </h3>
      <div className="flex flex-col gap-2.5 md:gap-3">
        {/* Edit modal overlay */}
        <AnimatePresence>
          {editingField && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] flex items-center justify-center px-5"
              style={{
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(4px)",
              }}
              onClick={cancelEdit}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-modal-title"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card rounded-2xl p-5 md:p-6 w-full max-w-[400px] shadow-[var(--shadow-elevated)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4
                    id="edit-modal-title"
                    className="text-[16px] md:text-[18px] font-bold text-ink"
                  >
                    {editingField === "name"
                      ? "Change Name"
                      : editingField === "email"
                        ? "Change Email"
                        : "Change Password"}
                  </h4>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={cancelEdit}
                    aria-label="Close"
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-none cursor-pointer"
                  >
                    <X size={14} className="text-ink" />
                  </motion.button>
                </div>

                <div className="flex flex-col gap-3">
                  <input
                    autoFocus
                    type={
                      editingField === "password"
                        ? "password"
                        : editingField === "email"
                          ? "email"
                          : "text"
                    }
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (editingField !== "password"
                        ? saveEdit()
                        : confirmPassword && saveEdit())
                    }
                    placeholder={
                      editingField === "name"
                        ? "Enter name"
                        : editingField === "email"
                          ? "Enter email"
                          : "New password"
                    }
                    aria-label={
                      editingField === "name"
                        ? "Display name"
                        : editingField === "email"
                          ? "Email address"
                          : "New password"
                    }
                    maxLength={editingField === "name" ? 16 : 64}
                    className="text-[14px] md:text-[15px] text-ink bg-muted rounded-xl px-4 py-3 border-none outline-none w-full placeholder:text-ink-muted"
                  />

                  {editingField === "password" && (
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      placeholder="Confirm password"
                      aria-label="Confirm password"
                      maxLength={64}
                      className="text-[14px] md:text-[15px] text-ink bg-muted rounded-xl px-4 py-3 border-none outline-none w-full placeholder:text-ink-muted"
                    />
                  )}

                  {editingField === "password" && (
                    <p className="text-[10px] md:text-[11px] text-ink-muted">
                      Minimum 6 characters
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={cancelEdit}
                    className="flex-1 py-2.5 md:py-3 rounded-xl bg-muted text-ink text-[13px] md:text-[14px] font-semibold border-none cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={saveEdit}
                    className="flex-1 py-2.5 md:py-3 rounded-xl bg-coral text-white text-[13px] md:text-[14px] font-bold border-none cursor-pointer shadow-[var(--shadow-btn)]"
                  >
                    Save
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name */}
        <motion.div
          whileHover={{ y: -1 }}
          className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
          onClick={() => startEdit("name")}
        >
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-coral-light flex items-center justify-center flex-shrink-0">
            <User size={18} className="text-coral" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] md:text-[15px] font-semibold text-ink">
              Display Name
            </p>
            <p className="text-[11px] md:text-[12px] text-ink-muted truncate">
              {name}
            </p>
          </div>
          <Pencil size={14} className="text-ink-muted flex-shrink-0" />
        </motion.div>

        {/* Email */}
        <motion.div
          whileHover={{ y: -1 }}
          className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
          onClick={() => startEdit("email")}
        >
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-teal-light flex items-center justify-center flex-shrink-0">
            <Mail size={18} className="text-teal" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] md:text-[15px] font-semibold text-ink">
              Email
            </p>
            <p className="text-[11px] md:text-[12px] text-ink-muted truncate">
              {email || "Not set"}
            </p>
          </div>
          <Pencil size={14} className="text-ink-muted flex-shrink-0" />
        </motion.div>

        {/* Password */}
        <motion.div
          whileHover={{ y: -1 }}
          className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
          onClick={() => startEdit("password")}
        >
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-gold-light flex items-center justify-center flex-shrink-0">
            <KeyRound size={18} className="text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] md:text-[15px] font-semibold text-ink">
              Password
            </p>
            <p className="text-[11px] md:text-[12px] text-ink-muted">
              ••••••••
            </p>
          </div>
          <Pencil size={14} className="text-ink-muted flex-shrink-0" />
        </motion.div>

        {/* Two-Factor Authentication */}
        <motion.div
          whileHover={{ y: -1 }}
          className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
          onClick={() => {
            sfx("toggle", !twoFactorEnabled);
            dispatch(toggleTwoFactor());
          }}
        >
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-violet-light flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className="text-violet" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] md:text-[15px] font-semibold text-ink">
              Two-Factor Auth
            </p>
            <p className="text-[11px] md:text-[12px] text-ink-muted">
              {twoFactorEnabled
                ? "Enabled — extra security active"
                : "Disabled — tap to enable"}
            </p>
          </div>
          <Toggle on={twoFactorEnabled} />
        </motion.div>
      </div>
    </motion.div>
  );
}
