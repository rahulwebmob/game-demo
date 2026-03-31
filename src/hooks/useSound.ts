import { useCallback, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'

// Tiny Web Audio synthesizer — no audio files needed
const win = window as unknown as Record<string, unknown>
const ctx = () => {
  if (!win.__gamerifyAudio) {
    const AC = window.AudioContext || (win.webkitAudioContext as typeof AudioContext)
    win.__gamerifyAudio = new AC()
  }
  return win.__gamerifyAudio as AudioContext
}

function play(fn: (ac: AudioContext) => void) {
  try {
    const ac = ctx()
    if (ac.state === 'suspended') ac.resume()
    fn(ac)
  } catch { /* silent fail on unsupported browsers */ }
}

function vibrate(ms: number | number[]) {
  try { navigator.vibrate?.(ms) } catch { /* ignore */ }
}

// ── Sound definitions ──

function tap(ac: AudioContext) {
  const o = ac.createOscillator()
  const g = ac.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(600, ac.currentTime)
  o.frequency.exponentialRampToValueAtTime(400, ac.currentTime + 0.06)
  g.gain.setValueAtTime(0.08, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06)
  o.connect(g).connect(ac.destination)
  o.start(); o.stop(ac.currentTime + 0.06)
}

function coinEarn(ac: AudioContext) {
  const notes = [880, 1108, 1320]
  notes.forEach((freq, i) => {
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = 'sine'
    const t = ac.currentTime + i * 0.08
    o.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0.1, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
    o.connect(g).connect(ac.destination)
    o.start(t); o.stop(t + 0.15)
  })
}

function coinSpend(ac: AudioContext) {
  const o = ac.createOscillator()
  const g = ac.createGain()
  o.type = 'triangle'
  o.frequency.setValueAtTime(500, ac.currentTime)
  o.frequency.exponentialRampToValueAtTime(250, ac.currentTime + 0.12)
  g.gain.setValueAtTime(0.1, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12)
  o.connect(g).connect(ac.destination)
  o.start(); o.stop(ac.currentTime + 0.12)
}

function success(ac: AudioContext) {
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = 'sine'
    const t = ac.currentTime + i * 0.1
    o.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0.08, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    o.connect(g).connect(ac.destination)
    o.start(t); o.stop(t + 0.2)
  })
}

function error(ac: AudioContext) {
  const o = ac.createOscillator()
  const g = ac.createGain()
  o.type = 'sawtooth'
  o.frequency.setValueAtTime(200, ac.currentTime)
  o.frequency.exponentialRampToValueAtTime(120, ac.currentTime + 0.2)
  g.gain.setValueAtTime(0.06, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2)
  o.connect(g).connect(ac.destination)
  o.start(); o.stop(ac.currentTime + 0.2)
}

function toggle(ac: AudioContext, on: unknown) {
  const o = ac.createOscillator()
  const g = ac.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(on ? 500 : 400, ac.currentTime)
  o.frequency.exponentialRampToValueAtTime(on ? 700 : 300, ac.currentTime + 0.07)
  g.gain.setValueAtTime(0.06, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.07)
  o.connect(g).connect(ac.destination)
  o.start(); o.stop(ac.currentTime + 0.07)
}

function navigate(ac: AudioContext) {
  const o = ac.createOscillator()
  const g = ac.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(440, ac.currentTime)
  o.frequency.exponentialRampToValueAtTime(660, ac.currentTime + 0.05)
  g.gain.setValueAtTime(0.05, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05)
  o.connect(g).connect(ac.destination)
  o.start(); o.stop(ac.currentTime + 0.05)
}

function energyUp(ac: AudioContext) {
  const notes = [440, 554, 659]
  notes.forEach((freq, i) => {
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = 'sine'
    const t = ac.currentTime + i * 0.07
    o.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0.08, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    o.connect(g).connect(ac.destination)
    o.start(t); o.stop(t + 0.12)
  })
}

function energyDown(ac: AudioContext) {
  const o = ac.createOscillator()
  const g = ac.createGain()
  o.type = 'triangle'
  o.frequency.setValueAtTime(350, ac.currentTime)
  o.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 0.15)
  g.gain.setValueAtTime(0.07, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15)
  o.connect(g).connect(ac.destination)
  o.start(); o.stop(ac.currentTime + 0.15)
}

function gameStart(ac: AudioContext) {
  const notes = [392, 523, 659, 784]
  notes.forEach((freq, i) => {
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = 'sine'
    const t = ac.currentTime + i * 0.08
    o.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0.07, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
    o.connect(g).connect(ac.destination)
    o.start(t); o.stop(t + 0.18)
  })
}

function wakeUp(ac: AudioContext) {
  const notes = [262, 330, 392, 523, 659, 784]
  notes.forEach((freq, i) => {
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = 'sine'
    const t = ac.currentTime + i * 0.1
    o.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0.06, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
    o.connect(g).connect(ac.destination)
    o.start(t); o.stop(t + 0.25)
  })
}

// ── Hook ──

export type SoundName =
  | 'tap' | 'coinEarn' | 'coinSpend' | 'success' | 'error'
  | 'toggle' | 'navigate' | 'energyUp' | 'energyDown'
  | 'gameStart' | 'wakeUp'

const sounds: Record<SoundName, (ac: AudioContext, ...args: unknown[]) => void> = {
  tap, coinEarn, coinSpend, success, error,
  toggle, navigate, energyUp, energyDown,
  gameStart, wakeUp,
}

const haptics: Partial<Record<SoundName, number | number[]>> = {
  tap: 10,
  coinEarn: [10, 30, 10, 30, 10],
  success: [10, 40, 10, 40, 20],
  error: [50, 30, 50],
  energyUp: [10, 20, 10],
  energyDown: 30,
  gameStart: [10, 30, 10, 30, 10, 30, 20],
  wakeUp: [10, 20, 10, 20, 10, 20, 10, 20, 30],
  toggle: 8,
  navigate: 5,
}

export function useSound() {
  const [enabled] = useLocalStorage('gamerify-sound', true)
  const lastPlay = useRef(0)

  const playSound = useCallback((name: SoundName, ...args: unknown[]) => {
    // Throttle: min 30ms between sounds
    const now = Date.now()
    if (now - lastPlay.current < 30) return
    lastPlay.current = now

    if (enabled) {
      play((ac) => sounds[name](ac, ...args))
    }
    // Haptics always fire (independent of sound setting)
    const h = haptics[name]
    if (h) vibrate(h)
  }, [enabled])

  return playSound
}
