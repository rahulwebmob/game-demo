import { motion } from 'framer-motion'

const COLORS = ['#E86A50', '#F5A623', '#2AB89E', '#8B6CC1', '#4DA3E8', '#E86A76']
const COUNT = 32

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export default function Confetti({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: COUNT }).map((_, i) => {
        const color = COLORS[i % COLORS.length]
        const x = rand(-120, 120)
        const y = rand(-200, -60)
        const r = rand(-360, 360)
        const size = rand(5, 10)
        const delay = rand(0, 0.3)
        const shape = i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0'
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
            animate={{ x, y, rotate: r, scale: 0, opacity: 0 }}
            transition={{ duration: rand(0.8, 1.4), delay, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '50%',
              width: size,
              height: size,
              borderRadius: shape,
              background: color,
            }}
          />
        )
      })}
    </div>
  )
}
