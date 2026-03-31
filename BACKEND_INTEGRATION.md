# Gamerify — Backend Integration Plan

> Production-ready backend API design + RTK Query / Redux integration for the Gamerify frontend.

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Architecture Overview](#2-architecture-overview)
3. [Database Schema](#3-database-schema)
4. [API Specification](#4-api-specification)
5. [Redux Store Design](#5-redux-store-design)
6. [RTK Query API Slices](#6-rtk-query-api-slices)
7. [Authentication Flow](#7-authentication-flow)
8. [Migration Strategy](#8-migration-strategy)
9. [Error Handling](#9-error-handling)
10. [Real-Time Features](#10-real-time-features)
11. [Security Considerations](#11-security-considerations)
12. [File Structure](#12-file-structure)

---

## 1. Current State Audit

### State currently in localStorage

| Key | Type | Default | Backend? |
|-----|------|---------|----------|
| `gamerify-coins` | `number` | 250 | Yes — server-authoritative |
| `gamerify-score` | `number` | 4820 | Yes — server-authoritative |
| `gamerify-streak` | `number` | 3 | Yes — server-authoritative |
| `gamerify-claimed` | `boolean` | false | Yes — server tracks per-day |
| `gamerify-avatar` | `AvatarId` | "owl" | Yes — user profile |
| `gamerify-accessory` | `string \| null` | null | Yes — user profile |
| `gamerify-owned-avatars` | `AvatarId[]` | ["owl","dog","cat"] | Yes — inventory |
| `gamerify-owned-acc` | `string[]` | [] | Yes — inventory |
| `gamerify-name` | `string` | "Gamer" | Yes — user profile |
| `gamerify-email` | `string` | "" | Yes — auth/profile |
| `gamerify-sound` | `boolean` | true | Yes — user preferences |
| `gamerify-theme` | `ThemeId` | "cool" | Yes — user preferences |
| `gamerify-notifications` | `boolean` | true | Yes — user preferences |
| `gamerify-2fa` | `boolean` | false | Yes — security setting |

### State currently in-memory only

| State | Type | Notes |
|-------|------|-------|
| `energy` | `number` (0–5) | Resets on refresh; backend should persist + auto-regen |
| `showPupilTest` | `boolean` | UI-only, stays client-side |
| `showSleepOverlay` | `boolean` | UI-only, stays client-side |
| `toasts` | `ToastData[]` | UI-only, stays client-side |
| `tab` / `direction` | routing state | UI-only |
| `loading` | `boolean` | UI-only |

### Hardcoded data that should come from backend

| Data | File | Notes |
|------|------|-------|
| `avatars` (catalog) | `data/avatars.ts` | 5 avatars with prices |
| `accessories` (catalog) | `data/avatars.ts` | 6 accessories with prices |
| `dailyRewards` | `data/avatars.ts` | 7-day reward schedule |
| `leaderboardData` | `data/avatars.ts` | Top 10 players — currently fake |
| `dailyQuests` | `data/avatars.ts` | 3 quests with progress — currently fake |
| `playerStats` | `data/avatars.ts` | Level 12, XP 340/500 — currently hardcoded |
| `games` (catalog) | `data/games.ts` | 6 game definitions |
| `categories` | `data/games.ts` | 3 game categories |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│                                                          │
│  ┌──────────┐  ┌────────────┐  ┌──────────────────────┐ │
│  │  Redux    │  │ RTK Query  │  │  UI State (useState)  │ │
│  │  Store    │←→│ API Slices │  │  toasts, modals, etc  │ │
│  │          │  │            │  │                        │ │
│  │ • auth   │  │ • authApi  │  └──────────────────────┘ │
│  │ • user   │  │ • userApi  │                            │
│  │ • energy │  │ • gameApi  │                            │
│  │ • ui     │  │ • shopApi  │                            │
│  └──────────┘  │ • lbApi    │                            │
│                │ • questApi │                            │
│                └─────┬──────┘                            │
└──────────────────────┼───────────────────────────────────┘
                       │ HTTPS (REST + JSON)
                       │ WebSocket (energy regen, leaderboard)
┌──────────────────────┼───────────────────────────────────┐
│                  API Gateway / Backend                     │
│                                                            │
│  ┌────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Auth  │  │  Player  │  │  Games   │  │  Shop      │  │
│  │ Module │  │  Module  │  │  Module  │  │  Module    │  │
│  └───┬────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│      └────────────┼─────────────┼───────────────┘         │
│                   ▼             ▼                          │
│            ┌──────────┐  ┌──────────┐                     │
│            │ MongoDB  │  │  Redis   │                     │
│            │ Atlas /  │  │ (cache/  │                     │
│            │ self-host│  │  energy/ │                     │
│            │          │  │  session)│                     │
│            └──────────┘  └──────────┘                     │
└───────────────────────────────────────────────────────────┘
```

### Tech Stack

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express or Fastify
- **Database**: MongoDB 7+ (Atlas or self-hosted), Redis 7 (sessions, energy regen timer, leaderboard cache)
- **ODM**: Mongoose 8
- **Auth**: JWT (access + refresh tokens), bcrypt for passwords
- **Validation**: Zod (shared schemas between frontend/backend)
- **Real-time**: WebSocket via Socket.io or native WS (energy regen ticks, live leaderboard)

---

## 3. Database Schema (MongoDB + Mongoose)

All schemas below are Mongoose model definitions. MongoDB is used as the single primary datastore.

### `User` — main user document (embedded preferences, stats, streak, inventory)

User-related data is **embedded** in a single document for fast single-query reads on `GET /users/me`.

```ts
// models/user.model.ts
import { Schema, model, Types } from "mongoose";

const preferencesSchema = new Schema({
  themeId:       { type: String, default: "cool" },
  soundEnabled:  { type: Boolean, default: true },
  notifications: { type: Boolean, default: true },
  twoFactor:     { type: Boolean, default: false },
}, { _id: false });

const statsSchema = new Schema({
  coins:           { type: Number, default: 250, min: 0 },
  totalScore:      { type: Number, default: 0, min: 0 },
  xp:              { type: Number, default: 0, min: 0 },
  level:           { type: Number, default: 1, min: 1 },
  energy:          { type: Number, default: 5, min: 0, max: 5 },
  gamesPlayed:     { type: Number, default: 0 },
  gamesWon:        { type: Number, default: 0 },
  bestStreak:      { type: Number, default: 0 },
  totalTimeMins:   { type: Number, default: 0 },
}, { _id: false });

const streakSchema = new Schema({
  current:       { type: Number, default: 0 },
  lastClaimDate: { type: Date, default: null },
  longest:       { type: Number, default: 0 },
}, { _id: false });

const inventoryItemSchema = new Schema({
  itemType:   { type: String, enum: ["avatar", "accessory"], required: true },
  itemId:     { type: String, required: true },
  acquiredAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new Schema({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 255 },
  passwordHash: { type: String, required: true },
  displayName:  { type: String, default: "Gamer", trim: true, maxlength: 16 },
  avatarId:     { type: String, default: "owl" },
  accessoryId:  { type: String, default: null },
  preferences:  { type: preferencesSchema, default: () => ({}) },
  stats:        { type: statsSchema, default: () => ({}) },
  streak:       { type: streakSchema, default: () => ({}) },
  inventory:    { type: [inventoryItemSchema], default: [
    { itemType: "avatar", itemId: "owl" },
    { itemType: "avatar", itemId: "dog" },
    { itemType: "avatar", itemId: "cat" },
  ]},
  refreshTokens: { type: [String], default: [] },  // hashed refresh tokens
}, {
  timestamps: true,  // createdAt, updatedAt
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ "stats.totalScore": -1 });  // for leaderboard queries

// Virtual: xpToNext (computed from level)
userSchema.virtual("stats.xpToNext").get(function () {
  return this.stats.level * 100;
});

// Virtual: winRate
userSchema.virtual("stats.winRate").get(function () {
  if (this.stats.gamesPlayed === 0) return 0;
  return Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100);
});

// Energy: no auto-regen. Only restored via pupil test completion.
// Spent 1 per game. Restored to MAX (5) on pupil test complete.

// Don't return passwordHash or refreshTokens in JSON
userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.refreshTokens;
    delete ret.__v;
    return ret;
  },
});

export const User = model("User", userSchema);
```

### `GameSession` — separate collection (high-write, used for leaderboard aggregation)

```ts
// models/game-session.model.ts
import { Schema, model, Types } from "mongoose";

const gameSessionSchema = new Schema({
  userId:       { type: Types.ObjectId, ref: "User", required: true, index: true },
  gameId:       { type: String, required: true },
  score:        { type: Number, required: true, min: 0, max: 100 },
  coinsEarned:  { type: Number, default: 0 },
  xpEarned:     { type: Number, default: 0 },
  durationSecs: { type: Number, default: null },
  playedAt:     { type: Date, default: Date.now },
});

// Indexes for leaderboard and history queries
gameSessionSchema.index({ userId: 1, playedAt: -1 });
gameSessionSchema.index({ gameId: 1, score: -1 });
gameSessionSchema.index({ playedAt: -1 });
// TTL index: auto-delete daily sessions older than 90 days (optional)
// gameSessionSchema.index({ playedAt: 1 }, { expireAfterSeconds: 7776000 });

export const GameSession = model("GameSession", gameSessionSchema);
```

### `PupilTest` — separate collection

```ts
// models/pupil-test.model.ts
import { Schema, model, Types } from "mongoose";

const pupilTestSchema = new Schema({
  userId:          { type: Types.ObjectId, ref: "User", required: true, index: true },
  completed:       { type: Boolean, default: false },
  energyRestored:  { type: Number, default: 0 },
  testedAt:        { type: Date, default: Date.now },
});

pupilTestSchema.index({ userId: 1, testedAt: -1 });

export const PupilTest = model("PupilTest", pupilTestSchema);
```

### `Quest` — quest definitions (admin-managed, rarely changes)

```ts
// models/quest.model.ts
import { Schema, model } from "mongoose";

const questSchema = new Schema({
  _id:       { type: String },  // e.g. "play3", "win1" — use string IDs
  title:     { type: String, required: true },
  icon:      { type: String, required: true },
  target:    { type: Number, required: true },
  reward:    { type: Number, required: true },
  questType: { type: String, required: true, enum: ["play_games", "win_match", "visit_page"] },
  isActive:  { type: Boolean, default: true },
});

export const Quest = model("Quest", questSchema);
```

### `UserQuestProgress` — daily quest progress per user

```ts
// models/user-quest-progress.model.ts
import { Schema, model, Types } from "mongoose";

const userQuestProgressSchema = new Schema({
  userId:    { type: Types.ObjectId, ref: "User", required: true },
  questId:   { type: String, ref: "Quest", required: true },
  progress:  { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  claimed:   { type: Boolean, default: false },
  resetDate: { type: Date, required: true },  // start of day UTC
});

// Compound unique: one progress entry per user + quest + day
userQuestProgressSchema.index({ userId: 1, questId: 1, resetDate: 1 }, { unique: true });
userQuestProgressSchema.index({ userId: 1, resetDate: 1 });

export const UserQuestProgress = model("UserQuestProgress", userQuestProgressSchema);
```

### `CatalogAvatar` — avatar shop catalog

```ts
// models/catalog-avatar.model.ts
import { Schema, model } from "mongoose";

const catalogAvatarSchema = new Schema({
  _id:       { type: String },  // e.g. "owl", "dog"
  name:      { type: String, required: true },
  bgColor:   { type: String, required: true },
  price:     { type: Number, default: 0, min: 0 },
  imageUrl:  { type: String, required: true },
  sleepUrl:  { type: String, default: null },
  sortOrder: { type: Number, default: 0 },
});

export const CatalogAvatar = model("CatalogAvatar", catalogAvatarSchema);
```

### `CatalogAccessory` — accessory shop catalog

```ts
// models/catalog-accessory.model.ts
import { Schema, model } from "mongoose";

const catalogAccessorySchema = new Schema({
  _id:       { type: String },  // e.g. "glasses", "crown"
  name:      { type: String, required: true },
  icon:      { type: String, required: true },
  price:     { type: Number, default: 0, min: 0 },
  sortOrder: { type: Number, default: 0 },
});

export const CatalogAccessory = model("CatalogAccessory", catalogAccessorySchema);
```

### `CatalogGame` — game definitions

```ts
// models/catalog-game.model.ts
import { Schema, model } from "mongoose";

const catalogGameSchema = new Schema({
  _id:         { type: String },  // e.g. "memory-match"
  name:        { type: String, required: true },
  description: { type: String, required: true },
  category:    { type: String, required: true, enum: ["brain", "eye", "memory"] },
  icon:        { type: String, required: true },
  bgColor:     { type: String, required: true },
  fgColor:     { type: String, required: true },
  timeLabel:   { type: String, required: true },
  difficulty:  { type: String, required: true, enum: ["Easy", "Medium", "Hard"] },
  coinReward:  { type: Number, default: 0 },
  xpReward:    { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
});

export const CatalogGame = model("CatalogGame", catalogGameSchema);
```

### Data Modeling Notes

| Decision | Rationale |
|----------|-----------|
| **User = single document** with embedded preferences, stats, streak, inventory | One read on login/boot. Inventory array stays small (< 20 items). Atomic `$inc` for coins/xp. |
| **GameSession = separate collection** | High-write, used for aggregation pipelines (leaderboard, skill breakdown). Would bloat User doc. |
| **UserQuestProgress = separate collection** | Resets daily. Compound index on `userId + questId + resetDate` ensures idempotent daily rows. |
| **Catalog collections = separate** | Admin-managed, cached aggressively on client. Rarely changes. Seeded via migration script. |
| **Leaderboard** | Use MongoDB aggregation pipeline on `GameSession` (grouped by userId, summed score), cached in Redis for 60s. |

### Seed Script

```ts
// scripts/seed.ts — run once to populate catalog collections
import { CatalogAvatar } from "../models/catalog-avatar.model";
import { CatalogAccessory } from "../models/catalog-accessory.model";
import { CatalogGame } from "../models/catalog-game.model";
import { Quest } from "../models/quest.model";

const avatars = [
  { _id: "owl",     name: "Hoot",     bgColor: "var(--color-coral)",  price: 0,   imageUrl: "/avatars/owl.png",     sleepUrl: "/avatars/owl-sleep.png",     sortOrder: 0 },
  { _id: "dog",     name: "Buddy",    bgColor: "var(--color-teal)",   price: 0,   imageUrl: "/avatars/dog.png",     sleepUrl: "/avatars/dog-sleep.png",     sortOrder: 1 },
  { _id: "cat",     name: "Whiskers", bgColor: "var(--color-gold)",   price: 0,   imageUrl: "/avatars/cat.png",     sleepUrl: "/avatars/cat-sleep.png",     sortOrder: 2 },
  { _id: "cat2",    name: "Ginger",   bgColor: "var(--color-violet)", price: 150, imageUrl: "/avatars/cat2.png",    sleepUrl: "/avatars/cat2-sleep.png",    sortOrder: 3 },
  { _id: "penguin", name: "Waddle",   bgColor: "var(--color-sky)",    price: 200, imageUrl: "/avatars/penguin.png", sleepUrl: "/avatars/penguin-sleep.png", sortOrder: 4 },
];

const accessories = [
  { _id: "glasses", name: "Glasses",  icon: "glasses", price: 50,  sortOrder: 0 },
  { _id: "mask",    name: "Shield",   icon: "shield",  price: 30,  sortOrder: 1 },
  { _id: "crown",   name: "Crown",    icon: "crown",   price: 500, sortOrder: 2 },
  { _id: "bow",     name: "Bow Tie",  icon: "ribbon",  price: 80,  sortOrder: 3 },
  { _id: "hat",     name: "Top Hat",  icon: "hat",     price: 150, sortOrder: 4 },
  { _id: "star",    name: "Star",     icon: "star",    price: 200, sortOrder: 5 },
];

const games = [
  { _id: "memory-match",    name: "Memory Match",    description: "Flip cards to find matching pairs. Great for Alzheimer's prevention.", category: "memory", icon: "grid",     bgColor: "var(--color-coral-light)",  fgColor: "var(--color-coral)",  timeLabel: "3 min", difficulty: "Easy",   coinReward: 30, xpReward: 50, sortOrder: 0 },
  { _id: "color-vision",    name: "Color Vision",    description: "Find the odd color out. Tests color perception and eye health.",       category: "eye",    icon: "eye",      bgColor: "var(--color-violet-light)", fgColor: "var(--color-violet)", timeLabel: "2 min", difficulty: "Medium", coinReward: 25, xpReward: 40, sortOrder: 1 },
  { _id: "reaction-time",   name: "Reaction Time",   description: "Tap as fast as you can when the screen changes. Measures brain speed.", category: "brain",  icon: "zap",      bgColor: "var(--color-gold-light)",   fgColor: "var(--color-gold)",   timeLabel: "1 min", difficulty: "Easy",   coinReward: 20, xpReward: 30, sortOrder: 2 },
  { _id: "pattern-recall",  name: "Pattern Recall",  description: "Remember and repeat the highlighted pattern. Trains working memory.",   category: "memory", icon: "brain",    bgColor: "var(--color-teal-light)",   fgColor: "var(--color-teal)",   timeLabel: "3 min", difficulty: "Medium", coinReward: 35, xpReward: 60, sortOrder: 3 },
  { _id: "number-sequence", name: "Number Sequence", description: "Find the missing number in the sequence. Sharpens mental math.",       category: "brain",  icon: "hash",     bgColor: "var(--color-sky-light)",    fgColor: "var(--color-sky)",    timeLabel: "2 min", difficulty: "Hard",   coinReward: 40, xpReward: 70, sortOrder: 4 },
  { _id: "contrast-test",   name: "Contrast Test",   description: "Identify the lighter square. Checks contrast sensitivity of your eyes.", category: "eye",  icon: "scan-eye", bgColor: "var(--color-rose-light)",   fgColor: "var(--color-rose)",   timeLabel: "2 min", difficulty: "Easy",   coinReward: 20, xpReward: 35, sortOrder: 5 },
];

const quests = [
  { _id: "play3",    title: "Play 3 Games",     icon: "gamepad",   target: 3, reward: 50,  questType: "play_games" },
  { _id: "win1",     title: "Win a Match",      icon: "trophy",    target: 1, reward: 100, questType: "win_match" },
  { _id: "visit_lb", title: "Visit Leaderboard", icon: "bar-chart", target: 1, reward: 20,  questType: "visit_page" },
];

export async function seed() {
  await CatalogAvatar.bulkWrite(avatars.map(a => ({ updateOne: { filter: { _id: a._id }, update: { $set: a }, upsert: true } })));
  await CatalogAccessory.bulkWrite(accessories.map(a => ({ updateOne: { filter: { _id: a._id }, update: { $set: a }, upsert: true } })));
  await CatalogGame.bulkWrite(games.map(g => ({ updateOne: { filter: { _id: g._id }, update: { $set: g }, upsert: true } })));
  await Quest.bulkWrite(quests.map(q => ({ updateOne: { filter: { _id: q._id }, update: { $set: q }, upsert: true } })));
  console.log("Seed complete");
}
```

### Leaderboard Aggregation Pipeline

```ts
// Used by GET /leaderboard — cached in Redis for 60s
const leaderboardPipeline = (period: "daily" | "weekly" | "all") => {
  const dateFilter: Record<string, Date> = {};
  const now = new Date();

  if (period === "daily") {
    dateFilter.playedAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) } as any;
  } else if (period === "weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter.playedAt = { $gte: weekAgo } as any;
  }
  // "all" = no date filter

  return [
    { $match: dateFilter },
    { $group: { _id: "$userId", totalScore: { $sum: "$score" } } },
    { $sort: { totalScore: -1 } },
    { $limit: 50 },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $project: {
      _id: 0,
      userId: "$_id",
      displayName: "$user.displayName",
      avatarId: "$user.avatarId",
      score: "$totalScore",
    }},
  ];
};
```

---

## 4. API Specification

**Base URL**: `/api/v1`
**Content-Type**: `application/json`
**Auth**: Bearer token in `Authorization` header (except public endpoints)

### Standard Response Envelope

**Every** API response includes a `message` field — a human-readable string the frontend can display directly as a toast notification.

```ts
// Success response shape
{
  success: true;
  message: string;   // always present — display as toast
  data: { ... };     // endpoint-specific payload
}

// Error response shape
{
  success: false;
  message: string;   // user-friendly error message — display as toast
  code: string;      // machine-readable error code
  field?: string;    // optional — which field failed validation
}
```

### 4.1 Auth

#### `POST /auth/register`

```ts
// Request
{
  email: string;        // valid email, max 255
  password: string;     // min 6, max 128
  displayName?: string; // max 16, defaults to "Gamer"
}

// Response 201
{
  success: true,
  message: "Welcome to Gamerify! Account created successfully",
  data: {
    user: { id, email, displayName },
    tokens: { accessToken, refreshToken }
  }
}

// Error 409
{ success: false, message: "An account with this email already exists", code: "EMAIL_EXISTS" }

// Error 422
{ success: false, message: "Password must be at least 6 characters", code: "VALIDATION_ERROR", field: "password" }
```

#### `POST /auth/login`

```ts
// Request
{ email: string; password: string }

// Response 200
{
  success: true,
  message: "Welcome back, {displayName}!",
  data: {
    user: { id, email, displayName },
    tokens: { accessToken, refreshToken }
  }
}

// Error 401
{ success: false, message: "Invalid email or password", code: "INVALID_CREDENTIALS" }
```

#### `POST /auth/refresh`

```ts
// Request
{ refreshToken: string }

// Response 200
{
  success: true,
  message: "Session refreshed",
  data: { accessToken, refreshToken }
}

// Error 401
{ success: false, message: "Session expired — please log in again", code: "TOKEN_EXPIRED" }
```

#### `POST /auth/logout`

```ts
// Request (authenticated)
{ refreshToken: string }

// Response 200
{ success: true, message: "Logged out successfully" }
```

#### `POST /auth/change-password`

```ts
// Request (authenticated)
{ currentPassword: string; newPassword: string }

// Response 200
{ success: true, message: "Password updated successfully" }

// Error 401
{ success: false, message: "Current password is incorrect", code: "WRONG_PASSWORD" }
```

---

### 4.2 User Profile

#### `GET /users/me`

Full user profile — called on app boot.

```ts
// Response 200
{
  success: true,
  message: "Profile loaded",
  data: {
    id: string;
    email: string;
    displayName: string;
    avatarId: string;
    accessoryId: string | null;
    preferences: {
      themeId: string;
      soundEnabled: boolean;
      notifications: boolean;
      twoFactor: boolean;
    };
    stats: {
      coins: number;
      totalScore: number;
      xp: number;
      level: number;
      xpToNext: number;
      energy: number;        // 0–5, only restored via pupil test
      maxEnergy: number;     // 5
      gamesPlayed: number;
      gamesWon: number;
      winRate: number;
      bestStreak: number;
      totalTimeMins: number;
    };
    streak: {
      current: number;
      claimedToday: boolean;
      longestStreak: number;
    };
    inventory: {
      avatars: string[];
      accessories: string[];
    };
    createdAt: string;
  }
}
```

#### `PATCH /users/me`

Update profile fields (partial update).

```ts
// Request
{
  displayName?: string;
  email?: string;
  avatarId?: string;      // must be owned
  accessoryId?: string | null;
}

// Response 200
{
  success: true,
  message: "Profile updated",          // or "Name updated", "Avatar changed to Hoot" etc.
  data: { ...updated user object }
}

// Error 400
{ success: false, message: "You don't own this avatar", code: "NOT_OWNED" }
```

#### `PATCH /users/me/preferences`

```ts
// Request
{ themeId?: string; soundEnabled?: boolean; notifications?: boolean; twoFactor?: boolean }

// Response 200
{
  success: true,
  message: "Preferences saved",        // or "Theme changed to Midnight", "Sound enabled"
  data: { themeId, soundEnabled, notifications, twoFactor }
}
```

---

### 4.3 Energy

Energy is **only restored by completing a pupil test** (full restore to 5). Each game costs 1 energy. There is **no automatic time-based regen**.

#### `GET /energy`

```ts
// Response 200
{
  success: true,
  message: "Energy status",
  data: { energy: number; maxEnergy: number }
}
```

#### `POST /energy/spend`

Called automatically when starting a game.

```ts
// Request
{ amount?: number }  // default 1

// Response 200
{
  success: true,
  message: "Energy spent — {remaining}/5 remaining",
  data: { energy: number }
}

// Error 400
{ success: false, message: "Not enough energy — complete an eye check to recharge!", code: "INSUFFICIENT_ENERGY" }
```

#### `POST /energy/restore`

Called after completing a pupil test. **Only way to regain energy.**

```ts
// Request
{ pupilTestId: string }

// Response 200
{
  success: true,
  message: "Energy restored! 5/5",
  data: { energyRestored: 5, newEnergy: 5 }
}

// Error 400
{ success: false, message: "This eye check has already been used", code: "TEST_ALREADY_USED" }
```

---

### 4.4 Games

#### `GET /games`

Game catalog (can be cached aggressively).

```ts
// Response 200
{
  success: true,
  message: "Games loaded",
  data: {
    games: GameDef[];
    categories: { id: string; label: string }[];
  }
}
```

#### `POST /games/:gameId/complete`

Submit a game result. Server validates and awards coins/XP.

```ts
// Request
{ score: number; durationSecs?: number }

// Response 200
{
  success: true,
  message: "Earned {coinsEarned} coins from Memory Match!",  // dynamic per game
  data: {
    coinsEarned: number;
    xpEarned: number;
    newTotalCoins: number;
    newTotalXp: number;
    newLevel: number;
    leveledUp: boolean;
    questsUpdated: { questId: string; progress: number; completed: boolean }[];
  }
}

// Level up variant:
// message: "Level up! You're now level 13 — earned 35 coins from Pattern Recall!"

// Error 400
{ success: false, message: "Not enough energy to play — complete an eye check!", code: "INSUFFICIENT_ENERGY" }
```

#### `GET /games/history`

```ts
// Query: ?limit=20&offset=0&gameId=memory-match
// Response 200
{
  success: true,
  message: "Game history loaded",
  data: {
    sessions: {
      id: string;
      gameId: string;
      score: number;
      coinsEarned: number;
      xpEarned: number;
      durationSecs: number | null;
      playedAt: string;
    }[];
    total: number;
  }
}
```

---

### 4.5 Shop

#### `GET /shop/catalog`

```ts
// Response 200
{
  success: true,
  message: "Shop catalog loaded",
  data: {
    avatars: { id, name, bgColor, price, imageUrl, sleepUrl }[];
    accessories: { id, name, icon, price }[];
  }
}
```

#### `POST /shop/buy`

Server-authoritative purchase. Validates coins, deducts, adds to inventory.

```ts
// Request
{ itemType: "avatar" | "accessory"; itemId: string }

// Response 200
{
  success: true,
  message: "Unlocked Waddle!",          // dynamic: "Unlocked {name}!" or "Bought {name}!"
  data: {
    newCoins: number;
    item: { itemType, itemId, name };
    equipped: boolean;
  }
}

// Error 400
{ success: false, message: "Not enough coins — you need 200 but have 150", code: "INSUFFICIENT_COINS" }

// Error 409
{ success: false, message: "You already own this item", code: "ALREADY_OWNED" }

// Error 404
{ success: false, message: "Item not found", code: "NOT_FOUND" }
```

---

### 4.6 Daily Login

#### `GET /daily`

```ts
// Response 200
{
  success: true,
  message: "Daily rewards loaded",
  data: {
    streak: number;
    claimedToday: boolean;
    rewards: { day: number; coins: number; label: string }[];
    todayIndex: number;
    weeklyEarned: number;
  }
}
```

#### `POST /daily/claim`

Idempotent — safe to call multiple times per day.

```ts
// Response 200
{
  success: true,
  message: "Claimed 30 coins! Day 3 streak",   // dynamic
  data: {
    coinsEarned: number;
    newTotalCoins: number;
    newStreak: number;
    todayIndex: number;
  }
}

// Error 400
{ success: false, message: "Already claimed today — come back tomorrow!", code: "ALREADY_CLAIMED" }
```

---

### 4.7 Leaderboard

#### `GET /leaderboard`

```ts
// Query: ?period=daily|weekly|all&limit=50&offset=0
// Response 200
{
  success: true,
  message: "Leaderboard loaded",
  data: {
    players: {
      rank: number;
      userId: string;
      displayName: string;
      avatarId: string;
      score: number;
    }[];
    myRank: {
      rank: number;
      score: number;
      percentile: number;
    };
    updatedAt: string;
  }
}
```

---

### 4.8 Quests

#### `GET /quests/daily`

```ts
// Response 200
{
  success: true,
  message: "Daily quests loaded",
  data: {
    quests: {
      id: string;
      title: string;
      icon: string;
      progress: number;
      target: number;
      reward: number;
      completed: boolean;
      claimed: boolean;
    }[];
  }
}
```

#### `POST /quests/:questId/claim`

```ts
// Response 200
{
  success: true,
  message: "Quest complete! Earned 50 coins",    // dynamic
  data: {
    coinsEarned: number;
    newTotalCoins: number;
  }
}

// Error 400
{ success: false, message: "Quest not completed yet", code: "QUEST_NOT_COMPLETE" }

// Error 400
{ success: false, message: "Quest reward already claimed", code: "ALREADY_CLAIMED" }
```

---

### 4.9 Pupil Test

#### `POST /pupil-test/start`

```ts
// Response 201
{
  success: true,
  message: "Eye check started",
  data: { testId: string; startedAt: string }
}
```

#### `POST /pupil-test/:testId/complete`

```ts
// Request
{ videoBlob?: boolean }

// Response 200
{
  success: true,
  message: "Eye check complete — energy restored! 5/5",
  data: { energyRestored: 5, newEnergy: 5 }
}
```

---

### 4.10 Skill Breakdown

#### `GET /users/me/skills`

Aggregated from game history.

```ts
// Response 200
{
  success: true,
  message: "Skills loaded",
  data: {
    skills: {
      label: string;
      percentage: number;
      fgColor: string;
    }[];
  }
}
```

---

## 5. Redux Store Design

### Store Shape

```ts
interface RootState {
  auth: AuthState;
  ui: UIState;
  // RTK Query auto-manages cache under api.reducerPath
  [authApi.reducerPath]: ReturnType<typeof authApi.reducer>;
  [userApi.reducerPath]: ReturnType<typeof userApi.reducer>;
  [gameApi.reducerPath]: ReturnType<typeof gameApi.reducer>;
  [shopApi.reducerPath]: ReturnType<typeof shopApi.reducer>;
  [leaderboardApi.reducerPath]: ReturnType<typeof leaderboardApi.reducer>;
  [questApi.reducerPath]: ReturnType<typeof questApi.reducer>;
}
```

### `authSlice`

```ts
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  status: "idle" | "authenticated" | "unauthenticated";
}

// Actions:
// setCredentials({ accessToken, refreshToken, userId })
// clearCredentials()
```

### `uiSlice`

Client-only UI state that doesn't go to the server.

```ts
interface UIState {
  activeTab: Tab;
  direction: number;
  loading: boolean;
  showPupilTest: boolean;
  showSleepOverlay: boolean;
  toasts: ToastData[];
}

// Actions:
// navigate(tab)
// setShowPupilTest(boolean)
// setShowSleepOverlay(boolean)
// addToast({ message, type })
// dismissToast(id)
```

---

## 6. RTK Query API Slices

### Base Query with Re-auth

```ts
// src/store/base-query.ts
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { clearCredentials, setCredentials } from "./auth-slice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL + "/api/v1",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn = async (
  args, api, extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        { url: "/auth/refresh", method: "POST", body: { refreshToken } },
        api,
        extraOptions
      );
      if (refreshResult.data) {
        api.dispatch(setCredentials(refreshResult.data as TokenPayload));
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(clearCredentials());
      }
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};
```

### `authApi`

```ts
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (build) => ({
    register: build.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    logout: build.mutation<void, { refreshToken: string }>({
      query: (body) => ({ url: "/auth/logout", method: "POST", body }),
    }),
    changePassword: build.mutation<void, ChangePasswordRequest>({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
    }),
  }),
});
```

### `userApi`

```ts
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Profile", "Preferences", "Skills"],
  endpoints: (build) => ({

    getMe: build.query<UserProfile, void>({
      query: () => "/users/me",
      providesTags: ["Profile"],
    }),

    updateProfile: build.mutation<UserProfile, Partial<ProfileUpdate>>({
      query: (body) => ({ url: "/users/me", method: "PATCH", body }),
      invalidatesTags: ["Profile"],
    }),

    updatePreferences: build.mutation<Preferences, Partial<Preferences>>({
      query: (body) => ({ url: "/users/me/preferences", method: "PATCH", body }),
      invalidatesTags: ["Preferences"],
    }),

    getSkills: build.query<SkillBreakdown, void>({
      query: () => "/users/me/skills",
      providesTags: ["Skills"],
    }),

    getEnergy: build.query<EnergyState, void>({
      query: () => "/energy",
      providesTags: ["Profile"],
    }),

    spendEnergy: build.mutation<EnergyState, { amount?: number }>({
      query: (body) => ({ url: "/energy/spend", method: "POST", body }),
      invalidatesTags: ["Profile"],
    }),

    restoreEnergy: build.mutation<EnergyState, { pupilTestId: string }>({
      query: (body) => ({ url: "/energy/restore", method: "POST", body }),
      invalidatesTags: ["Profile"],
      // Only way to regain energy — triggers full restore to 5
    }),
  }),
});
```

### `gameApi`

```ts
export const gameApi = createApi({
  reducerPath: "gameApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GameCatalog", "GameHistory"],
  endpoints: (build) => ({

    getGameCatalog: build.query<GameCatalogResponse, void>({
      query: () => "/games",
      providesTags: ["GameCatalog"],
      keepUnusedDataFor: 3600, // cache 1 hour
    }),

    completeGame: build.mutation<GameCompleteResponse, GameCompleteRequest>({
      query: ({ gameId, ...body }) => ({
        url: `/games/${gameId}/complete`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["GameHistory"],
      // Optimistic update for coins/xp in profile
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(
          userApi.util.updateQueryData("getMe", undefined, (draft) => {
            draft.stats.coins = data.newTotalCoins;
            draft.stats.xp = data.newTotalXp;
            draft.stats.level = data.newLevel;
          })
        );
      },
    }),

    getGameHistory: build.query<GameHistoryResponse, GameHistoryParams>({
      query: (params) => ({ url: "/games/history", params }),
      providesTags: ["GameHistory"],
    }),
  }),
});
```

### `shopApi`

```ts
export const shopApi = createApi({
  reducerPath: "shopApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Catalog"],
  endpoints: (build) => ({

    getCatalog: build.query<ShopCatalogResponse, void>({
      query: () => "/shop/catalog",
      providesTags: ["Catalog"],
      keepUnusedDataFor: 3600,
    }),

    buyItem: build.mutation<BuyResponse, BuyRequest>({
      query: (body) => ({ url: "/shop/buy", method: "POST", body }),
      // Optimistic: deduct coins, add to inventory
      async onQueryStarted({ itemType, itemId }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(
          userApi.util.updateQueryData("getMe", undefined, (draft) => {
            draft.stats.coins = data.newCoins;
            if (itemType === "avatar") {
              draft.inventory.avatars.push(itemId);
              draft.avatarId = itemId;
            } else {
              draft.inventory.accessories.push(itemId);
              draft.accessoryId = itemId;
            }
          })
        );
      },
    }),
  }),
});
```

### `leaderboardApi`

```ts
export const leaderboardApi = createApi({
  reducerPath: "leaderboardApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Leaderboard"],
  endpoints: (build) => ({

    getLeaderboard: build.query<LeaderboardResponse, LeaderboardParams>({
      query: ({ period = "weekly", limit = 50, offset = 0 }) => ({
        url: "/leaderboard",
        params: { period, limit, offset },
      }),
      providesTags: (_, __, { period }) => [{ type: "Leaderboard", id: period }],
      keepUnusedDataFor: 60, // refresh every minute
    }),
  }),
});
```

### `questApi`

```ts
export const questApi = createApi({
  reducerPath: "questApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Quests"],
  endpoints: (build) => ({

    getDailyQuests: build.query<QuestsResponse, void>({
      query: () => "/quests/daily",
      providesTags: ["Quests"],
    }),

    claimQuest: build.mutation<ClaimQuestResponse, string>({
      query: (questId) => ({ url: `/quests/${questId}/claim`, method: "POST" }),
      invalidatesTags: ["Quests"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(
          userApi.util.updateQueryData("getMe", undefined, (draft) => {
            draft.stats.coins = data.newTotalCoins;
          })
        );
      },
    }),
  }),
});
```

### `dailyApi`

```ts
export const dailyApi = createApi({
  reducerPath: "dailyApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["DailyLogin"],
  endpoints: (build) => ({

    getDailyStatus: build.query<DailyStatusResponse, void>({
      query: () => "/daily",
      providesTags: ["DailyLogin"],
    }),

    claimDaily: build.mutation<ClaimDailyResponse, void>({
      query: () => ({ url: "/daily/claim", method: "POST" }),
      invalidatesTags: ["DailyLogin"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(
          userApi.util.updateQueryData("getMe", undefined, (draft) => {
            draft.stats.coins = data.newTotalCoins;
            draft.streak.current = data.newStreak;
            draft.streak.claimedToday = true;
          })
        );
      },
    }),
  }),
});
```

---

## 7. Authentication Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│  App     │          │  Redux   │          │  Backend │
│  Boot    │          │  Store   │          │          │
└────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │
     │ Check localStorage  │                     │
     │ for refreshToken    │                     │
     │────────────────────>│                     │
     │                     │                     │
     │ [Has token]         │ POST /auth/refresh  │
     │                     │────────────────────>│
     │                     │                     │
     │                     │ { accessToken, ... } │
     │                     │<────────────────────│
     │                     │                     │
     │ setCredentials()    │                     │
     │<────────────────────│                     │
     │                     │                     │
     │ GET /users/me       │                     │
     │────────────────────────────────────────-->│
     │                     │                     │
     │ Full profile data   │                     │
     │<──────────────────────────────────────────│
     │                     │                     │
     │ [No token]          │                     │
     │ Show login/register │                     │
     │                     │                     │
```

