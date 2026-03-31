import { useState } from 'react'
import { useSound } from '../hooks/useSound'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gamepad2, ArrowLeft, Coins, Clock, Zap, Star,
  LayoutGrid, Eye, Brain, Hash, ScanEye, Lock,
} from 'lucide-react'
import CoinBadge from '../components/CoinBadge'
import EnergyBadge from '../components/EnergyBadge'
import EnergyControl from '../components/EnergyControl'
import MemoryMatch from '../components/games/MemoryMatch'
import ColorVision from '../components/games/ColorVision'
import ReactionTime from '../components/games/ReactionTime'
import PatternRecall from '../components/games/PatternRecall'
import NumberSequence from '../components/games/NumberSequence'
import ContrastTest from '../components/games/ContrastTest'
import { games, categories } from '../data/games'
import type { GameId, GameCategory } from '../data/games'

const iconMap: Record<string, React.ReactNode> = {
  grid: <LayoutGrid size={24} />,
  eye: <Eye size={24} />,
  zap: <Zap size={24} />,
  brain: <Brain size={24} />,
  hash: <Hash size={24} />,
  'scan-eye': <ScanEye size={24} />,
}

const gameComponents: Record<GameId, React.ComponentType<{ onComplete: (score: number) => void }>> = {
  'memory-match': MemoryMatch,
  'color-vision': ColorVision,
  'reaction-time': ReactionTime,
  'pattern-recall': PatternRecall,
  'number-sequence': NumberSequence,
  'contrast-test': ContrastTest,
}

interface Props {
  coins: number
  onEarnCoins: (amount: number) => void
  showToast: (msg: string, type?: 'success' | 'purchase') => void
  energy: number
  maxEnergy: number
  onSpendEnergy: () => void
  onStartEyeCheck: () => void
  onAddEnergy: () => void
  onResetEnergy: () => void
}

