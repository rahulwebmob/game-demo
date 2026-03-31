import { useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Games from './pages/Games'
import Customize from './pages/Customize'
import Leaderboard from './pages/Leaderboard'
import DailyLogin from './pages/DailyLogin'
import ToastContainer from './components/Toast'
import type { ToastData } from './components/Toast'
import Skeleton from './components/Skeleton'
import type { Tab } from './components/NavBar'
import type { AvatarId } from './data/avatars'
import { dailyRewards, accessories, avatars } from './data/avatars'
import { useLocalStorage } from './hooks/useLocalStorage'

const TAB_ORDER: Tab[] = ['home', 'games', 'customize', 'leaderboard', 'daily']

function getDirection(from: Tab, to: Tab) {
  return TAB_ORDER.indexOf(to) > TAB_ORDER.indexOf(from) ? 1 : -1
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [direction, setDirection] = useState(0)
  const [loading, setLoading] = useState(false)

  // Persisted state
  const [coins, setCoins] = useLocalStorage('gamerify-coins', 250)
  const [score] = useLocalStorage('gamerify-score', 4820)
  const [streak, setStreak] = useLocalStorage('gamerify-streak', 3)
  const [claimedToday, setClaimedToday] = useLocalStorage('gamerify-claimed', false)
  const [selectedAvatar, setSelectedAvatar] = useLocalStorage<AvatarId>('gamerify-avatar', 'dog')
  const [selectedAccessory, setSelectedAccessory] = useLocalStorage<string | null>('gamerify-accessory', null)
  const [ownedAvatars, setOwnedAvatars] = useLocalStorage<AvatarId[]>('gamerify-owned-avatars', ['dog'])
  const [ownedAccessories, setOwnedAccessories] = useLocalStorage<string[]>('gamerify-owned-accessories', [])

  // Toast state
  const [toasts, setToasts] = useState<ToastData[]>([])
  const toastId = useRef(0)

  const showToast = useCallback((message: string, type: 'success' | 'purchase' = 'success') => {
    const id = ++toastId.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Navigate with direction + skeleton
  const navigate = useCallback((to: Tab) => {
    if (to === tab) return
    setDirection(getDirection(tab, to))
    setLoading(true)
    setTab(to)
    setTimeout(() => setLoading(false), 180)
  }, [tab])

  const earnCoins = useCallback((amount: number) => {
    setCoins(c => c + amount)
  }, [setCoins])

  const buy = useCallback((type: 'avatar' | 'accessory', id: string, price: number) => {
    if (coins < price) return
    setCoins(c => c - price)
    if (type === 'avatar') {
      setOwnedAvatars(o => [...o, id as AvatarId])
      setSelectedAvatar(id as AvatarId)
      const name = avatars.find(a => a.id === id)?.name || id
      showToast(`Unlocked ${name}!`, 'purchase')
    } else {
      setOwnedAccessories(o => [...o, id])
      setSelectedAccessory(id)
      const name = accessories.find(a => a.id === id)?.name || id
      showToast(`Bought ${name}!`, 'purchase')
    }
  }, [coins, setCoins, setOwnedAvatars, setSelectedAvatar, setOwnedAccessories, setSelectedAccessory, showToast])

  const claimDaily = useCallback(() => {
    if (claimedToday) return
    const todayIndex = streak % 7
    const reward = dailyRewards[todayIndex].coins
    setCoins(c => c + reward)
    setStreak(s => s + 1)
    setClaimedToday(true)
    showToast(`Claimed ${reward} coins! Day ${todayIndex + 1}`, 'success')
  }, [claimedToday, streak, setCoins, setStreak, setClaimedToday, showToast])

  const pageVariants = {
    enter: (d: number) => ({ opacity: 0, x: d * 60, scale: 0.98 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d: number) => ({ opacity: 0, x: d * -40, scale: 0.98 }),
  }

  return (
    <div className="min-h-dvh bg-bg max-w-[430px] md:max-w-[768px] lg:max-w-[960px] mx-auto relative overflow-hidden">
      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Ambient background blobs */}
      <motion.div
        className="fixed w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(232,106,80,0.08), transparent 70%)', top: '-8%', right: '-12%' }}
        animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed w-[220px] h-[220px] md:w-[320px] md:h-[320px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.06), transparent 70%)', bottom: '10%', left: '-10%' }}
        animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed w-[180px] h-[180px] md:w-[260px] md:h-[260px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,108,193,0.05), transparent 70%)', top: '40%', right: '-5%' }}
        animate={{ x: [0, 12, 0], y: [0, 18, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 pb-24 md:pb-28 min-h-dvh">
        <AnimatePresence mode="wait" custom={direction}>
          {loading ? (
            <Skeleton key="skeleton" variant={tab === 'games' ? 'home' : tab as 'home' | 'customize' | 'leaderboard' | 'daily'} />
          ) : (
            <motion.div
              key={tab}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {tab === 'home' && (
                <Home coins={coins} score={score} streak={streak} avatar={selectedAvatar} name="Gamer" navigate={navigate} />
              )}
              {tab === 'games' && (
                <Games coins={coins} onEarnCoins={earnCoins} showToast={showToast} />
              )}
              {tab === 'customize' && (
                <Customize
                  coins={coins} avatar={selectedAvatar} accessory={selectedAccessory}
                  ownedAvatars={ownedAvatars} ownedAccessories={ownedAccessories}
                  onSelectAvatar={setSelectedAvatar} onSelectAccessory={setSelectedAccessory}
                  onBuy={buy}
                />
              )}
              {tab === 'leaderboard' && <Leaderboard />}
              {tab === 'daily' && (
                <DailyLogin coins={coins} streak={streak} claimed={claimedToday} onClaim={claimDaily} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <NavBar active={tab} onChange={navigate} dot={!claimedToday} />
    </div>
  )
}