### Token Storage

- **Access token**: Redux store only (memory). 15-min expiry.
- **Refresh token**: `localStorage` (encrypted key) + Redux. 30-day expiry.
- On tab close/refresh: access token lost, refresh token persists → silent refresh on boot.

---

## 8. Migration Strategy

### Phase 1: Install & Setup (no backend needed)

1. `npm install @reduxjs/toolkit react-redux`
2. Create store with `uiSlice` + `authSlice`
3. Move client-only UI state (tabs, toasts, modals) from `App.tsx` useState → `uiSlice`
4. Wrap app with `<Provider store={store}>`
5. **Zero API calls yet** — everything still works from localStorage

### Phase 2: API Slices (mock backend or real)

1. Create RTK Query API slices (`authApi`, `userApi`, etc.)
2. Add `baseQueryWithReauth`
3. Create shared TypeScript types in `src/types/api.ts`

### Phase 3: Replace localStorage reads

For each feature, one at a time:

| Order | Feature | Replace | With |
|-------|---------|---------|------|
| 1 | Auth | localStorage password | `authApi.login/register` |
| 2 | Profile | `useLocalStorage` for name/email/avatar | `userApi.getMe` + `updateProfile` |
| 3 | Preferences | `useLocalStorage` for theme/sound/notif | `userApi.updatePreferences` |
| 4 | Coins/Score/XP | `useLocalStorage` for coins/score | `userApi.getMe` (server-authoritative) |
| 5 | Energy | `useState` for energy | `userApi.getEnergy` + `restoreEnergy` (pupil test only) |
| 6 | Shop | `useLocalStorage` for inventory | `shopApi.getCatalog` + `buyItem` |
| 7 | Games | Hardcoded `data/games.ts` | `gameApi.getGameCatalog` |
| 8 | Game results | `onEarnCoins` callback | `gameApi.completeGame` |
| 9 | Daily Login | `useLocalStorage` for streak/claimed | `dailyApi` |
| 10 | Leaderboard | Hardcoded `leaderboardData` | `leaderboardApi` |
| 11 | Quests | Hardcoded `dailyQuests` | `questApi.getDailyQuests` |
| 12 | Pupil Test | fire-and-forget | `POST /pupil-test/start` + `complete` |

