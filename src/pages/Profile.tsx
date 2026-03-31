import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSound } from '../hooks/useSound'
import {
  User, Sun, Moon, Volume2, VolumeX, Bell, BellOff,
  Coins, Zap, Flame, Trophy, Gamepad2, Eye, Brain,
  Clock, Target, Award, ChevronRight, Palette, Info,
  BarChart3, Calendar, LogOut,
  Mail, KeyRound, Pencil, X, ShieldCheck,
} from 'lucide-react'
import AvatarImg from '../components/AvatarImg'
import CoinBadge from '../components/CoinBadge'
import AnimatedNumber from '../components/AnimatedNumber'
import type { AvatarId } from '../data/avatars'
import { avatars, playerStats } from '../data/avatars'
import type { Tab } from '../components/NavBar'
import type { ThemeId } from '../hooks/useTheme'
import { themeLabels } from '../hooks/useTheme'

interface Props {
  coins: number
  score: number
  streak: number
  avatar: AvatarId
  name: string
  email: string
  navigate: (t: Tab) => void
  themeId: ThemeId
  onThemeChange: (id: ThemeId) => void
  soundEnabled: boolean
  onSoundToggle: () => void
  notificationsEnabled: boolean
  onNotificationsToggle: () => void
  twoFactorEnabled: boolean
  onTwoFactorToggle: () => void
  onNameChange: (name: string) => void
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  showToast: (msg: string, type?: 'success' | 'purchase') => void
}

const fade = {
  initial: { y: 18, opacity: 0 },
  animate: { y: 0, opacity: 1 },
}

const gameStats = [
  { label: 'Games Played', value: 47, icon: Gamepad2, bg: 'var(--color-coral-light)', fg: 'var(--color-coral)' },
  { label: 'Win Rate', value: 72, suffix: '%', icon: Target, bg: 'var(--color-teal-light)', fg: 'var(--color-teal)' },
  { label: 'Best Streak', value: 8, suffix: 'd', icon: Flame, bg: 'var(--color-gold-light)', fg: 'var(--color-gold)' },
  { label: 'Time Played', value: 3, suffix: 'h', icon: Clock, bg: 'var(--color-violet-light)', fg: 'var(--color-violet)' },
]

const achievements = [
  { id: 'first-game', label: 'First Game', icon: Gamepad2, unlocked: true, bg: 'var(--color-coral-light)', fg: 'var(--color-coral)' },
  { id: 'sharp-eye', label: 'Sharp Eye', icon: Eye, unlocked: true, bg: 'var(--color-teal-light)', fg: 'var(--color-teal)' },
  { id: 'brain-master', label: 'Brain Master', icon: Brain, unlocked: false, bg: 'var(--color-violet-light)', fg: 'var(--color-violet)' },
  { id: 'coin-collector', label: '1K Coins', icon: Coins, unlocked: false, bg: 'var(--color-gold-light)', fg: 'var(--color-gold)' },
  { id: 'streak-king', label: '7-Day Streak', icon: Flame, unlocked: false, bg: 'var(--color-coral-light)', fg: 'var(--color-coral)' },
  { id: 'top-10', label: 'Top 10', icon: Trophy, unlocked: false, bg: 'var(--color-sky-light)', fg: 'var(--color-sky)' },
]

const skillBreakdown = [
  { label: 'Memory', pct: 78, fg: 'var(--color-coral)' },
  { label: 'Reaction', pct: 65, fg: 'var(--color-teal)' },
  { label: 'Pattern', pct: 82, fg: 'var(--color-violet)' },
  { label: 'Vision', pct: 55, fg: 'var(--color-gold)' },
]

