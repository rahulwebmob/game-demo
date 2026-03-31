import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Trophy, Clock, Star } from 'lucide-react'

const EMOJIS = ['🧠', '👁️', '❤️', '⚡', '🎯', '🌟', '🔬', '💊']

interface Props {
  onComplete: (score: number) => void
}

interface Card {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

function shuffle(): Card[] {
  return [...EMOJIS, ...EMOJIS]
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }))
}

export default function MemoryMatch({ onComplete }: Props) {
  const [cards, setCards] = useState<Card[]>(shuffle)
  const [selected, setSelected] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [timer, setTimer] = useState(0)
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)
  const interval = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    return () => clearInterval(interval.current)
  }, [])

  useEffect(() => {
    if (started && !done) {
      interval.current = setInterval(() => setTimer(t => t + 1), 1000)
      return () => clearInterval(interval.current)
    }
  }, [started, done])

  useEffect(() => {
    if (matches === 8 && matches > 0) {
      setDone(true)
      clearInterval(interval.current)
      const score = Math.max(100 - moves * 2 - timer, 10)
      setTimeout(() => onComplete(score), 600)
    }
  }, [matches, moves, timer, onComplete])

  function reset() {
    setCards(shuffle())
    setSelected([])
    setMoves(0)
    setMatches(0)
    setTimer(0)
    setDone(false)
    setStarted(false)
  }

  function flip(id: number) {
    if (selected.length >= 2) return
    const card = cards[id]
    if (card.flipped || card.matched) return

    if (!started) setStarted(true)

    const next = cards.map(c => c.id === id ? { ...c, flipped: true } : c)
    setCards(next)
    const sel = [...selected, id]
    setSelected(sel)

    if (sel.length === 2) {
      setMoves(m => m + 1)
      const [a, b] = sel
      if (next[a].emoji === next[b].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === a || c.id === b ? { ...c, matched: true } : c
          ))
          setMatches(m => m + 1)
          setSelected([])
        }, 400)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === a || c.id === b ? { ...c, flipped: false } : c
          ))
          setSelected([])
        }, 700)
      }
    }
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  if (done) {
    const score = Math.max(100 - moves * 2 - timer, 10)
    const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-5 py-10"
      >
        <div className="w-20 h-20 rounded-3xl bg-gold-light flex items-center justify-center">
          <Trophy size={36} className="text-gold" />
        </div>
        <h3 className="text-[22px] font-bold text-ink">Complete!</h3>
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <Star key={i} size={28} className={i <= stars ? 'text-gold' : 'text-muted'} fill={i <= stars ? 'var(--color-gold)' : 'none'} />
          ))}
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-[20px] font-bold text-ink">{moves}</p>
            <p className="text-[11px] text-ink-muted font-medium">Moves</p>
          </div>
          <div>
            <p className="text-[20px] font-bold text-ink">{fmt(timer)}</p>
            <p className="text-[11px] text-ink-muted font-medium">Time</p>
          </div>
          <div>
            <p className="text-[20px] font-bold text-gradient-coral">{score}</p>
            <p className="text-[11px] text-ink-muted font-medium">Score</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-coral text-white font-semibold text-[14px] border-none cursor-pointer shadow-[var(--shadow-btn)]"
        >
          <RotateCcw size={16} /> Play Again
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-ink-secondary flex items-center gap-1.5">
          <Clock size={14} className="text-coral" /> {fmt(timer)}
        </span>
        <span className="text-[13px] font-semibold text-ink-secondary">
          {matches}/8 pairs · {moves} moves
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2.5 md:gap-3">
        {cards.map(card => (
          <motion.button
            key={card.id}
            whileTap={!card.flipped && !card.matched ? { scale: 0.9 } : undefined}
            onClick={() => flip(card.id)}
            className="aspect-square rounded-2xl border-none cursor-pointer relative"
            style={{ perspective: 600 }}
          >
            <motion.div
              animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full h-full relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Back of card */}
              <div
                className="absolute inset-0 rounded-2xl bg-coral flex items-center justify-center shadow-[var(--shadow-soft)]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="text-white text-[18px] font-bold">?</span>
              </div>
              {/* Front of card */}
              <div
                className={`absolute inset-0 rounded-2xl flex items-center justify-center shadow-[var(--shadow-soft)] ${card.matched ? 'bg-green-light' : 'bg-card'}`}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <span className="text-[28px] md:text-[32px]">{card.emoji}</span>
              </div>
            </motion.div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