### Phase 4: Remove localStorage fallbacks

- Delete `useLocalStorage` hook
- Delete `src/constants.ts` STORAGE_KEYS
- Delete hardcoded data from `data/avatars.ts` and `data/games.ts`

---

## 9. Error Handling

### RTK Query Error Shape

```ts
interface ApiError {
  status: number;
  data: {
    code: string;          // machine-readable: "INSUFFICIENT_COINS"
    message: string;       // human-readable: "Not enough coins"
    field?: string;        // optional: which field failed validation
  };
}
```

### Standard Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `UNAUTHORIZED` | 401 | Missing/invalid token |
| `TOKEN_EXPIRED` | 401 | Access token expired (triggers refresh) |
| `FORBIDDEN` | 403 | Valid token but no permission |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 422 | Request body failed validation |
| `INSUFFICIENT_COINS` | 400 | Can't afford purchase |
| `INSUFFICIENT_ENERGY` | 400 | No energy to play |
| `ALREADY_OWNED` | 409 | Item already in inventory |
| `ALREADY_CLAIMED` | 400 | Daily reward already claimed |
| `QUEST_NOT_COMPLETE` | 400 | Quest progress < target |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Unexpected server error |

### Client-Side Error Middleware

```ts
// src/store/error-middleware.ts
import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { Middleware } from "@reduxjs/toolkit";

export const errorMiddleware: Middleware = (storeApi) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const err = action.payload as ApiError;

    // Auto-show toast for known errors
    const message = err.data?.message || "Something went wrong";
    storeApi.dispatch(addToast({ message, type: "error" }));

    // Auto-logout on auth errors (after refresh attempt)
    if (err.status === 401 && err.data?.code === "UNAUTHORIZED") {
      storeApi.dispatch(clearCredentials());
    }
  }
  return next(action);
};
```