export default function Profile({
  coins, score, streak, avatar, name, email, navigate,
  themeId, onThemeChange, soundEnabled, onSoundToggle,
  notificationsEnabled, onNotificationsToggle,
  twoFactorEnabled, onTwoFactorToggle,
  onNameChange, onEmailChange, onPasswordChange, showToast,
}: Props) {
  const sfx = useSound()
  const [editingField, setEditingField] = useState<'name' | 'email' | 'password' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const avatarDef = avatars.find(a => a.id === avatar)

  const startEdit = (field: 'name' | 'email' | 'password') => {
    setEditingField(field)
    setEditValue(field === 'name' ? name : field === 'email' ? email : '')
    setConfirmPassword('')
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValue('')
    setConfirmPassword('')
  }

  const saveEdit = () => {
    if (!editingField) return
    const trimmed = editValue.trim()
    if (editingField === 'name') {
      if (trimmed && trimmed !== name) { onNameChange(trimmed); showToast('Name updated!'); sfx('success') }
    } else if (editingField === 'email') {
      if (trimmed && trimmed !== email && trimmed.includes('@')) { onEmailChange(trimmed); showToast('Email updated!'); sfx('success') }
    } else if (editingField === 'password') {
      if (trimmed.length >= 6 && trimmed === confirmPassword) { onPasswordChange(trimmed); showToast('Password updated!'); sfx('success') }
      else if (trimmed !== confirmPassword) { showToast('Passwords don\'t match'); sfx('error'); return }
      else if (trimmed.length < 6) { showToast('Min 6 characters'); sfx('error'); return }
    }
    cancelEdit()
  }

  return (
    <motion.div
      initial="initial" animate="animate"
      transition={{ staggerChildren: 0.045 }}
      className="flex flex-col gap-5 md:gap-7 px-5 md:px-8 lg:px-10 pt-7 md:pt-10 pb-2"
    >
      {/* Header */}
      <motion.div variants={fade} className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div>
            <h1 className="text-[22px] md:text-[28px] font-bold text-ink tracking-tight">Profile</h1>
            <p className="text-[11px] md:text-[13px] text-ink-muted">Your stats & settings</p>
          </div>
        </div>
        <CoinBadge amount={coins} small />
      </motion.div>

      {/* Profile card */}
      <motion.div variants={fade} className="glass-card rounded-2xl p-5 md:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4 md:gap-5">
          <motion.div whileTap={{ scale: 0.93 }} onClick={() => navigate('customize')} className="cursor-pointer">
            <AvatarImg avatar={avatar} size={72} level={playerStats.level} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] md:text-[22px] font-bold text-ink truncate">{name}</h2>
            <p className="text-[12px] md:text-[13px] text-ink-muted mt-0.5">
              {email || 'No email set'} — {avatarDef?.name || avatar}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[11px] md:text-[12px] font-semibold text-coral flex items-center gap-1">
                <Zap size={12} /> {score.toLocaleString()} pts
              </span>
              <span className="text-[11px] md:text-[12px] font-semibold text-gold flex items-center gap-1">
                <Flame size={12} /> {streak}d streak
              </span>
              <span className="text-[11px] md:text-[12px] font-semibold text-teal flex items-center gap-1">
                <Trophy size={12} /> #42
              </span>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] md:text-[12px] font-semibold text-ink-muted">Level {playerStats.level}</span>
            <span className="text-[11px] md:text-[12px] font-semibold text-ink-muted tabular-nums">{playerStats.xp}/{playerStats.xpToNext} XP</span>
          </div>
          <div className="w-full h-[6px] md:h-[8px] bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(playerStats.xp / playerStats.xpToNext) * 100}%` }}
              transition={{ duration: 1, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              className="h-full xp-gradient rounded-full progress-bar"
            />
          </div>
        </div>
      </motion.div>

      {/* Game Stats grid */}
      <motion.div variants={fade}>
        <h3 className="text-[15px] md:text-[18px] font-bold text-ink mb-3 md:mb-4">Game Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {gameStats.map((s, i) => (
            <motion.div
              key={s.label}
              whileHover={{ y: -2 }}
              className="glass-card rounded-2xl p-3.5 md:p-4 flex flex-col items-center gap-2 shadow-[var(--shadow-soft)]"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon size={17} style={{ color: s.fg }} strokeWidth={2} />
              </div>
              <AnimatedNumber
                value={s.value}
                suffix={s.suffix}
                duration={700 + i * 120}
                className="text-[18px] md:text-[22px] font-bold text-ink"
              />
              <span className="text-[9px] md:text-[10px] font-semibold text-ink-muted uppercase tracking-[0.06em] text-center">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Skill Breakdown */}
      <motion.div variants={fade} className="glass-card rounded-2xl p-4 md:p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-violet-light flex items-center justify-center">
            <BarChart3 size={17} className="text-violet" strokeWidth={2} />
          </div>
          <h3 className="text-[15px] md:text-[17px] font-bold text-ink">Skill Breakdown</h3>
        </div>
        <div className="flex flex-col gap-3">
          {skillBreakdown.map((s, i) => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] md:text-[13px] font-semibold text-ink">{s.label}</span>
                <span className="text-[11px] md:text-[12px] font-bold tabular-nums" style={{ color: s.fg }}>{s.pct}%</span>
              </div>
              <div className="w-full h-[5px] md:h-[6px] bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                  className="h-full rounded-full"
                  style={{ background: s.fg }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={fade}>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-[15px] md:text-[18px] font-bold text-ink">Achievements</h3>
          <span className="text-[12px] md:text-[13px] font-semibold text-ink-muted">
            {achievements.filter(a => a.unlocked).length}/{achievements.length}
          </span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 md:gap-3">
          {achievements.map(a => (
            <motion.div
              key={a.id}
              whileHover={a.unlocked ? { y: -2, scale: 1.04 } : undefined}
              className={`flex flex-col items-center gap-1.5 py-3 md:py-4 rounded-2xl shadow-[var(--shadow-soft)] relative ${
                a.unlocked ? 'glass-card' : 'bg-muted/50'
              }`}
            >
              <div
                className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center ${!a.unlocked ? 'opacity-30' : ''}`}
                style={{ background: a.bg }}
              >
                <a.icon size={18} style={{ color: a.fg }} strokeWidth={2} />
              </div>
              <span className={`text-[9px] md:text-[10px] font-semibold text-center px-1 ${
                a.unlocked ? 'text-ink' : 'text-ink-muted'
              }`}>
                {a.label}
              </span>
              {a.unlocked && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Account */}
      <motion.div variants={fade}>
        <h3 className="text-[15px] md:text-[18px] font-bold text-ink mb-3 md:mb-4">Account</h3>
        <div className="flex flex-col gap-2.5 md:gap-3">
          {/* Edit modal overlay */}
          <AnimatePresence>
            {editingField && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[55] flex items-center justify-center px-5"
                style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
                onClick={cancelEdit}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  onClick={e => e.stopPropagation()}
                  className="glass-card rounded-2xl p-5 md:p-6 w-full max-w-[400px] shadow-[var(--shadow-elevated)]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[16px] md:text-[18px] font-bold text-ink">
                      {editingField === 'name' ? 'Change Name' : editingField === 'email' ? 'Change Email' : 'Change Password'}
                    </h4>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={cancelEdit}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border-none cursor-pointer"
                    >
                      <X size={14} className="text-ink" />
                    </motion.button>
                  </div>

                  <div className="flex flex-col gap-3">
                    <input
                      autoFocus
                      type={editingField === 'password' ? 'password' : editingField === 'email' ? 'email' : 'text'}
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (editingField !== 'password' ? saveEdit() : confirmPassword && saveEdit())}
                      placeholder={editingField === 'name' ? 'Enter name' : editingField === 'email' ? 'Enter email' : 'New password'}
                      maxLength={editingField === 'name' ? 16 : 64}
                      className="text-[14px] md:text-[15px] text-ink bg-muted rounded-xl px-4 py-3 border-none outline-none w-full placeholder:text-ink-muted"
                    />

                    {editingField === 'password' && (
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveEdit()}
                        placeholder="Confirm password"
                        maxLength={64}
                        className="text-[14px] md:text-[15px] text-ink bg-muted rounded-xl px-4 py-3 border-none outline-none w-full placeholder:text-ink-muted"
                      />
                    )}

                    {editingField === 'password' && (
                      <p className="text-[10px] md:text-[11px] text-ink-muted">Minimum 6 characters</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={cancelEdit}
                      className="flex-1 py-2.5 md:py-3 rounded-xl bg-muted text-ink text-[13px] md:text-[14px] font-semibold border-none cursor-pointer"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={saveEdit}
                      className="flex-1 py-2.5 md:py-3 rounded-xl bg-coral text-white text-[13px] md:text-[14px] font-bold border-none cursor-pointer shadow-[var(--shadow-btn)]"
                    >
                      Save
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name */}
          <motion.div
            whileHover={{ y: -1 }}
            className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
            onClick={() => startEdit('name')}
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-coral-light flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-coral" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] md:text-[15px] font-semibold text-ink">Display Name</p>
              <p className="text-[11px] md:text-[12px] text-ink-muted truncate">{name}</p>
            </div>
            <Pencil size={14} className="text-ink-muted flex-shrink-0" />
          </motion.div>

          {/* Email */}
          <motion.div
            whileHover={{ y: -1 }}
            className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
            onClick={() => startEdit('email')}
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-teal-light flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] md:text-[15px] font-semibold text-ink">Email</p>
              <p className="text-[11px] md:text-[12px] text-ink-muted truncate">{email || 'Not set'}</p>
            </div>
            <Pencil size={14} className="text-ink-muted flex-shrink-0" />
          </motion.div>

          {/* Password */}
          <motion.div
            whileHover={{ y: -1 }}
            className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
            onClick={() => startEdit('password')}
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-gold-light flex items-center justify-center flex-shrink-0">
              <KeyRound size={18} className="text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] md:text-[15px] font-semibold text-ink">Password</p>
              <p className="text-[11px] md:text-[12px] text-ink-muted">••••••••</p>
            </div>
            <Pencil size={14} className="text-ink-muted flex-shrink-0" />
          </motion.div>

          {/* Two-Factor Authentication */}
          <motion.div
            whileHover={{ y: -1 }}
            className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
            onClick={onTwoFactorToggle}
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-violet-light flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} className="text-violet" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] md:text-[15px] font-semibold text-ink">Two-Factor Auth</p>
              <p className="text-[11px] md:text-[12px] text-ink-muted">{twoFactorEnabled ? 'Enabled — extra security active' : 'Disabled — tap to enable'}</p>
            </div>
            <Toggle on={twoFactorEnabled} />
          </motion.div>
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div variants={fade}>
        <h3 className="text-[15px] md:text-[18px] font-bold text-ink mb-3 md:mb-4">Settings</h3>
        <div className="flex flex-col gap-2.5 md:gap-3">
          {/* Theme */}
          <motion.div
            whileHover={{ y: -1 }}
            className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
            onClick={() => onThemeChange(themeId === 'cool' ? 'warm' : 'cool')}
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-coral-light flex items-center justify-center flex-shrink-0">
              <Palette size={18} className="text-coral" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] md:text-[15px] font-semibold text-ink">Theme</p>
              <p className="text-[11px] md:text-[12px] text-ink-muted">{themeLabels[themeId]}</p>
            </div>
            <motion.div
              whileTap={{ scale: 0.85, rotate: 30 }}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={themeId}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                >
                  {themeId === 'cool' ? <Moon size={16} className="text-coral" /> : <Sun size={16} className="text-coral" />}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Sound */}
          <motion.div
            whileHover={{ y: -1 }}
            className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
            onClick={onSoundToggle}
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-teal-light flex items-center justify-center flex-shrink-0">
              {soundEnabled ? <Volume2 size={18} className="text-teal" /> : <VolumeX size={18} className="text-teal" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] md:text-[15px] font-semibold text-ink">Sound Effects</p>
              <p className="text-[11px] md:text-[12px] text-ink-muted">{soundEnabled ? 'On' : 'Off'}</p>
            </div>
            <Toggle on={soundEnabled} />
          </motion.div>

          {/* Notifications */}
          <motion.div
            whileHover={{ y: -1 }}
            className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
            onClick={onNotificationsToggle}
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-gold-light flex items-center justify-center flex-shrink-0">
              {notificationsEnabled ? <Bell size={18} className="text-gold" /> : <BellOff size={18} className="text-gold" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] md:text-[15px] font-semibold text-ink">Notifications</p>
              <p className="text-[11px] md:text-[12px] text-ink-muted">{notificationsEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
            <Toggle on={notificationsEnabled} />
          </motion.div>

          {/* Avatar shop link */}
          <motion.div
            whileHover={{ y: -1 }}
            className="glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer"
            onClick={() => navigate('customize')}
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-violet-light flex items-center justify-center flex-shrink-0">
              <Award size={18} className="text-violet" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] md:text-[15px] font-semibold text-ink">Customize Avatar</p>
              <p className="text-[11px] md:text-[12px] text-ink-muted">Change avatar & accessories</p>
            </div>
            <ChevronRight size={16} className="text-ink-muted flex-shrink-0" />
          </motion.div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div variants={fade} className="glass-card rounded-2xl p-4 md:p-5 flex items-start gap-3.5 shadow-[var(--shadow-soft)]">
        <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-sky-light flex items-center justify-center flex-shrink-0">
          <Info size={18} className="text-sky" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] md:text-[15px] font-bold text-ink">Pupilfy v1.0</p>
          <p className="text-[11px] md:text-[13px] text-ink-muted mt-0.5">
            Medical games for cognitive health & eye care. Train your brain daily!
          </p>
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div variants={fade}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -1 }}
          onClick={() => {
            localStorage.clear()
            window.location.reload()
          }}
          className="w-full glass-card rounded-2xl px-4 md:px-5 py-3.5 md:py-4 flex items-center gap-3 md:gap-4 shadow-[var(--shadow-soft)] cursor-pointer border-none text-left"
        >
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-rose-light flex items-center justify-center flex-shrink-0">
            <LogOut size={18} className="text-rose" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] md:text-[15px] font-semibold text-rose">Log Out</p>
            <p className="text-[11px] md:text-[12px] text-ink-muted">Clears all data & resets app</p>
          </div>
        </motion.button>
      </motion.div>

      {/* Member since */}
      <motion.div variants={fade} className="flex items-center justify-center gap-2 py-2">
        <Calendar size={13} className="text-ink-muted" />
        <span className="text-[11px] md:text-[12px] text-ink-muted font-medium">
          Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
      </motion.div>
    </motion.div>
  )
}

/* ── Toggle switch ── */
function Toggle({ on }: { on: boolean }) {
  return (
    <div className={`w-11 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-colors flex-shrink-0 ${
      on ? 'bg-coral' : 'bg-muted'
    }`}>
      <motion.div
        className="w-5 h-5 rounded-full bg-white shadow-sm"
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </div>
  )
}
