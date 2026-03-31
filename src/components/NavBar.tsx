import { motion } from 'framer-motion'
import { Home, Paintbrush, Trophy, Gift, Gamepad2 } from 'lucide-react'

export type Tab = 'home' | 'games' | 'customize' | 'leaderboard' | 'daily'

const tabs: { id: Tab; icon: typeof Home; label: string }[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'games', icon: Gamepad2, label: 'Games' },
  { id: 'customize', icon: Paintbrush, label: 'Avatar' },
  { id: 'leaderboard', icon: Trophy, label: 'Ranks' },
  { id: 'daily', icon: Gift, label: 'Daily' },
]

interface Props {
  active: Tab
  onChange: (t: Tab) => void
  dot?: boolean
}

export default function NavBar({ active, onChange, dot }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 safe-bottom z-50">
      <div className="nav-glass max-w-[430px] md:max-w-[768px] lg:max-w-[960px] mx-auto flex justify-around items-end px-3 md:px-6 pt-2 pb-3 md:pb-4">
        {tabs.map(t => {
          const on = active === t.id
          const showDot = t.id === 'daily' && dot && !on
          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.85, y: 1 }}
              whileHover={{ y: -1 }}
              onClick={() => onChange(t.id)}
              className="flex flex-col items-center gap-[3px] md:gap-1 bg-transparent border-none cursor-pointer relative px-2 md:px-4"
            >
              {on ? (
                <motion.div
                  layoutId="tab-active"
                  className="w-[42px] h-[42px] md:w-[48px] md:h-[48px] rounded-[14px] bg-coral flex items-center justify-center"
                  style={{ boxShadow: '0 4px 14px rgba(232,106,80,0.28)' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                >
                  <t.icon size={19} color="#fff" strokeWidth={2.2} />
                </motion.div>
              ) : (
                <div className="w-[42px] h-[42px] md:w-[48px] md:h-[48px] flex items-center justify-center relative">
                  <t.icon size={21} className="text-ink-muted" strokeWidth={1.7} />
                  {showDot && (
                    <span className="absolute top-1 right-1 w-[8px] h-[8px] bg-coral rounded-full border-[2px] border-card" />
                  )}
                </div>
              )}
              <span className={`text-[9px] md:text-[11px] leading-none ${on ? 'text-coral font-semibold' : 'text-ink-muted font-medium'}`}>
                {t.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
