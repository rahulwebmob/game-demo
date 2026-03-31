import { useCallback, useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS } from "../constants";

// Tiny Web Audio synthesizer — no audio files needed
const win = window as unknown as Record<string, unknown>;
const ctx = () => {
  if (!win.__gamerifyAudio) {
    const AC =
      window.AudioContext || (win.webkitAudioContext as typeof AudioContext);
    win.__gamerifyAudio = new AC();
  }
  return win.__gamerifyAudio as AudioContext;
};

// Master volume — all sounds go through this gain node
let masterGain: GainNode | null = null;
function getMaster(ac: AudioContext) {
  if (!masterGain) {
    masterGain = ac.createGain();
    masterGain.gain.value = 3.5;
    masterGain.connect(ac.destination);
  }
  return masterGain;
}

function play(fn: (ac: AudioContext, dest: AudioNode) => void) {
  try {
    const ac = ctx();
    if (ac.state === "suspended") ac.resume();
    fn(ac, getMaster(ac));
  } catch {
    /* silent fail on unsupported browsers */
  }
}

function vibrate(ms: number | number[]) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* ignore */
  }
}

// ── Sound definitions ──

function tap(ac: AudioContext, dest: AudioNode) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(600, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(400, ac.currentTime + 0.06);
  g.gain.setValueAtTime(0.08, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06);
  o.connect(g).connect(dest);
  o.start();
  o.stop(ac.currentTime + 0.06);
}

function coinEarn(ac: AudioContext, dest: AudioNode) {
  const notes = [880, 1108, 1320];
  notes.forEach((freq, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    const t = ac.currentTime + i * 0.08;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + 0.15);
  });
}

function coinSpend(ac: AudioContext, dest: AudioNode) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(500, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(250, ac.currentTime + 0.12);
  g.gain.setValueAtTime(0.1, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
  o.connect(g).connect(dest);
  o.start();
  o.stop(ac.currentTime + 0.12);
}

function success(ac: AudioContext, dest: AudioNode) {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    const t = ac.currentTime + i * 0.1;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + 0.2);
  });
}

function error(ac: AudioContext, dest: AudioNode) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(200, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(120, ac.currentTime + 0.2);
  g.gain.setValueAtTime(0.06, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
  o.connect(g).connect(dest);
  o.start();
  o.stop(ac.currentTime + 0.2);
}

function toggle(ac: AudioContext, dest: AudioNode, on: unknown) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(on ? 500 : 400, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(
    on ? 700 : 300,
    ac.currentTime + 0.07,
  );
  g.gain.setValueAtTime(0.06, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.07);
  o.connect(g).connect(dest);
  o.start();
  o.stop(ac.currentTime + 0.07);
}

function navigate(ac: AudioContext, dest: AudioNode) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(440, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(660, ac.currentTime + 0.05);
  g.gain.setValueAtTime(0.05, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05);
  o.connect(g).connect(dest);
  o.start();
  o.stop(ac.currentTime + 0.05);
}

function energyUp(ac: AudioContext, dest: AudioNode) {
  const notes = [440, 554, 659];
  notes.forEach((freq, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    const t = ac.currentTime + i * 0.07;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + 0.12);
  });
}

function energyDown(ac: AudioContext, dest: AudioNode) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(350, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 0.15);
  g.gain.setValueAtTime(0.07, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
  o.connect(g).connect(dest);
  o.start();
  o.stop(ac.currentTime + 0.15);
}

function gameStart(ac: AudioContext, dest: AudioNode) {
  const notes = [392, 523, 659, 784];
  notes.forEach((freq, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    const t = ac.currentTime + i * 0.08;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + 0.18);
  });
}

function wakeUp(ac: AudioContext, dest: AudioNode) {
  const notes = [262, 330, 392, 523, 659, 784];
  notes.forEach((freq, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    const t = ac.currentTime + i * 0.1;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + 0.25);
  });
}

// Rich fanfare — game completion celebration (chord + arpeggio)
function gameComplete(ac: AudioContext, dest: AudioNode) {
  // Chord stab
  const chord = [523, 659, 784];
  chord.forEach((freq) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, ac.currentTime);
    g.gain.setValueAtTime(0.06, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);
    o.connect(g).connect(dest);
    o.start();
    o.stop(ac.currentTime + 0.35);
  });
  // Arpeggio on top
  const arp = [784, 988, 1175, 1568];
  arp.forEach((freq, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    const t = ac.currentTime + 0.15 + i * 0.07;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + 0.2);
  });
}

