import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AvatarId } from "../data/avatars";
import { STORAGE_KEYS, MAX_ENERGY } from "../constants";

/* ── helpers ── */
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ── state shape ── */
export interface PlayerState {
  name: string;
  email: string;
  coins: number;
  score: number;
  streak: number;
  claimedToday: boolean;
  avatar: AvatarId;
  accessory: string | null;
  ownedAvatars: AvatarId[];
  ownedAccessories: string[];
  energy: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  twoFactorEnabled: boolean;
}

const initialState: PlayerState = {
  name: load(STORAGE_KEYS.name, "Gamer"),
  email: load(STORAGE_KEYS.email, ""),
  coins: load(STORAGE_KEYS.coins, 1000),
  score: load(STORAGE_KEYS.score, 4820),
  streak: load(STORAGE_KEYS.streak, 3),
  claimedToday: load(STORAGE_KEYS.claimed, false),
  avatar: load<AvatarId>(STORAGE_KEYS.avatar, "owl"),
  accessory: load<string | null>(STORAGE_KEYS.accessory, null),
  ownedAvatars: load<AvatarId[]>(STORAGE_KEYS.ownedAvatars, ["owl", "dog", "cat"]),
  ownedAccessories: load<string[]>(STORAGE_KEYS.ownedAccessories, []),
  energy: 0, // resets every session
  soundEnabled: load(STORAGE_KEYS.sound, true),
  notificationsEnabled: load(STORAGE_KEYS.notifications, true),
  twoFactorEnabled: load(STORAGE_KEYS.twoFactor, false),
};

/* ── slice ── */
const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
      save(STORAGE_KEYS.name, action.payload);
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
      save(STORAGE_KEYS.email, action.payload);
    },
    addCoins(state, action: PayloadAction<number>) {
      state.coins += action.payload;
      save(STORAGE_KEYS.coins, state.coins);
    },
    spendCoins(state, action: PayloadAction<number>) {
      state.coins = Math.max(0, state.coins - action.payload);
      save(STORAGE_KEYS.coins, state.coins);
    },
    setAvatar(state, action: PayloadAction<AvatarId>) {
      state.avatar = action.payload;
      save(STORAGE_KEYS.avatar, action.payload);
    },
    setAccessory(state, action: PayloadAction<string | null>) {
      state.accessory = action.payload;
      save(STORAGE_KEYS.accessory, action.payload);
    },
    buyAvatar(state, action: PayloadAction<{ id: AvatarId; price: number }>) {
      const { id, price } = action.payload;
      if (state.coins < price) return;
      state.coins -= price;
      state.ownedAvatars.push(id);
      state.avatar = id;
      save(STORAGE_KEYS.coins, state.coins);
      save(STORAGE_KEYS.ownedAvatars, state.ownedAvatars);
      save(STORAGE_KEYS.avatar, id);
    },
    buyAccessory(state, action: PayloadAction<{ id: string; price: number }>) {
      const { id, price } = action.payload;
      if (state.coins < price) return;
      state.coins -= price;
      state.ownedAccessories.push(id);
      state.accessory = id;
      save(STORAGE_KEYS.coins, state.coins);
      save(STORAGE_KEYS.ownedAccessories, state.ownedAccessories);
      save(STORAGE_KEYS.accessory, id);
    },
    claimDaily(state, action: PayloadAction<number>) {
      if (state.claimedToday) return;
      state.coins += action.payload;
      state.streak += 1;
      state.claimedToday = true;
      save(STORAGE_KEYS.coins, state.coins);
      save(STORAGE_KEYS.streak, state.streak);
      save(STORAGE_KEYS.claimed, true);
    },
    fillEnergy(state) {
      state.energy = MAX_ENERGY;
    },
    spendEnergy(state) {
      state.energy = Math.max(0, state.energy - 1);
    },
    addEnergy(state) {
      state.energy = Math.min(MAX_ENERGY, state.energy + 1);
    },
    resetEnergy(state) {
      state.energy = 0;
    },
    toggleSound(state) {
      state.soundEnabled = !state.soundEnabled;
      save(STORAGE_KEYS.sound, state.soundEnabled);
    },
    toggleNotifications(state) {
      state.notificationsEnabled = !state.notificationsEnabled;
      save(STORAGE_KEYS.notifications, state.notificationsEnabled);
    },
    toggleTwoFactor(state) {
      state.twoFactorEnabled = !state.twoFactorEnabled;
      save(STORAGE_KEYS.twoFactor, state.twoFactorEnabled);
    },
  },
});

export const {
  setName,
  setEmail,
  addCoins,
  spendCoins,
  setAvatar,
  setAccessory,
  buyAvatar,
  buyAccessory,
  claimDaily,
  fillEnergy,
  spendEnergy,
  addEnergy,
  resetEnergy,
  toggleSound,
  toggleNotifications,
  toggleTwoFactor,
} = playerSlice.actions;

export default playerSlice.reducer;
