import { motion } from 'framer-motion'
import { Camera, User, Eye, MonitorSmartphone } from 'lucide-react'

const checks = [
  { icon: User, text: 'Your face is centered and clearly visible on the screen' },
  { icon: Eye, text: 'You are looking directly at the camera and remain still' },
  { icon: MonitorSmartphone, text: 'The phone is positioned at eye level with the camera facing you' },
  { icon: Camera, text: 'For best results, use a device with a 4K camera.' },
]

interface Props {
  shouldStartTest: boolean
  setShouldStartTest: (v: boolean) => void
}

export default function CameraSetup({ shouldStartTest, setShouldStartTest }: Props) {
  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 shadow-[var(--shadow-card)]">
      <h3 className="text-[16px] md:text-[18px] font-bold text-ink mb-4">
        Step 2: Camera Setup
      </h3>
      <ul className="flex flex-col gap-3 list-none p-0 m-0 mb-5">
        {checks.map((c, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-light flex items-center justify-center flex-shrink-0 mt-0.5">
              <c.icon size={15} className="text-teal" />
            </div>
            <span className="text-[13px] md:text-[14px] text-ink-secondary leading-relaxed">{c.text}</span>
          </li>
        ))}
      </ul>
      {!shouldStartTest && (
        <div className="text-center">
          <motion.button
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.04 }}
            onClick={() => setShouldStartTest(true)}
            className="px-6 py-3 rounded-xl bg-coral text-white text-[14px] font-bold border-none cursor-pointer shadow-[var(--shadow-btn)]"
          >
            Enable Camera
          </motion.button>
        </div>
      )}
    </div>
  )
}
