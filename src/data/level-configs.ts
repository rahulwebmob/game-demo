import type { GameId } from "./games";

/* ─── Shared ──────────────────────────────────────────── */

export const TOTAL_LEVELS = 50;

export interface BaseLevelConfig {
  level: number;
  isEndless: boolean;
  timeLimitSec: number | null;
  maxScore: number;
  starScores: [number, number]; // [3-star min, 2-star min]
  coinReward: [number, number, number]; // [3-star, 2-star, 1-star]
}

/* ─── Per-game configs ────────────────────────────────── */

export interface MemoryMatchLevel extends BaseLevelConfig {
  rows: number;
  cols: number;
  pairCount: number;
}

export interface ColorVisionLevel extends BaseLevelConfig {
  rounds: number;
  startGrid: number;
  startDiff: number;
}

export interface ReactionTimeLevel extends BaseLevelConfig {
  rounds: number;
  minDelay: number;
  maxDelay: number;
}

export interface PatternRecallLevel extends BaseLevelConfig {
  gridCols: number;
  gridSize: number;
  startLength: number;
  maxRounds: number;
  lives: number;
  showMs: number;
  gapMs: number;
}

export interface NumberSequenceLevel extends BaseLevelConfig {
  rounds: number;
  seqLength: number;
  allowedTypes: ("arithmetic" | "multiply" | "addIncreasing" | "quadratic" | "fibonacci")[];
}

export interface ContrastTestLevel extends BaseLevelConfig {
  rounds: number;
  startGrid: number;
  startDiff: number;
}

export interface BallSortLevel extends BaseLevelConfig {
  numColors: number;
  numTubes: number;
  ballsPerTube: number;
}

export type GameLevelConfig =
  | MemoryMatchLevel
  | ColorVisionLevel
  | ReactionTimeLevel
  | PatternRecallLevel
  | NumberSequenceLevel
  | ContrastTestLevel
  | BallSortLevel;

/* ─── Helpers ─────────────────────────────────────────── */

/** Linear interpolation */
function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

/** Clamp */
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/** Progress 0→1 across 50 levels, continues past 1 for endless */
function progress(level: number) {
  return (level - 1) / (TOTAL_LEVELS - 1);
}

/** Base config shared by all games */
function base(level: number, maxScore: number): BaseLevelConfig {
  const isEndless = level > TOTAL_LEVELS;
  const t = progress(level);

  // 3-star: 60% at level 1 → 85% at level 50+
  const three = Math.round(maxScore * clamp(0.6 + t * 0.25, 0.6, 0.85));
  // 2-star: 35% at level 1 → 55% at level 50+
  const two = Math.round(maxScore * clamp(0.35 + t * 0.2, 0.35, 0.55));

  const coinBase = 5 + Math.floor(level * 0.8);
  return {
    level,
    isEndless,
    timeLimitSec: null,
    maxScore,
    starScores: [three, two],
    coinReward: [coinBase * 3, coinBase * 2, coinBase],
  };
}

/* ─── Memory Match ────────────────────────────────────── */

function memoryMatch(level: number): MemoryMatchLevel {
  const t = progress(level);
  // Pairs: 3 → 20
  const pairCount = clamp(lerp(3, 20, t), 3, 24);
  // Find best grid that fits pairCount * 2 cards
  const totalCards = pairCount * 2;
  let cols = 4;
  if (totalCards > 36) cols = 8;
  else if (totalCards > 24) cols = 7;
  else if (totalCards > 16) cols = 6;
  else if (totalCards > 12) cols = 5;
  const rows = Math.ceil(totalCards / cols);
  // Time limit: none for first 5, then shrinks from 120s → 55s
  const timeLimitSec = level <= 5 ? null : Math.max(55, lerp(120, 55, (level - 5) / 45));
  const maxScore = 100 + (level - 1) * 4; // scales with difficulty

  return { ...base(level, maxScore), rows, cols, pairCount, timeLimitSec };
}

/* ─── Color Vision ────────────────────────────────────── */

function colorVision(level: number): ColorVisionLevel {
  const t = progress(level);
  const rounds = clamp(lerp(5, 14, t), 5, 16);
  const startGrid = clamp(lerp(3, 7, t), 3, 9); // starting grid size
  const startDiff = clamp(lerp(28, 4, t), 2, 28); // starting hue diff (gets harder)
  const maxScore = rounds * (rounds + 1) * 5; // sum of (round * 10)

  return { ...base(level, maxScore), rounds, startGrid, startDiff };
}

