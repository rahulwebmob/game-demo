// localStorage keys
export const STORAGE_KEYS = {
  coins: "gamerify-coins",
  score: "gamerify-score",
  streak: "gamerify-streak",
  lastLogin: "gamerify-last-login",
  claimed: "gamerify-claimed",
  avatar: "gamerify-avatar",
  accessory: "gamerify-accessory",
  ownedAvatars: "gamerify-owned-avatars",
  ownedAccessories: "gamerify-owned-acc",
  name: "gamerify-name",
  sound: "gamerify-sound",
  theme: "gamerify-theme",
  email: "gamerify-email",
  notifications: "gamerify-notifications",
  twoFactor: "gamerify-2fa",
} as const;

export const MAX_ENERGY = 5;

// z-index layers
export const Z = {
  NAV: 50,
  OVERLAY: 55,
  PUPIL_TEST: 60,
  TOAST: 100,
} as const;

// Animation durations (ms)
export const ANIMATION = {
  PAGE_TRANSITION: 180,
  STAGGER_CHILDREN: 0.045,
  CARD_FLIP: 350,
  MATCH_DELAY: 400,
  MISMATCH_DELAY: 700,
  FEEDBACK_DELAY: 500,
  ROUND_TRANSITION: 800,
  PATTERN_SHOW: 600,
  PATTERN_GAP: 300,
  PATTERN_INPUT_DELAY: 400,
} as const;

// Game configuration
export const GAME_CONFIG = {
  MEMORY_PAIRS: 8,
  REACTION_ROUNDS: 5,
  COLOR_VISION_ROUNDS: 10,
  NUMBER_SEQUENCE_ROUNDS: 8,
  CONTRAST_ROUNDS: 12,
  PATTERN_MAX_LEVEL: 8,
  PATTERN_LIVES: 3,
  PATTERN_GRID: 9,
  PATTERN_COLS: 3,
} as const;

// Scoring
export const SCORING = {
  MEMORY_MOVE_PENALTY: 2,
  MEMORY_MIN_SCORE: 10,
  MEMORY_MAX_SCORE: 100,
  REACTION_DIVISOR: 5,
  PATTERN_POINTS_MULTIPLIER: 15,
  NUMBER_POINTS_MULTIPLIER: 12,
} as const;

// Star thresholds
export const STARS = {
  THREE_STAR_MIN: 80,
  TWO_STAR_MIN: 50,
  REACTION_THREE_STAR: 250,
  REACTION_TWO_STAR: 350,
  COLOR_THREE_STAR: 385,
  COLOR_TWO_STAR: 220,
  PATTERN_THREE_STAR: 380,
  PATTERN_TWO_STAR: 215,
  NUMBER_THREE_STAR: 300,
  NUMBER_TWO_STAR: 170,
  CONTRAST_THREE_STAR: 220,
  CONTRAST_TWO_STAR: 125,
} as const;

// Service worker
export const SW_UPDATE_INTERVAL = 60_000;

// Audio
export const AUDIO = {
  MASTER_VOLUME: 3.5,
  THROTTLE_MS: 30,
} as const;
