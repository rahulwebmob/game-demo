// localStorage keys
export const STORAGE_KEYS = {
  coins: 'gamerify-coins',
  score: 'gamerify-score',
  streak: 'gamerify-streak',
  lastLogin: 'gamerify-last-login',
  claimed: 'gamerify-claimed',
  avatar: 'gamerify-avatar',
  accessory: 'gamerify-accessory',
  ownedAvatars: 'gamerify-owned-avatars',
  ownedAccessories: 'gamerify-owned-acc',
  name: 'gamerify-name',
  sound: 'gamerify-sound',
  theme: 'gamerify-theme',
  email: 'gamerify-email',
  notifications: 'gamerify-notifications',
  twoFactor: 'gamerify-2fa',
} as const

export const MAX_ENERGY = 5

// z-index layers
export const Z = {
  NAV: 50,
  OVERLAY: 55,
  PUPIL_TEST: 60,
  TOAST: 100,
} as const
