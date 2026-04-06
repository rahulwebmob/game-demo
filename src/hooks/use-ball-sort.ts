import { useState, useCallback, useEffect, useRef } from "react";
import { useSound } from "./use-sound";

export type BallColor = string;

export interface Tube {
  id: number;
  balls: BallColor[]; // bottom to top
}

interface LevelConfig {
  numColors: number;
  numTubes: number;
  ballsPerTube: number;
}

const LEVELS: LevelConfig[] = [
  { numColors: 2, numTubes: 3, ballsPerTube: 4 },
  { numColors: 3, numTubes: 4, ballsPerTube: 4 },
  { numColors: 3, numTubes: 5, ballsPerTube: 4 },
  { numColors: 4, numTubes: 5, ballsPerTube: 4 },
  { numColors: 4, numTubes: 6, ballsPerTube: 4 },
  { numColors: 5, numTubes: 6, ballsPerTube: 4 },
];

export const BALL_COLORS = [
  "#22c55e", // green
  "#f97316", // orange
  "#3b82f6", // blue
  "#eab308", // yellow
  "#ef4444", // red
  "#a855f7", // purple
  "#06b6d4", // cyan
  "#ec4899", // pink
];

const POINTS_PER_LEVEL = 25;
const TOTAL_TIME = 150;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isSolvedFlat(balls: BallColor[], numTubes: number, perTube: number): boolean {
  for (let t = 0; t < numTubes; t++) {
    const seg = balls.slice(t * perTube, (t + 1) * perTube);
    if (!seg.every((b) => b === seg[0])) return false;
  }
  return true;
}

function generateLevel(config: LevelConfig): Tube[] {
  const { numColors, numTubes, ballsPerTube } = config;
  const colors = BALL_COLORS.slice(0, numColors);

  let allBalls: BallColor[] = [];
  for (const color of colors) {
    for (let i = 0; i < ballsPerTube; i++) allBalls.push(color);
  }

  let attempts = 0;
  do {
    allBalls = shuffle(allBalls);
    attempts++;
  } while (attempts < 100 && isSolvedFlat(allBalls, numColors, ballsPerTube));

  const tubes: Tube[] = [];
  for (let t = 0; t < numColors; t++) {
    tubes.push({ id: t, balls: allBalls.slice(t * ballsPerTube, (t + 1) * ballsPerTube) });
  }
  for (let t = numColors; t < numTubes; t++) {
    tubes.push({ id: t, balls: [] });
  }
  return tubes;
}

function checkLevelComplete(tubes: Tube[], ballsPerTube: number): boolean {
  return tubes.every(
    (t) =>
      t.balls.length === 0 ||
      (t.balls.length === ballsPerTube && t.balls.every((b) => b === t.balls[0])),
  );
}

/**
 * Can this ball be placed on top of targetTube?
 * Only rule: tube must have space. Color matching is only
 * checked for the final win condition, not during play.
 */
function canDrop(_ball: BallColor, target: Tube, ballsPerTube: number): boolean {
  return target.balls.length < ballsPerTube;
}

