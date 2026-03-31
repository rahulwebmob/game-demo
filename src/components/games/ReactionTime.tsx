import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Star, Zap } from 'lucide-react'

type Phase = 'idle' | 'waiting' | 'ready' | 'result' | 'done'
const TOTAL_ROUNDS = 5

interface Props {
  onComplete: (score: number) => void
}

export default function ReactionTime({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [times, setTimes] = useState<number[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [tooEarly, setTooEarly] = useState(false)
  const readyAt = useRef(0)
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const start = useCallback(() => {
    setTooEarly(false)
    setPhase('waiting')
    const delay = 1500 + Math.random() * 3000
    timeout.current = setTimeout(() => {
      readyAt.current = performance.now()
      setPhase('ready')
    }, delay)
  }, [])

  const handleTap = useCallback(() => {
    if (phase === 'idle') {
      start()
      return
    }
    if (phase === 'waiting') {
      clearTimeout(timeout.current)
      setTooEarly(true)
      setPhase('idle')
      return
    }
    if (phase === 'ready') {
      const ms = Math.round(performance.now() - readyAt.current)
      setCurrentTime(ms)
      const newTimes = [...times, ms]
      setTimes(newTimes)
      if (newTimes.length >= TOTAL_ROUNDS) {
        setPhase('done')
        const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length)
        const score = Math.max(100 - Math.floor(avg / 5), 10)
        onComplete(score)
      } else {
        setPhase('result')
      }
    }
    if (phase === 'result') {
      start()
    }
  }, [phase, times, start, onComplete])

  function reset() {
    setPhase('idle')
    setTimes([])
    setCurrentTime(0)
    setTooEarly(false)
    clearTimeout(timeout.current)
  }

  const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0

  if (phase === 'done') {
    const stars = avg < 250 ? 3 : avg < 350 ? 2 : 1
    const rating = avg < 200 ? 'Lightning Fast!' : avg < 300 ? 'Great Reflexes!' : avg < 400 ? 'Good Speed' : 'Keep Practicing'
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-5 py-10"
      >
        <div className="w-20 h-20 rounded-3xl bg-gold-light flex items-center justify-center">
          <Zap size={36} className="text-gold" />
        </div>
        <h3 className="text-[22px] font-bold text-ink">{rating}</h3>
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <Star key={i} size={28} className={i <= stars ? 'text-gold' : 'text-muted'} fill={i <= stars ? '#F5A623' : 'none'} />
          ))}
        </div>
        <p className="text-[42px] font-extrabold text-gradient-coral leading-none">{avg}ms</p>
        <p className="text-[13px] text-ink-muted">average reaction time</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {times.map((t, i) => (
            <span key={i} className="px-3 py-1.5 rounded-xl bg-muted text-[12px] font-semibold text-ink tabular-nums">
              R{i + 1}: {t}ms
            </span>
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gold text-white font-semibold text-[14px] border-none cursor-pointer"
          style={{ boxShadow: '0 4px 16px rgba(245,166,35,0.3)' }}
        >
          <RotateCcw size={16} /> Try Again
        </motion.button>
      </motion.div>
    )
  }

  const bgColor = phase === 'waiting' ? '#E86A50' : phase === 'ready' ? '#4CB870' : 'var(--color-muted)'
  const textColor = phase === 'waiting' || phase === 'ready' ? '#fff' : 'var(--color-ink)'

  return (
    <div className="flex flex-col gap-4">
      {/* Round indicator */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-ink-secondary">
          Round {times.length + 1}/{TOTAL_ROUNDS}
        </span>
        {times.length > 0 && (
          <span className="text-[13px] font-semibold text-ink-secondary tabular-nums">
            Avg: {avg}ms
          </span>
        )}
      </div>

      {/* Main tap area */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleTap}
        animate={{ backgroundColor: bgColor }}
        transition={{ duration: 0.15 }}
        className="w-full aspect-[4/3] md:aspect-[16/9] rounded-3xl border-none cursor-pointer flex flex-col items-center justify-center gap-3 shadow-[var(--shadow-elevated)]"
        style={{ color: textColor }}
      >
        {phase === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
            <Zap size={40} className="text-coral" />
            <p className="text-[18px] font-bold">Tap to Start</p>
            <p className="text-[13px] text-ink-muted">Get ready to react!</p>
          </motion.div>
        )}
        {phase === 'waiting' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
            <p className="text-[22px] font-bold">Wait...</p>
            <p className="text-[13px] opacity-80">Tap when it turns green</p>
          </motion.div>
        )}
        {phase === 'ready' && (
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="flex flex-col items-center gap-2"
          >
            <p className="text-[28px] font-extrabold">TAP NOW!</p>
          </motion.div>
        )}
        {phase === 'result' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-2">
            <p className="text-[36px] font-extrabold text-gradient-coral">{currentTime}ms</p>
            <p className="text-[14px] font-medium text-ink-secondary">Tap to continue</p>
          </motion.div>
        )}
      </motion.button>

      {tooEarly && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-[13px] font-semibold text-rose"
        >
          Too early! Wait for green.
        </motion.p>
      )}
    </div>
  )
}
