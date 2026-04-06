import { useState, useCallback, useEffect, useRef } from "react";
import { useSound } from "./use-sound";

export type BallColor = string;

export interface Tube {
  id: number;
  balls: BallColor[]; // bottom to top
}

export interface BallSortConfig {
  numColors: number;
  numTubes: number;
  ballsPerTube: number;
  timeLimitSec: number | null;
  maxScore: number;
}

const DEFAULT_CONFIG: BallSortConfig = {
  numColors: 3,
  numTubes: 5,
  ballsPerTube: 4,
  timeLimitSec: 150,
  maxScore: 100,
};

export const BALL_COLORS = [
  "#22c55e", // green
  "#f97316", // orange
  "#3b82f6", // blue
  "#eab308", // yellow
  "#ef4444", // red
  "#a855f7", // purple
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f43f5e", // rose
  "#84cc16", // lime
  "#6366f1", // indigo
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isSolvedFlat(balls: BallColor[], numColors: number, perTube: number): boolean {
  for (let t = 0; t < numColors; t++) {
    const seg = balls.slice(t * perTube, (t + 1) * perTube);
    if (!seg.every((b) => b === seg[0])) return false;
  }
  return true;
}

/** Check that the puzzle is not trivially stuck (has valid moves and mixed tubes) */
function isViable(tubes: Tube[], ballsPerTube: number): boolean {
  let mixedTubes = 0;
  for (const tube of tubes) {
    if (tube.balls.length > 0 && !tube.balls.every((b) => b === tube.balls[0])) {
      mixedTubes++;
    }
  }
  // At least 2 mixed tubes to make it an actual puzzle
  if (mixedTubes < 2) return false;
  // Must have at least one valid move
  const hasEmpty = tubes.some((t) => t.balls.length === 0);
  const hasNonFull = tubes.some((t) => t.balls.length > 0 && t.balls.length < ballsPerTube);
  return hasEmpty || hasNonFull;
}

/** BFS solvability check (50k step limit) */
function isSolvable(tubes: Tube[], ballsPerTube: number): boolean {
  const encode = (ts: Tube[]) => ts.map((t) => t.balls.join(",")).join("|");
  const visited = new Set<string>();
  const queue = [tubes.map((t) => ({ ...t, balls: [...t.balls] }))];
  visited.add(encode(tubes));
  let steps = 0;
  while (queue.length > 0 && steps < 50000) {
    steps++;
    const cur = queue.shift()!;
    if (checkComplete(cur, ballsPerTube)) return true;
    for (let f = 0; f < cur.length; f++) {
      if (cur[f].balls.length === 0) continue;
      const ball = cur[f].balls[cur[f].balls.length - 1];
      for (let t = 0; t < cur.length; t++) {
        if (t === f) continue;
        if (cur[t].balls.length >= ballsPerTube) continue;
        const next = cur.map((tb) => ({ ...tb, balls: [...tb.balls] }));
        next[f].balls.pop();
        next[t].balls.push(ball);
        const key = encode(next);
        if (!visited.has(key)) { visited.add(key); queue.push(next); }
      }
    }
  }
  return false;
}

function generatePuzzle(config: BallSortConfig): Tube[] {
  const { numColors, numTubes, ballsPerTube } = config;
  const colors = BALL_COLORS.slice(0, numColors);

  let allBalls: BallColor[] = [];
  for (const color of colors) {
    for (let i = 0; i < ballsPerTube; i++) allBalls.push(color);
  }

  let tubes: Tube[] = [];
  let attempts = 0;
  do {
    allBalls = shuffle(allBalls);
    attempts++;
    tubes = [];
    for (let t = 0; t < numColors; t++) {
      tubes.push({ id: t, balls: allBalls.slice(t * ballsPerTube, (t + 1) * ballsPerTube) });
    }
    for (let t = numColors; t < numTubes; t++) {
      tubes.push({ id: t, balls: [] });
    }
  } while (
    attempts < 200 &&
    (isSolvedFlat(allBalls, numColors, ballsPerTube) || !isViable(tubes, ballsPerTube) || !isSolvable(tubes, ballsPerTube))
  );

  return tubes;
}

function checkComplete(tubes: Tube[], ballsPerTube: number): boolean {
  return tubes.every(
    (t) =>
      t.balls.length === 0 ||
      (t.balls.length === ballsPerTube && t.balls.every((b) => b === t.balls[0])),
  );
}

function canDrop(_ball: BallColor, target: Tube, ballsPerTube: number): boolean {
  return target.balls.length < ballsPerTube;
}

export function useBallSort(onComplete: (score: number) => void, config?: BallSortConfig) {
  const sfx = useSound();
  const cfg = config ?? DEFAULT_CONFIG;

  /* ── State ── */
  const [tubes, setTubes] = useState<Tube[]>(() => generatePuzzle(cfg));
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(cfg.timeLimitSec ?? 0);
  const [phase, setPhase] = useState<"playing" | "done">("playing");
  const [lastMoveResult, setLastMoveResult] = useState<"success" | "error" | null>(null);
  const [started, setStarted] = useState(false);

  /* ── Refs ── */
  const tubesRef = useRef(tubes);
  const timerRef = useRef(cfg.timeLimitSec ?? 0);
  const phaseRef = useRef<"playing" | "done">("playing");
  const selectedRef = useRef<number | null>(null);
  const draggingRef = useRef<number | null>(null);
  const movesRef = useRef(0);
  const startedRef = useRef(false);
  const unmounted = useRef(false);

  tubesRef.current = tubes;
  selectedRef.current = selectedTube;
  draggingRef.current = draggingFrom;

  useEffect(() => {
    unmounted.current = false;
    return () => { unmounted.current = true; };
  }, []);

  // Clear feedback
  useEffect(() => {
    if (!lastMoveResult) return;
    const t = setTimeout(() => {
      if (!unmounted.current) setLastMoveResult(null);
    }, 600);
    return () => clearTimeout(t);
  }, [lastMoveResult]);

  // Timer (only if there's a time limit)
  useEffect(() => {
    if (cfg.timeLimitSec === null) return;
    if (phaseRef.current === "done") return;
    const id = setInterval(() => {
      if (phaseRef.current !== "playing" || !startedRef.current) return;
      timerRef.current -= 1;
      if (!unmounted.current) setTimer(timerRef.current);
      if (timerRef.current <= 0) {
        phaseRef.current = "done";
        if (!unmounted.current) setPhase("done");
        // Score based on moves made — partial credit
        const score = computeScore(movesRef.current, cfg);
        onComplete(score);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [onComplete, cfg]);

  function computeScore(moveCount: number, c: BallSortConfig): number {
    // Optimal ≈ (numColors - 1) * ballsPerTube (realistic good play)
    const optimal = Math.max(1, (c.numColors - 1) * c.ballsPerTube);
    // Score degrades as moves increase beyond optimal, hitting 0 at 3× optimal
    const ratio = Math.max(0, 1 - Math.max(0, moveCount - optimal) / (optimal * 2));
    return Math.round(c.maxScore * ratio);
  }

  const executeMove = useCallback(
    (fromIdx: number, toIdx: number): boolean => {
      if (fromIdx === toIdx) return false;
      if (phaseRef.current !== "playing") return false;

      const currentTubes = tubesRef.current;
      const bpt = cfg.ballsPerTube;

      const from = currentTubes[fromIdx];
      if (!from || from.balls.length === 0) return false;

      const ball = from.balls[from.balls.length - 1];
      const to = currentTubes[toIdx];
      if (!to) return false;

      if (!canDrop(ball, to, bpt)) return false;

      const newTubes = currentTubes.map((t) => ({ ...t, balls: [...t.balls] }));
      newTubes[fromIdx].balls.pop();
      newTubes[toIdx].balls.push(ball);

      tubesRef.current = newTubes;
      movesRef.current += 1;
      if (!startedRef.current) { startedRef.current = true; setStarted(true); }
      setTubes(newTubes);
      setMoves(movesRef.current);
      setSelectedTube(null);
      selectedRef.current = null;
      setLastMoveResult("success");
      sfx("success");

      // Check puzzle completion
      if (checkComplete(newTubes, bpt)) {
        phaseRef.current = "done";
        setPhase("done");
        const score = computeScore(movesRef.current, cfg);
        onComplete(score);
      }

      return true;
    },
    [sfx, onComplete, cfg],
  );

  const handleTubeTap = useCallback(
    (tubeIdx: number) => {
      if (phaseRef.current !== "playing") return;
      if (draggingRef.current !== null) return;

      const currentTubes = tubesRef.current;
      const sel = selectedRef.current;

      if (sel === null) {
        if (currentTubes[tubeIdx] && currentTubes[tubeIdx].balls.length > 0) {
          sfx("tap");
          selectedRef.current = tubeIdx;
          setSelectedTube(tubeIdx);
        }
        return;
      }

      if (sel === tubeIdx) {
        sfx("tap");
        selectedRef.current = null;
        setSelectedTube(null);
        return;
      }

      if (!executeMove(sel, tubeIdx)) {
        sfx("error");
        setLastMoveResult("error");
        selectedRef.current = null;
        setSelectedTube(null);
      }
    },
    [sfx, executeMove],
  );

  const handleDragStart = useCallback(
    (tubeIdx: number) => {
      if (phaseRef.current !== "playing") return;
      const currentTubes = tubesRef.current;
      if (!currentTubes[tubeIdx] || currentTubes[tubeIdx].balls.length === 0) return;
      sfx("tap");
      draggingRef.current = tubeIdx;
      setDraggingFrom(tubeIdx);
      selectedRef.current = null;
      setSelectedTube(null);
    },
    [sfx],
  );

  const handleDragEnd = useCallback(
    (fromIdx: number, dropTargetIdx: number | null) => {
      draggingRef.current = null;
      setDraggingFrom(null);
      if (dropTargetIdx === null || dropTargetIdx === fromIdx) return;
      if (!executeMove(fromIdx, dropTargetIdx)) {
        sfx("error");
        setLastMoveResult("error");
      }
    },
    [executeMove, sfx],
  );

  const handleDragCancel = useCallback(() => {
    draggingRef.current = null;
    setDraggingFrom(null);
  }, []);

  const getValidDropTargets = useCallback((): Set<number> => {
    const dIdx = draggingRef.current;
    if (dIdx === null) return new Set();
    const currentTubes = tubesRef.current;
    const from = currentTubes[dIdx];
    if (!from || from.balls.length === 0) return new Set();
    const ball = from.balls[from.balls.length - 1];
    const bpt = cfg.ballsPerTube;
    const valid = new Set<number>();
    currentTubes.forEach((tube, idx) => {
      if (idx !== dIdx && canDrop(ball, tube, bpt)) valid.add(idx);
    });
    return valid;
  }, [draggingFrom, tubes, cfg.ballsPerTube]); // eslint-disable-line react-hooks/exhaustive-deps

  const getSelectedDropTargets = useCallback((): Set<number> => {
    const sIdx = selectedRef.current;
    if (sIdx === null) return new Set();
    const currentTubes = tubesRef.current;
    const from = currentTubes[sIdx];
    if (!from || from.balls.length === 0) return new Set();
    const ball = from.balls[from.balls.length - 1];
    const bpt = cfg.ballsPerTube;
    const valid = new Set<number>();
    currentTubes.forEach((tube, idx) => {
      if (idx !== sIdx && canDrop(ball, tube, bpt)) valid.add(idx);
    });
    return valid;
  }, [selectedTube, tubes, cfg.ballsPerTube]); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return {
    tubes,
    selectedTube,
    draggingFrom,
    moves,
    score: computeScore(movesRef.current, cfg),
    started,
    timer,
    phase,
    stars: 0, // calculated externally via starScores
    ballsPerTube: cfg.ballsPerTube,
    lastMoveResult,
    handleTubeTap,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    getValidDropTargets,
    getSelectedDropTargets,
    fmt,
    hasTimeLimit: cfg.timeLimitSec !== null,
    totalTime: cfg.timeLimitSec ?? 0,
  };
}