---

## 10. Real-Time Features

### WebSocket Events (optional, Phase 5)

```ts
// Connection: ws://api.gamerify.com/ws?token=<accessToken>

// Server → Client events:
interface WSEvents {
  "leaderboard:update": { period: string; topChange: boolean };
  "quest:progress":    { questId: string; progress: number; completed: boolean };
  "achievement:unlock": { id: string; label: string; icon: string };
}
```

### Energy Model

Energy has **no automatic regen**. It is only restored to max (5) when a pupil test is completed. This means no polling or timers are needed — energy state is always known from the last server response.

---

## 11. Security Considerations

### Server-Authoritative Values

These values **must never be trusted from the client**:

- **Coins**: Only modified server-side (game completion, daily claim, purchases)
- **XP / Level**: Computed server-side from game sessions
- **Score**: Aggregated server-side
- **Inventory**: Server validates ownership before equip
- **Energy**: Server-persisted, only restored via pupil test (no client-side regen)
- **Game scores**: Server should validate plausibility (e.g., max score per game, minimum duration)

### Anti-Cheat (Game Score Validation)

```ts
// Server-side validation example for game completion
function validateGameScore(gameId: string, score: number, durationSecs: number): boolean {
  const game = gameCatalog[gameId];
  if (!game) return false;

  // Score must be 0–100
  if (score < 0 || score > 100) return false;

  // Minimum duration check (can't complete a 3-min game in 2 seconds)
  const minDuration = { "memory-match": 15, "reaction-time": 10, ... };
  if (durationSecs < (minDuration[gameId] ?? 5)) return false;

  return true;
}
```

### Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `POST /auth/login` | 5 req / min per IP |
| `POST /auth/register` | 3 req / hour per IP |
| `POST /games/*/complete` | 20 req / hour per user |
| `POST /shop/buy` | 10 req / min per user |
| `POST /daily/claim` | 5 req / min per user |
| General authenticated | 120 req / min per user |

### CORS

```ts
{
  origin: [process.env.FRONTEND_URL],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
}
```

---

## 12. File Structure

```
src/
  store/
    index.ts                  # configureStore + middleware
    base-query.ts             # fetchBaseQuery with re-auth
    error-middleware.ts        # global error toast handler
    auth-slice.ts             # auth state (tokens, userId)
    ui-slice.ts               # client-only UI state
    api/
      auth-api.ts             # register, login, refresh, logout
      user-api.ts             # profile, preferences, energy, skills
      game-api.ts             # catalog, complete, history
      shop-api.ts             # catalog, buy
      leaderboard-api.ts      # rankings
      quest-api.ts            # daily quests, claim
      daily-api.ts            # streak, claim daily
      pupil-test-api.ts       # start, complete
  types/
    api.ts                    # shared request/response types
    models.ts                 # UserProfile, GameDef, etc.
  hooks/
    use-auth.ts               # useAuth() — wraps auth selectors + actions
    use-sound.ts              # (unchanged — client-only)
    use-theme.ts              # reads themeId from profile cache instead of localStorage
  components/
    auth-guard/index.tsx      # redirects to login if unauthenticated
    ...existing components
  pages/
    login.tsx                 # new
    register.tsx              # new
    ...existing pages
```

---

## Summary

| What | Current | After Backend |
|------|---------|---------------|
| Auth | None (name in localStorage) | JWT with refresh flow |
| State | 14 localStorage keys | Redux + RTK Query cache |
| Coins/XP | Client-side, easily cheatable | Server-authoritative |
| Energy | Resets on refresh | Server-persisted, restored only via pupil test |
| Leaderboard | Hardcoded 10 players | Real rankings from game_sessions |
| Quests | Hardcoded progress | Tracked server-side, auto-updated |
| Game catalog | Hardcoded in `data/` | API-driven, admin-manageable |
| Shop | Client-side transactions | Server-validated purchases |
| Profile | localStorage only | Synced across devices |

This document should serve as the complete specification for building the backend and wiring it into the existing frontend.
