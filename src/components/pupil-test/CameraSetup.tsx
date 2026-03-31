import { motion } from "framer-motion";
import { Camera, User, Eye, MonitorSmartphone } from "lucide-react";
import { useSound } from "../../hooks/useSound";

const checks = [
  {
    icon: User,
    text: "Your face is centered and clearly visible on the screen",
  },
  {
    icon: Eye,
    text: "You are looking directly at the camera and remain still",
  },
  {
    icon: MonitorSmartphone,
    text: "The phone is positioned at eye level with the camera facing you",
  },
  { icon: Camera, text: "For best results, use a device with a 4K camera." },
];

interface Props {
  shouldStartTest: boolean;
  setShouldStartTest: (v: boolean) => void;
}

const colors = [
  { bg: "var(--color-teal-light)", fg: "var(--color-teal)" },
  { bg: "var(--color-coral-light)", fg: "var(--color-coral)" },
  { bg: "var(--color-violet-light)", fg: "var(--color-violet)" },
  { bg: "var(--color-sky-light)", fg: "var(--color-sky)" },
];

export default function CameraSetup({
  shouldStartTest,
  setShouldStartTest,
}: Props) {
  const sfx = useSound();
  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 lg:p-8 shadow-[var(--shadow-card)]">
      <h3 className="text-[16px] md:text-[20px] font-bold text-ink mb-4 md:mb-5">
        Step 2: Camera Setup
      </h3>
      <ul className="flex flex-col gap-3 md:gap-4 list-none p-0 m-0 mb-5 md:mb-6">
        {checks.map((c, i) => (
          <li key={i} className="flex items-start gap-3 md:gap-4">
            <div
              className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-[14px] flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: colors[i % colors.length].bg }}
            >
              <c.icon
                size={16}
                className="md:!w-[18px] md:!h-[18px]"
                style={{ color: colors[i % colors.length].fg }}
              />
            </div>
            <span className="text-[13px] md:text-[15px] text-ink-secondary leading-relaxed">
              {c.text}
            </span>
          </li>
        ))}
      </ul>
      {!shouldStartTest && (
        <div className="text-center">
          <motion.button
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.04 }}
            onClick={() => {
              sfx("tap");
              setShouldStartTest(true);
            }}
            className="px-6 md:px-8 py-3 md:py-3.5 rounded-xl bg-coral text-white text-[14px] md:text-[15px] font-bold border-none cursor-pointer shadow-[var(--shadow-btn)]"
          >
            <Camera size={16} className="inline -mt-0.5 mr-1.5" />
            Enable Camera
          </motion.button>
        </div>
      )}
    </div>
  );
}