const gridItem = {
  hidden: { opacity: 0, y: 14, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

export default function Games({ coins, onEarnCoins, showToast, energy, maxEnergy, onSpendEnergy, onStartEyeCheck, onAddEnergy, onResetEnergy }: Props) {
  const sfx = useSound()
  const noEnergy = energy === 0
  const [activeGame, setActiveGame] = useState<GameId | null>(null)
  const [filter, setFilter] = useState<GameCategory | 'all'>('all')

  const filtered = filter === 'all' ? games : games.filter(g => g.category === filter)
  const activeGameDef = games.find(g => g.id === activeGame)

  function handleComplete(score: number) {
    if (!activeGameDef) return
    const earned = Math.round((score / 100) * activeGameDef.coinReward)
    if (earned > 0) {
      onEarnCoins(earned)
      showToast(`Earned ${earned} coins from ${activeGameDef.name}!`, 'success')
    }
  }

  // Game play view
  if (activeGame && activeGameDef) {
    const GameComponent = gameComponents[activeGame]
    return (
      <div className="flex flex-col px-5 md:px-8 lg:px-10 pt-7 md:pt-10 pb-2 gap-5 md:gap-7">
        {/* Game header */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => { sfx('tap'); setActiveGame(null) }}
            className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-muted flex items-center justify-center border-none cursor-pointer"
          >
            <ArrowLeft size={18} className="text-ink" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-[18px] md:text-[22px] font-bold text-ink tracking-tight">{activeGameDef.name}</h1>
            <p className="text-[11px] md:text-[13px] text-ink-muted">{activeGameDef.description}</p>
          </div>
          <CoinBadge amount={coins} small />
        </div>

        {/* Reward info */}
        <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-gold-light/50">
          <span className="text-[12px] md:text-[13px] font-semibold text-ink-secondary flex items-center gap-1.5">
            <Coins size={14} className="text-gold" /> Up to {activeGameDef.coinReward} coins
          </span>
          <span className="text-[12px] md:text-[13px] font-semibold text-ink-secondary flex items-center gap-1.5">
            <Star size={14} className="text-violet" /> {activeGameDef.xpReward} XP
          </span>
          <span className="text-[12px] md:text-[13px] font-semibold text-ink-secondary flex items-center gap-1.5">
            <Clock size={14} className="text-coral" /> {activeGameDef.time}
          </span>
        </div>

        {/* Game component */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <GameComponent onComplete={handleComplete} />
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // Game listing view
  return (
    <div className="flex flex-col px-5 md:px-8 lg:px-10 pt-7 md:pt-10 pb-2 gap-5 md:gap-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-coral-light flex items-center justify-center">
            <Gamepad2 size={20} className="text-coral" />
          </div>
          <div>
            <h1 className="text-[22px] md:text-[28px] font-bold text-ink tracking-tight">Games</h1>
            <p className="text-[11px] md:text-[13px] text-ink-muted">Train your brain & eyes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EnergyBadge energy={energy} maxEnergy={maxEnergy} />
          <CoinBadge amount={coins} small />
        </div>
      </div>

      {/* No energy banner */}
      {noEnergy && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center gap-3 shadow-[var(--shadow-card)]"
          style={{ background: 'linear-gradient(135deg, var(--color-coral-light), var(--color-teal-light))' }}
        >
          <Eye size={20} className="text-coral flex-shrink-0" />
          <p className="text-[13px] font-semibold text-ink flex-1">Out of Energy — complete an eye check to play!</p>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => { sfx('tap'); onStartEyeCheck() }}
            className="px-3 py-1.5 rounded-xl bg-coral text-white text-[12px] font-bold border-none cursor-pointer shadow-[var(--shadow-btn)] flex-shrink-0"
          >
            Start Eye Check
          </motion.button>
        </motion.div>
      )}

      {/* Energy Control (demo) */}
      <EnergyControl
        energy={energy}
        maxEnergy={maxEnergy}
        onAdd={onAddEnergy}
        onSpend={onSpendEnergy}
        onReset={onResetEnergy}
        onStartEyeCheck={onStartEyeCheck}
      />

      {/* Category filter */}
      <div className="flex gap-2 glass-card rounded-2xl p-1.5 md:p-2 shadow-[var(--shadow-soft)]">
        {categories.map(c => {
          const on = filter === c.id
          return (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => { sfx('filter'); setFilter(c.id) }}
              className={`flex-1 py-2.5 md:py-3 rounded-xl text-[11px] md:text-[13px] font-semibold border-none cursor-pointer relative z-10 ${
                on ? 'text-white' : 'bg-transparent text-ink-muted'
              }`}
            >
              {on && (
                <motion.div
                  layoutId="game-filter"
                  className="absolute inset-0 bg-coral rounded-xl shadow-[var(--shadow-btn)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{c.label}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Games grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
      >
        {filtered.map(game => (
          <motion.button
            key={game.id}
            variants={gridItem}
            whileTap={noEnergy ? undefined : { scale: 0.97, y: 1 }}
            whileHover={noEnergy ? undefined : { y: -3, boxShadow: 'var(--shadow-elevated)' }}
            onClick={() => {
              if (noEnergy) return
              sfx('gameStart')
              onSpendEnergy()
              setActiveGame(game.id)
            }}
            className={`flex items-start gap-4 p-4 md:p-5 rounded-2xl border-none text-left shadow-[var(--shadow-soft)] relative overflow-hidden border border-border/30 ${noEnergy ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            style={{ background: `color-mix(in srgb, ${game.bg} 60%, var(--color-card))` }}
          >
            {noEnergy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-2xl gap-1.5"
                style={{ background: 'color-mix(in srgb, var(--color-bg) 70%, transparent)', backdropFilter: 'blur(3px)' }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-rose) 15%, transparent)' }}>
                  <Lock size={16} className="text-rose" />
                </div>
                <span className="text-[11px] font-bold text-ink-secondary">Low Energy</span>
              </div>
            )}
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'color-mix(in srgb, var(--color-card) 50%, transparent)', color: game.fg }}
            >
              {iconMap[game.icon] || <Star size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] md:text-[17px] font-bold text-ink">{game.name}</p>
              <p className="text-[11px] md:text-[12px] text-ink-secondary mt-0.5 line-clamp-2">{game.description}</p>
              <div className="flex items-center gap-3 mt-2.5">
                <span className="flex items-center gap-1 text-[10px] md:text-[11px] font-semibold text-ink-muted">
                  <Clock size={11} /> {game.time}
                </span>
                <span className="flex items-center gap-1 text-[10px] md:text-[11px] font-bold text-gold">
                  <Coins size={11} /> {game.coinReward}
                </span>
                <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  game.difficulty === 'Easy' ? 'bg-green-light text-green' :
                  game.difficulty === 'Medium' ? 'bg-gold-light text-gold' :
                  'bg-rose-light text-rose'
                }`}>
                  {game.difficulty}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Health tip */}
      <div className="glass-card rounded-2xl p-4 md:p-5 flex items-start gap-3.5 shadow-[var(--shadow-soft)]">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-teal-light flex items-center justify-center flex-shrink-0">
          <Brain size={20} className="text-teal" />
        </div>
        <div>
          <p className="text-[13px] md:text-[15px] font-bold text-ink">Daily Brain Training</p>
          <p className="text-[11px] md:text-[13px] text-ink-muted mt-0.5">
            Playing cognitive games for 15 minutes daily can help improve memory, attention, and processing speed.
          </p>
        </div>
      </div>
    </div>
  )
}
