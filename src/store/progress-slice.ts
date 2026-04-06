import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GameId } from "../data/games";
import { TOTAL_LEVELS } from "../data/level-configs";

/* ─── Helpers ─────────────────────────────────────────── */

const STORAGE_KEY = "gamerify-progress";

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultState();
  } catch {
    return defaultState();
  }
}

function save(state: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ─── State shape ─────────────────────────────────────── */

export interface LevelResult {
  stars: number;       // 1-3
  bestScore: number;
  completedAt: string; // ISO timestamp
}

export interface GameProgress {
  levels: Record<number, LevelResult>;
  currentLevel: number;       // highest unlocked (1-based)
  endlessUnlocked: boolean;
  endlessHighScore: number;
  endlessHighLevel: number;   // furthest endless level reached
  totalStars: number;         // cached sum
}

export interface ProgressState {
  games: Record<GameId, GameProgress>;
}

const ALL_GAME_IDS: GameId[] = [
  "memory-match", "color-vision", "reaction-time",
  "pattern-recall", "number-sequence", "contrast-test", "ball-sort",
];

function freshGameProgress(): GameProgress {
  return {
    levels: {},
    currentLevel: 1,
    endlessUnlocked: false,
    endlessHighScore: 0,
    endlessHighLevel: 0,
    totalStars: 0,
  };
}

function defaultState(): ProgressState {
  const games = {} as Record<GameId, GameProgress>;
  for (const id of ALL_GAME_IDS) games[id] = freshGameProgress();
  return { games };
}

function recalcStars(gp: GameProgress) {
  gp.totalStars = Object.values(gp.levels).reduce((s, l) => s + l.stars, 0);
}

/* ─── Slice ───────────────────────────────────────────── */

const progressSlice = createSlice({
  name: "progress",
  initialState: load(),
  reducers: {
    completeLevel(
      state,
      action: PayloadAction<{
        gameId: GameId;
        level: number;
        score: number;
        stars: number;
      }>,
    ) {
      const { gameId, level, score, stars } = action.payload;
      const gp = state.games[gameId];
      if (!gp) return;

      const existing = gp.levels[level];
      // Only update if new score is better
      if (!existing || score > existing.bestScore) {
        gp.levels[level] = {
          stars: existing ? Math.max(existing.stars, stars) : stars,
          bestScore: existing ? Math.max(existing.bestScore, score) : score,
          completedAt: new Date().toISOString(),
        };
      } else if (stars > existing.stars) {
        existing.stars = stars;
      }

      // Unlock next level
      if (level >= gp.currentLevel && level <= TOTAL_LEVELS) {
        gp.currentLevel = Math.min(level + 1, TOTAL_LEVELS + 1);
      }

      // Unlock endless
      if (level >= TOTAL_LEVELS) {
        gp.endlessUnlocked = true;
      }

      recalcStars(gp);
      save(state);
    },

    completeEndless(
      state,
      action: PayloadAction<{
        gameId: GameId;
        score: number;
        levelReached: number;
      }>,
    ) {
      const { gameId, score, levelReached } = action.payload;
      const gp = state.games[gameId];
      if (!gp) return;

      if (score > gp.endlessHighScore) gp.endlessHighScore = score;
      if (levelReached > gp.endlessHighLevel) gp.endlessHighLevel = levelReached;
      save(state);
    },

    resetGameProgress(state, action: PayloadAction<GameId>) {
      state.games[action.payload] = freshGameProgress();
      save(state);
    },

    resetAllProgress(state) {
      const fresh = defaultState();
      state.games = fresh.games;
      save(state);
    },
  },
});

export const {
  completeLevel,
  completeEndless,
  resetGameProgress,
  resetAllProgress,
} = progressSlice.actions;

export default progressSlice.reducer;

/* ─── Selectors ───────────────────────────────────────── */

export const selectGameProgress = (state: { progress: ProgressState }, gameId: GameId) =>
  state.progress.games[gameId];

export const selectIsLevelUnlocked = (
  state: { progress: ProgressState },
  gameId: GameId,
  level: number,
) => {
  const gp = state.progress.games[gameId];
  return level <= gp.currentLevel;
};

export const selectTotalStars = (state: { progress: ProgressState }) =>
  Object.values(state.progress.games).reduce((s, gp) => s + gp.totalStars, 0);