// Level up — triumphant ascending with shimmer
function levelUp(ac: AudioContext, dest: AudioNode) {
  const notes = [392, 494, 588, 784, 988, 1175];
  notes.forEach((freq, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = i < 3 ? "sine" : "triangle";
    const t = ac.currentTime + i * 0.09;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + 0.3);
  });
}

// Streak — warm ascending duo with harmony
function streak(ac: AudioContext, dest: AudioNode) {
  const melody = [440, 554, 659, 880];
  const harmony = [330, 440, 494, 659];
  melody.forEach((freq, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    const t = ac.currentTime + i * 0.1;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + 0.22);
  });
  harmony.forEach((freq, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "triangle";
    const t = ac.currentTime + i * 0.1 + 0.02;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.03, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + 0.18);
  });
}

// Modal open — soft rising whoosh
function modalOpen(ac: AudioContext, dest: AudioNode) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(300, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(600, ac.currentTime + 0.1);
  g.gain.setValueAtTime(0.04, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);
  o.connect(g).connect(dest);
  o.start();
  o.stop(ac.currentTime + 0.1);
  // Soft chime on top
  const o2 = ac.createOscillator();
  const g2 = ac.createGain();
  o2.type = "sine";
  o2.frequency.setValueAtTime(880, ac.currentTime + 0.05);
  g2.gain.setValueAtTime(0.03, ac.currentTime + 0.05);
  g2.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
  o2.connect(g2).connect(dest);
  o2.start(ac.currentTime + 0.05);
  o2.stop(ac.currentTime + 0.15);
}

// Modal close — soft falling
function modalClose(ac: AudioContext, dest: AudioNode) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(500, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(280, ac.currentTime + 0.08);
  g.gain.setValueAtTime(0.04, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);
  o.connect(g).connect(dest);
  o.start();
  o.stop(ac.currentTime + 0.08);
}

// Filter switch — quick blip
function filter(ac: AudioContext, dest: AudioNode) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(700, ac.currentTime);
  o.frequency.exponentialRampToValueAtTime(500, ac.currentTime + 0.04);
  g.gain.setValueAtTime(0.05, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.04);
  o.connect(g).connect(dest);
  o.start();
  o.stop(ac.currentTime + 0.04);
}

// Logout — descending three-note goodbye
function logout(ac: AudioContext, dest: AudioNode) {
  const notes = [659, 494, 330];
  notes.forEach((freq, i) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "triangle";
    const t = ac.currentTime + i * 0.12;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + 0.2);
  });
}

// ── Hook ──

export type SoundName =
  | "tap"
  | "coinEarn"
  | "coinSpend"
  | "success"
  | "error"
  | "toggle"
  | "navigate"
  | "energyUp"
  | "energyDown"
  | "gameStart"
  | "wakeUp"
  | "gameComplete"
  | "levelUp"
  | "streak"
  | "modalOpen"
  | "modalClose"
  | "filter"
  | "logout";

const sounds: Record<
  SoundName,
  (ac: AudioContext, dest: AudioNode, ...args: unknown[]) => void
> = {
  tap,
  coinEarn,
  coinSpend,
  success,
  error,
  toggle,
  navigate,
  energyUp,
  energyDown,
  gameStart,
  wakeUp,
  gameComplete,
  levelUp,
  streak,
  modalOpen,
  modalClose,
  filter,
  logout,
};

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
  gameComplete: [10, 30, 10, 30, 10, 60, 20],
  levelUp: [10, 20, 10, 20, 10, 20, 10, 40],
  streak: [10, 30, 10, 30, 10, 30, 20],
  modalOpen: [5, 10],
  modalClose: 5,
  filter: 6,
  logout: [20, 40, 20],
};

export function useSound() {
  const [enabled] = useLocalStorage(STORAGE_KEYS.sound, true);
  const lastPlay = useRef(0);

  const playSound = useCallback(
    (name: SoundName, ...args: unknown[]) => {
      // Throttle: min 30ms between sounds
      const now = Date.now();
      if (now - lastPlay.current < 30) return;
      lastPlay.current = now;

      if (enabled) {
        play((ac, dest) => sounds[name](ac, dest, ...args));
      }
      // Haptics always fire (independent of sound setting)
      const h = haptics[name];
      if (h) vibrate(h);
    },
    [enabled],
  );

  return playSound;
}