/* ─── Reaction Time ───────────────────────────────────── */

function reactionTime(level: number): ReactionTimeLevel {
  const t = progress(level);
  const rounds = clamp(lerp(3, 8, t), 3, 10);
  const minDelay = clamp(lerp(1500, 800, t), 600, 1500); // less predictable
  const maxDelay = clamp(lerp(4500, 2500, t), 2000, 4500);
  const maxScore = 100;

  return { ...base(level, maxScore), rounds, minDelay, maxDelay };
}

/* ─── Pattern Recall ──────────────────────────────────── */

function patternRecall(level: number): PatternRecallLevel {
  const t = progress(level);
  const gridCols = clamp(lerp(3, 5, t), 3, 6);
  const gridSize = gridCols * gridCols;
  const startLength = clamp(lerp(2, 5, t), 2, 7);
  const maxRounds = clamp(lerp(5, 10, t), 5, 12);
  const lives = clamp(lerp(3, 2, t), 2, 3);
  const showMs = clamp(lerp(650, 280, t), 200, 650);
  const gapMs = clamp(lerp(350, 150, t), 120, 350);
  const maxScore = maxRounds * (maxRounds + 1) / 2 * 15;

  return {
    ...base(level, maxScore),
    gridCols, gridSize, startLength, maxRounds, lives, showMs, gapMs,
  };
}

/* ─── Number Sequence ─────────────────────────────────── */

function numberSequence(level: number): NumberSequenceLevel {
  const t = progress(level);
  const rounds = clamp(lerp(5, 10, t), 5, 12);
  const seqLength = clamp(lerp(4, 8, t), 4, 10);

  const allowedTypes: NumberSequenceLevel["allowedTypes"] = ["arithmetic"];
  if (level >= 6) allowedTypes.push("multiply");
  if (level >= 15) allowedTypes.push("addIncreasing");
  if (level >= 30) allowedTypes.push("quadratic");
  if (level >= 40) allowedTypes.push("fibonacci");

  const timeLimitSec = level <= 8 ? null : Math.max(20, lerp(45, 20, (level - 8) / 42));
  const maxScore = rounds * (rounds + 1) / 2 * 12;

  return { ...base(level, maxScore), rounds, seqLength, allowedTypes, timeLimitSec };
}

/* ─── Contrast Test ───────────────────────────────────── */

function contrastTest(level: number): ContrastTestLevel {
  const t = progress(level);
  const rounds = clamp(lerp(6, 15, t), 6, 18);
  const startGrid = clamp(lerp(2, 6, t), 2, 8);
  const startDiff = clamp(lerp(22, 2, t), 1.5, 22);
  const maxScore = rounds * 10 + rounds * (rounds - 1) / 2 * 3;

  return { ...base(level, maxScore), rounds, startGrid, startDiff };
}

/* ─── Ball Sort ───────────────────────────────────────── */

function ballSort(level: number): BallSortLevel {
  const t = progress(level);
  const numColors = clamp(lerp(2, 10, t), 2, 12);
  const numTubes = numColors + clamp(Math.round(2 - t * 0.8), 1, 3);
  const ballsPerTube = clamp(lerp(3, 5, t), 3, 6);
  const timeLimitSec = level <= 3 ? null : Math.max(60, lerp(180, 60, (level - 3) / 47));
  // Score: base points scale with complexity
  const maxScore = numColors * ballsPerTube * 5;

  return {
    ...base(level, maxScore),
    numColors, numTubes: Math.max(numTubes, numColors + 2), ballsPerTube, timeLimitSec,
  };
}

/* ─── Public API ──────────────────────────────────────── */

const generators: Record<GameId, (level: number) => GameLevelConfig> = {
  "memory-match": memoryMatch,
  "color-vision": colorVision,
  "reaction-time": reactionTime,
  "pattern-recall": patternRecall,
  "number-sequence": numberSequence,
  "contrast-test": contrastTest,
  "ball-sort": ballSort,
};

export function getLevelConfig(gameId: GameId, level: number): GameLevelConfig {
  return generators[gameId](level);
}

/** Get star rating from score */
export function getStars(config: BaseLevelConfig, score: number): number {
  if (score >= config.starScores[0]) return 3;
  if (score >= config.starScores[1]) return 2;
  return 1;
}
