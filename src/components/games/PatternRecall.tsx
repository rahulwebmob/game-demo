import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Star, Brain } from 'lucide-react'

const GRID = 9
const COLS = 3

interface Props {
  onComplete: (score: number) => void
}

export default function PatternRecall({ onComplete }: Props) {
  const [level, setLevel] = useState(1)
  const [pattern, setPattern] = useState<number[]>([])
  const [userPattern, setUserPattern] = useState<number[]>([])
  const [phase, setPhase] = useState<'showing' | 'input' | 'correct' | 'wrong' | 'done'>('showing')
  const [highlighted, setHighlighted] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimeouts = () => {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
  }

  const generatePattern = useCallback((len: number) => {
    const p: number[] = []
    while (p.length < len) {
      const n = Math.floor(Math.random() * GRID)
      if (p[p.length - 1] !== n) p.push(n)
    }
    return p
  }, [])

  const showPattern = useCallback((pat: number[]) => {
    setPhase('showing')
    clearTimeouts()
    pat.forEach((cell, i) => {
      const t1 = setTimeout(() => setHighlighted(cell), i * 600 + 300)
      const t2 = setTimeout(() => setHighlighted(null), i * 600 + 600)
      timeouts.current.push(t1, t2)
    })
    const t3 = setTimeout(() => {
      setPhase('input')
      setHighlighted(null)
    }, pat.length * 600 + 400)
    timeouts.current.push(t3)
  }, [])

  useEffect(() => {
    startRound(1)
    return clearTimeouts
  }, [])

  function startRound(lvl: number) {
    const len = lvl + 2 // starts at 3 cells
    const pat = generatePattern(len)
    setLevel(lvl)
    setPattern(pat)
    setUserPattern([])
    showPattern(pat)
  }

  function handleTap(cell: number) {
    if (phase !== 'input') return

    const next = [...userPattern, cell]
    setUserPattern(next)

    // Flash the tapped cell
    setHighlighted(cell)
    setTimeout(() => setHighlighted(null), 150)

    const idx = next.length - 1
    if (next[idx] !== pattern[idx]) {
      // Wrong!
      const newLives = lives - 1
      setLives(newLives)
      if (newLives <= 0) {
        setPhase('done')
        onComplete(score)
      } else {
        setPhase('wrong')
        setTimeout(() => startRound(level), 1000)
      }
      return
    }

    if (next.length === pattern.length) {
      // Correct!
      const pts = level * 15
      setScore(s => s + pts)
      setPhase('correct')
      if (level >= 8) {
        setTimeout(() => {
          setPhase('done')
          onComplete(score + pts)
        }, 800)
      } else {
        setTimeout(() => startRound(level + 1), 1000)
      }
    }
  }

  function reset() {
    setScore(0)
    setLives(3)
    setPhase('showing')
    clearTimeouts()
    startRound(1)
  }

  if (phase === 'done') {
    const stars = score >= 100 ? 3 : score >= 50 ? 2 : 1
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-5 py-10"
      >
        <div className="w-20 h-20 rounded-3xl bg-teal-light flex items-center justify-center">
          <Brain size={36} className="text-teal" />
        </div>
        <h3 className="text-[22px] font-bold text-ink">Pattern Master</h3>
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <Star key={i} size={28} className={i <= stars ? 'text-gold' : 'text-muted'} fill={i <= stars ? 'var(--color-gold)' : 'none'} />
          ))}
        </div>
        <p className="text-[36px] font-extrabold text-gradient-coral">{score}</p>
        <p className="text-[13px] text-ink-muted">Reached level {level}</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal text-white font-semibold text-[14px] border-none cursor-pointer"
          style={{ boxShadow: 'var(--shadow-btn)' }}
        >
          <RotateCcw size={16} /> Play Again
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-ink-secondary">Level {level}</span>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold text-ink tabular-nums">Score: {score}</span>
          <span className="text-[13px] font-semibold text-coral">
            {'❤️'.repeat(lives)}
          </span>
        </div>
      </div>

      {phase === 'showing' && (
        <p className="text-center text-[14px] font-medium text-ink-secondary">Watch the pattern...</p>
      )}
      {phase === 'input' && (
        <p className="text-center text-[14px] font-medium text-ink-secondary">
          Repeat it! ({userPattern.length}/{pattern.length})
        </p>
      )}
      {phase === 'correct' && (
        <motion.p initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center text-[14px] font-bold text-green">
          Correct! +{level * 15} pts
        </motion.p>
      )}
      {phase === 'wrong' && (
        <motion.p initial={{ x: -8 }} animate={{ x: [8, -8, 0] }} className="text-center text-[14px] font-bold text-rose">
          Wrong! Try again...
        </motion.p>
      )}

      <div
        className="grid gap-3 md:gap-4 mx-auto w-full"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, maxWidth: 280 }}
      >
        {Array.from({ length: GRID }).map((_, i) => (
          <motion.button
            key={i}
            whileTap={phase === 'input' ? { scale: 0.88 } : undefined}
            onClick={() => handleTap(i)}
            animate={{
              scale: highlighted === i ? 1.08 : 1,
              backgroundColor: highlighted === i ? 'var(--color-teal)' : 'var(--color-muted)',
            }}
            transition={{ duration: 0.15 }}
            className="aspect-square rounded-2xl border-none cursor-pointer shadow-[var(--shadow-soft)]"
          />
        ))}
      </div>
    </div>
  )
}
