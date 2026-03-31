import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import GameResult from './GameResult'
import { useSound } from '../../hooks/useSound'

type Phase = 'idle' | 'waiting' | 'ready' | 'result' | 'done'
const TOTAL_ROUNDS = 5

interface Props {
  onComplete: (score: number) => void
}

export default function ReactionTime({ onComplete }: Props) {
  const sfx = useSound()
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
      sfx('tap')
      start()
      return
    }
    if (phase === 'waiting') {
      clearTimeout(timeout.current)
      sfx('error')
      setTooEarly(true)
      setPhase('idle')
      return
    }
    if (phase === 'ready') {
      sfx('success')
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
      sfx('tap')
      start()
    }
  }, [phase, times, start, onComplete, sfx])

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
      <GameResult
        icon={<Zap size={36} className="text-gold" />}
        iconBg="bg-gold-light"
        title={rating}
        stars={stars}
        score={`${avg}ms`}
        subtitle="average reaction time"
        accentColor="bg-gold"
        onReset={reset}
      >
        <div className="flex gap-2 flex-wrap justify-center">
          {times.map((t, i) => (
            <span key={i} className="px-3 py-1.5 rounded-xl bg-muted text-[12px] font-semibold text-ink tabular-nums">
              R{i + 1}: {t}ms
            </span>
          ))}
        </div>
      </GameResult>
    )
  }

  const bgColor = phase === 'waiting' ? 'var(--color-coral)' : phase === 'ready' ? 'var(--color-green)' : 'var(--color-muted)'
  const textColor = phase === 'waiting' || phase === 'ready' ? 'white' : 'var(--color-ink)'

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