export function useBallSort(onComplete: (score: number) => void) {
  const sfx = useSound();

  /* ── State ── */
  const [level, setLevel] = useState(1);
  const [tubes, setTubes] = useState<Tube[]>(() => generateLevel(LEVELS[0]));
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(TOTAL_TIME);
  const [phase, setPhase] = useState<"playing" | "level-complete" | "done">("playing");
  const [lastMoveResult, setLastMoveResult] = useState<"success" | "error" | null>(null);

  /* ── Refs (always hold the latest values — immune to stale closures) ── */
  const tubesRef = useRef(tubes);
  const levelRef = useRef(level);
  const scoreRef = useRef(0);
  const timerRef = useRef(TOTAL_TIME);
  const phaseRef = useRef<"playing" | "level-complete" | "done">("playing");
  const selectedRef = useRef<number | null>(null);
  const draggingRef = useRef<number | null>(null);
  const unmounted = useRef(false);

  // Keep refs in sync with state
  tubesRef.current = tubes;
  levelRef.current = level;
  selectedRef.current = selectedTube;
  draggingRef.current = draggingFrom;

  const getBallsPerTube = () => LEVELS[Math.min(levelRef.current - 1, LEVELS.length - 1)].ballsPerTube;

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

  // Timer
  useEffect(() => {
    if (phaseRef.current === "done") return;
    const id = setInterval(() => {
      if (phaseRef.current !== "playing") return;
      timerRef.current -= 1;
      if (!unmounted.current) setTimer(timerRef.current);
      if (timerRef.current <= 0) {
        phaseRef.current = "done";
        if (!unmounted.current) setPhase("done");
        onComplete(scoreRef.current);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [onComplete]);

  /**
   * Core move function. Reads LATEST state from refs.
   * Returns true if the move was valid and executed, false otherwise.
   */
  const executeMove = useCallback(
    (fromIdx: number, toIdx: number): boolean => {
      if (fromIdx === toIdx) return false;
      if (phaseRef.current !== "playing") return false;

      // Read latest tubes from ref
      const currentTubes = tubesRef.current;
      const bpt = getBallsPerTube();

      const from = currentTubes[fromIdx];
      if (!from || from.balls.length === 0) return false;

      const ball = from.balls[from.balls.length - 1];

      const to = currentTubes[toIdx];
      if (!to) return false;

      // ── VALIDATE ──
      if (!canDrop(ball, to, bpt)) return false;

      // ── EXECUTE ──
      const newTubes = currentTubes.map((t) => ({ ...t, balls: [...t.balls] }));
      newTubes[fromIdx].balls.pop();
      newTubes[toIdx].balls.push(ball);

      // Commit state
      tubesRef.current = newTubes; // update ref immediately so next call sees it
      setTubes(newTubes);
      setMoves((m) => m + 1);
      setTotalMoves((m) => m + 1);
      setSelectedTube(null);
      selectedRef.current = null;
      setLastMoveResult("success");
      sfx("success");

      // Check level completion
      if (checkLevelComplete(newTubes, bpt)) {
        const lvl = levelRef.current;
        const pts = lvl * POINTS_PER_LEVEL;
        scoreRef.current += pts;
        setScore(scoreRef.current);

        if (lvl >= LEVELS.length) {
          phaseRef.current = "done";
          setPhase("done");
          onComplete(scoreRef.current);
        } else {
          phaseRef.current = "level-complete";
          setPhase("level-complete");
          setTimeout(() => {
            if (unmounted.current) return;
            const next = lvl + 1;
            const nextTubes = generateLevel(LEVELS[next - 1]);
            levelRef.current = next;
            tubesRef.current = nextTubes;
            setLevel(next);
            setTubes(nextTubes);
            setSelectedTube(null);
            selectedRef.current = null;
            setMoves(0);
            phaseRef.current = "playing";
            setPhase("playing");
          }, 1400);
        }
      }

      return true;
    },
    [sfx, onComplete],
  );

  /* ── Tap-to-move ── */
  const handleTubeTap = useCallback(
    (tubeIdx: number) => {
      if (phaseRef.current !== "playing") return;
      if (draggingRef.current !== null) return;

      const currentTubes = tubesRef.current;
      const sel = selectedRef.current;

      // Nothing selected → select this tube if it has balls
      if (sel === null) {
        if (currentTubes[tubeIdx] && currentTubes[tubeIdx].balls.length > 0) {
          sfx("tap");
          selectedRef.current = tubeIdx;
          setSelectedTube(tubeIdx);
        }
        return;
      }

      // Tap same tube → deselect
      if (sel === tubeIdx) {
        sfx("tap");
        selectedRef.current = null;
        setSelectedTube(null);
        return;
      }

      // Tap different tube → try to move
      if (!executeMove(sel, tubeIdx)) {
        sfx("error");
        setLastMoveResult("error");
        selectedRef.current = null;
        setSelectedTube(null);
      }
    },
    [sfx, executeMove],
  );

  /* ── Drag ── */
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

      // Dropped outside any tube, or on same tube → snap back
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

  /** Valid drop targets for the currently dragged ball */
  const getValidDropTargets = useCallback((): Set<number> => {
    const dIdx = draggingRef.current;
    if (dIdx === null) return new Set();
    const currentTubes = tubesRef.current;
    const from = currentTubes[dIdx];
    if (!from || from.balls.length === 0) return new Set();
    const ball = from.balls[from.balls.length - 1];
    const bpt = getBallsPerTube();
    const valid = new Set<number>();
    currentTubes.forEach((tube, idx) => {
      if (idx !== dIdx && canDrop(ball, tube, bpt)) valid.add(idx);
    });
    return valid;
  }, [draggingFrom, tubes]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Valid drop targets for the tap-selected ball */
  const getSelectedDropTargets = useCallback((): Set<number> => {
    const sIdx = selectedRef.current;
    if (sIdx === null) return new Set();
    const currentTubes = tubesRef.current;
    const from = currentTubes[sIdx];
    if (!from || from.balls.length === 0) return new Set();
    const ball = from.balls[from.balls.length - 1];
    const bpt = getBallsPerTube();
    const valid = new Set<number>();
    currentTubes.forEach((tube, idx) => {
      if (idx !== sIdx && canDrop(ball, tube, bpt)) valid.add(idx);
    });
    return valid;
  }, [selectedTube, tubes]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => {
    const fresh = generateLevel(LEVELS[0]);
    scoreRef.current = 0;
    timerRef.current = TOTAL_TIME;
    phaseRef.current = "playing";
    levelRef.current = 1;
    tubesRef.current = fresh;
    selectedRef.current = null;
    draggingRef.current = null;
    setScore(0);
    setTimer(TOTAL_TIME);
    setPhase("playing");
    setLevel(1);
    setTubes(fresh);
    setSelectedTube(null);
    setDraggingFrom(null);
    setMoves(0);
    setTotalMoves(0);
    setLastMoveResult(null);
  }, []);

  const stars = scoreRef.current >= 370 ? 3 : scoreRef.current >= 210 ? 2 : 1;

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return {
    level,
    tubes,
    selectedTube,
    draggingFrom,
    moves,
    totalMoves,
    score,
    timer,
    phase,
    stars,
    ballsPerTube: getBallsPerTube(),
    lastMoveResult,
    handleTubeTap,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    getValidDropTargets,
    getSelectedDropTargets,
    reset,
    fmt,
    totalLevels: LEVELS.length,
    totalTime: TOTAL_TIME,
  };
}
