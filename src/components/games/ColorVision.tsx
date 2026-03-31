import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Star, Eye } from 'lucide-react'

const ROUNDS = 10

function generateRound(level: number) {
  const hue = Math.floor(Math.random() * 360)
  const sat = 60 + Math.random() * 30
  const light = 45 + Math.random() * 20
  // Difference decreases as level increases
  const diff = Math.max(4, 25 - level * 2.2)
  const base = `hsl(${hue}, ${sat}%, ${light}%)`
  const odd = `hsl(${hue}, ${sat}%, ${light + diff}%)`

  const gridSize = level < 3 ? 9 : level < 6 ? 16 : 25
  const cols = Math.sqrt(gridSize)
  const oddIndex = Math.floor(Math.random() * gridSize)

  return { base, odd, gridSize, cols, oddIndex }
}

interface Props {
  onComplete: (score: number) => void
}

export default function ColorVision({ onComplete }: Props) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(generateRound(0))
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [done, setDone] = useState(false)

  const next = useCallback((correct: boolean) => {
    setFeedback(correct ? 'correct' : 'wrong')
    const newScore = correct ? score + (round + 1) * 10 : score
    setScore(newScore)

    setTimeout(() => {
      setFeedback(null)
      if (round + 1 >= ROUNDS) {
        setDone(true)
        onComplete(newScore)
      } else {
        setRound(r => r + 1)
        setLevel(generateRound(round + 1))
      }
    }, 500)
  }, [round, score, onComplete])

  function handleTap(idx: number) {
    if (feedback) return
    next(idx === level.oddIndex)
  }

  function reset() {
    setRound(0)
    setScore(0)
    setLevel(generateRound(0))
    setFeedback(null)
    setDone(false)
  }

  if (done) {
    const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-5 py-10"
      >
        <div className="w-20 h-20 rounded-3xl bg-violet-light flex items-center justify-center">
          <Eye size={36} className="text-violet" />
        </div>
        <h3 className="text-[22px] font-bold text-ink">Vision Score</h3>
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <Star key={i} size={28} className={i <= stars ? 'text-gold' : 'text-muted'} fill={i <= stars ? '#F5A623' : 'none'} />
          ))}
        </div>
        <p className="text-[36px] font-extrabold text-gradient-coral">{score}</p>
        <p className="text-[13px] text-ink-muted">out of {ROUNDS * (ROUNDS + 1) * 5}</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet text-white font-semibold text-[14px] border-none cursor-pointer"
          style={{ boxShadow: '0 4px 16px rgba(139,108,193,0.3)' }}
        >
          <RotateCcw size={16} /> Try Again
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-[6px] bg-muted rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${((round + 1) / ROUNDS) * 100}%` }}
            className="h-full bg-violet rounded-full"
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[13px] font-semibold text-ink-secondary">{round + 1}/{ROUNDS}</span>
      </div>

      <p className="text-center text-[14px] font-medium text-ink-secondary">
        Tap the square that's a different shade
      </p>

      {/* Feedback flash */}
      <motion.div
        animate={feedback === 'correct' ? { scale: [1, 1.02, 1] } : feedback === 'wrong' ? { x: [-4, 4, -4, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <div
          className="grid gap-2 md:gap-2.5 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${level.cols}, 1fr)`,
            maxWidth: level.cols <= 3 ? 240 : level.cols <= 4 ? 300 : 340,
          }}
        >
          {Array.from({ length: level.gridSize }).map((_, i) => (
            <motion.button
              key={`${round}-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.02, type: 'spring', stiffness: 400, damping: 20 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => handleTap(i)}
              className="aspect-square rounded-xl md:rounded-2xl border-none cursor-pointer"
              style={{
                background: i === level.oddIndex ? level.odd : level.base,
                boxShadow: feedback === 'correct' && i === level.oddIndex
                  ? '0 0 0 3px #4CB870'
                  : feedback === 'wrong' && i === level.oddIndex
                    ? '0 0 0 3px #E86A50'
                    : 'none',
              }}
            />
          ))}
        </div>
      </motion.div>

      <div className="text-center">
        <span className="text-[13px] font-bold text-ink tabular-nums">Score: {score}</span>
      </div>
    </div>
  )
}
