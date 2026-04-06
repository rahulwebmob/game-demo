import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Users,
  Wand2,
  Lock,
  Coins,
  ArrowLeft,
  Glasses,
  Ban,
} from "lucide-react";
import AvatarImg from "../components/avatar-img";
import CoinBadge from "../components/coin-badge";
import { avatars, accessories } from "../data/avatars";
import type { Tab } from "../components/nav-bar";
import { useSound } from "../hooks/use-sound";
import ParallaxHeader from "../components/parallax-header";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setAvatar, setAccessory, buyAvatar, buyAccessory } from "../store/player-slice";
import { addToast } from "../store/ui-slice";

interface Props {
  navigate: (t: Tab) => void;
}

const accIcons: Record<string, React.ReactNode> = {
  glasses: <Glasses size={24} />,
};

const gridItem = {
  hidden: { opacity: 0, scale: 0.7, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export default function Customize({ navigate }: Props) {
  const sfx = useSound();
  const dispatch = useAppDispatch();
  const { coins, avatar, accessory, ownedAvatars, ownedAccessories } =
    useAppSelector((s) => s.player);
  const cur = avatars.find((a) => a.id === avatar);

  return (
    <div className="flex flex-col px-5 md:px-8 lg:px-10 pt-7 md:pt-10 pb-2 gap-6 md:gap-8">
      {/* Header */}
      <ParallaxHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                sfx("tap");
                navigate("profile");
              }}
              className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-muted flex items-center justify-center border-none cursor-pointer"
            >
              <ArrowLeft size={18} className="text-ink" />
            </motion.button>
            <div>
              <h1 className="text-[22px] md:text-[28px] font-bold text-ink tracking-tight">
                Customize
              </h1>
              <p className="text-[11px] md:text-[13px] text-ink-muted">
                Avatars & accessories
              </p>
            </div>
          </div>
          <CoinBadge amount={coins} small />
        </div>
      </ParallaxHeader>

      {/* Preview card */}
      <div className="glass-card rounded-3xl py-8 md:py-10 flex flex-col items-center gap-3 md:gap-4 shadow-[var(--shadow-elevated)]">
        <div
          className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] rounded-3xl flex items-center justify-center"
          style={{
            background: `color-mix(in srgb, ${cur?.bg || "var(--color-coral)"} 8%, transparent)`,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={avatar}
              initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.7, opacity: 0, rotate: 8 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
            >
              <AvatarImg
                avatar={avatar}
                accessory={accessory}
                size={110}
                className="md:!w-[140px] md:!h-[140px]"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <motion.span
          key={cur?.name}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[16px] md:text-[20px] font-bold text-ink"
        >
          {cur?.name}
        </motion.span>
        {accessory && (
          <span className="text-[12px] md:text-[14px] text-ink-muted font-medium">
            Wearing: {accessories.find((a) => a.id === accessory)?.name}
          </span>
        )}
      </div>

      {/* Characters */}
      <Section icon={<Users size={15} />} label="Characters">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-4 gap-3 md:gap-4"
        >
          {avatars.map((a) => {
            const owned = ownedAvatars.includes(a.id);
            const active = avatar === a.id;
            const locked = !owned && coins < a.price;
            return (
              <motion.button
                key={a.id}
                variants={gridItem}
                whileTap={{ scale: 0.92, y: 1 }}
                whileHover={!locked ? { y: -2 } : undefined}
                onClick={() => {
                  if (owned) {
                    sfx("tap");
                    dispatch(setAvatar(a.id));
                  } else if (!locked) {
                    sfx("coinSpend");
                    dispatch(buyAvatar({ id: a.id, price: a.price }));
                    dispatch(
                      addToast({
                        message: `Unlocked ${a.name}!`,
                        type: "purchase",
                      }),
                    );
                  }
                }}
                className={`relative flex flex-col items-center gap-2 p-2.5 md:p-3 rounded-2xl border-2 cursor-pointer glass-card shadow-[var(--shadow-soft)] transition-all ${
                  active ? "border-coral !bg-coral-light" : "border-transparent"
                } ${locked ? "opacity-30" : ""}`}
              >
                <div
                  className="w-[50px] h-[50px] md:w-[64px] md:h-[64px] rounded-xl overflow-hidden relative"
                  style={{
                    background: `color-mix(in srgb, ${a.bg} 10%, transparent)`,
                  }}
                >
                  <AvatarImg
                    avatar={a.id}
                    size={50}
                    className="md:!w-[64px] md:!h-[64px]"
                  />
                  {locked && (
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-xl"
                      style={{
                        background:
                          "color-mix(in srgb, var(--color-bg) 60%, transparent)",
                      }}
                    >
                      <Lock size={15} className="text-ink-muted" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] md:text-[13px] font-semibold text-ink">
                  {a.name}
                </span>
                {!owned && (
                  <span className="text-[10px] md:text-[12px] font-bold text-gold flex items-center gap-0.5 tabular-nums">
                    <Coins size={10} /> {a.price}
                  </span>
                )}
                {active && owned && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-1.5 -right-1.5 w-[22px] h-[22px] bg-coral rounded-full flex items-center justify-center shadow-[var(--shadow-btn)]"
                  >
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </Section>

      {/* Accessories */}
      <Section icon={<Wand2 size={15} />} label="Accessories">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4"
        >
          <motion.button
            variants={gridItem}
            whileTap={{ scale: 0.92, y: 1 }}
            whileHover={{ y: -2 }}
            onClick={() => {
              sfx("tap");
              dispatch(setAccessory(null));
            }}
            className={`flex flex-col items-center gap-2 py-4 md:py-5 rounded-2xl border-2 cursor-pointer glass-card shadow-[var(--shadow-soft)] ${
              !accessory ? "border-coral !bg-coral-light" : "border-transparent"
            }`}
          >
            <Ban size={24} className="text-ink-muted" />
            <span className="text-[11px] md:text-[13px] font-semibold text-ink">
              None
            </span>
          </motion.button>

          {accessories.map((ac) => {
            const owned = ownedAccessories.includes(ac.id);
            const active = accessory === ac.id;
            const locked = !owned && coins < ac.price;
            return (
              <motion.button
                key={ac.id}
                variants={gridItem}
                whileTap={{ scale: 0.92, y: 1 }}
                whileHover={!locked ? { y: -2 } : undefined}
                onClick={() => {
                  if (owned) {
                    sfx("tap");
                    // Toggle off if already active, otherwise equip
                    dispatch(setAccessory(active ? null : ac.id));
                  } else if (!locked) {
                    sfx("coinSpend");
                    dispatch(buyAccessory({ id: ac.id, price: ac.price }));
                    dispatch(
                      addToast({
                        message: `Unlocked ${ac.name}!`,
                        type: "purchase",
                      }),
                    );
                  }
                }}
                className={`relative flex flex-col items-center gap-2 py-4 md:py-5 rounded-2xl border-2 cursor-pointer glass-card shadow-[var(--shadow-soft)] ${
                  active ? "border-coral !bg-coral-light" : "border-transparent"
                } ${locked ? "opacity-30" : ""}`}
              >
                <span className="text-ink">
                  {accIcons[ac.icon] || <Glasses size={24} />}
                </span>
                <span className="text-[11px] md:text-[13px] font-semibold text-ink">
                  {ac.name}
                </span>
                {!owned && (
                  <span className="text-[10px] md:text-[12px] font-bold text-gold flex items-center gap-0.5 tabular-nums">
                    <Coins size={10} /> {ac.price}
                  </span>
                )}
                {active && owned && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -top-1.5 -right-1.5 w-[22px] h-[22px] bg-coral rounded-full flex items-center justify-center shadow-[var(--shadow-btn)]"
                  >
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </Section>
    </div>
  );
}

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 md:mb-4">
        <span className="text-coral">{icon}</span>
        <h2 className="text-[12px] md:text-[14px] font-bold text-ink uppercase tracking-[0.08em]">
          {label}
        </h2>
      </div>
      {children}
    </div>
  );
}
