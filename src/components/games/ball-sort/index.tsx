import { useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, GripVertical } from "lucide-react";
import GameResult from "../game-result";
import { useBallSort } from "../../../hooks/use-ball-sort";
import type { Tube, BallSortConfig } from "../../../hooks/use-ball-sort";
import type { BallSortLevel } from "../../../data/level-configs";
import type { GameLevelConfig } from "../../../data/level-configs";

/* ─── Props ─────────────────────────────────────────── */

interface Props {
  onComplete: (score: number) => void;
  onPlayAgain: () => void;
  onNextLevel?: () => void;
  onBack?: () => void;
  levelNumber?: number;
  newBest?: boolean;
  starScores?: [number, number];
  levelConfig?: GameLevelConfig;
}

/* ─── Sizing ────────────────────────────────────────── */

const BALL = 34;
const GAP = 3;
const LIFTED_H = BALL + 14;

const PAD = 8;
const TUBE_W = BALL + 14;          // 48px inner
const RIM_W = TUBE_W + 16;         // 64px flared rim
const RIM_H = 8;                   // rim lip height
const TUBE_H = 4 * BALL + 3 * GAP + PAD * 2 + 10;

/* ─── Color helpers ─────────────────────────────────── */

function bStyle(color: string): React.CSSProperties {
  return {
    width: BALL, height: BALL, borderRadius: "50%", flexShrink: 0,
    background: `radial-gradient(circle at 30% 26%, color-mix(in srgb, ${color} 45%, white) 0%, ${color} 48%, color-mix(in srgb, ${color} 55%, black) 100%)`,
    boxShadow: `0 3px 8px ${color}45, inset 0 3px 6px color-mix(in srgb, var(--color-card) 50%, transparent), inset 0 -3px 6px color-mix(in srgb, var(--color-ink) 20%, transparent)`,
  };
}

/* ─── Main ──────────────────────────────────────────── */

export default function BallSort({ onComplete, onPlayAgain, onNextLevel, onBack, levelNumber, newBest, starScores, levelConfig }: Props) {
  // Build config from external level config if available
  const config: BallSortConfig | undefined = useMemo(() => {
    if (!levelConfig) return undefined;
    const lc = levelConfig as BallSortLevel;
    return {
      numColors: lc.numColors,
      numTubes: lc.numTubes,
      ballsPerTube: lc.ballsPerTube,
      timeLimitSec: lc.timeLimitSec,
      maxScore: lc.maxScore,
    };
  }, [levelConfig]);

  const {
    tubes, selectedTube, draggingFrom, moves,
    score, timer, phase, stars: hookStars, ballsPerTube, lastMoveResult,
    handleTubeTap, handleDragStart, handleDragEnd, handleDragCancel,
    getValidDropTargets, getSelectedDropTargets,
    fmt, hasTimeLimit, totalTime, started,
  } = useBallSort(onComplete, config);

  const tubeRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const dragMoved = useRef(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const activeTube = useRef<number | null>(null);
  const activePtr = useRef<number | null>(null);

  const dTargets = useMemo(() => getValidDropTargets(), [getValidDropTargets]);
  const sTargets = useMemo(() => getSelectedDropTargets(), [getSelectedDropTargets]);
  const validTargets = draggingFrom !== null ? dTargets : sTargets;

  const setTubeRef = useCallback((i: number, el: HTMLDivElement | null) => {
    if (el) tubeRefs.current.set(i, el); else tubeRefs.current.delete(i);
  }, []);

  const hitTest = useCallback((cx: number, cy: number): number | null => {
    for (const [i, el] of tubeRefs.current) {
      const r = el.getBoundingClientRect();
      if (cx >= r.left - 14 && cx <= r.right + 14 && cy >= r.top - 30 && cy <= r.bottom + 10)
        return i;
    }
    return null;
  }, []);

  const onDown = useCallback((e: React.PointerEvent, i: number) => {
    if (phase !== "playing" || activePtr.current !== null) return;
    e.preventDefault();
    activePtr.current = e.pointerId;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragMoved.current = false;
    activeTube.current = i;
  }, [phase]);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (activePtr.current !== e.pointerId || activeTube.current === null || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x, dy = e.clientY - dragStart.current.y;
    if (!dragMoved.current && Math.sqrt(dx * dx + dy * dy) < 10) return;
    const src = tubes[activeTube.current];
    if (!src || src.balls.length === 0) return;
    if (!dragMoved.current) { dragMoved.current = true; handleDragStart(activeTube.current); }
    if (ghostRef.current) {
      ghostRef.current.style.left = `${e.clientX - BALL / 2}px`;
      ghostRef.current.style.top = `${e.clientY - BALL}px`;
    }
  }, [handleDragStart, tubes]);

  const onUp = useCallback((e: React.PointerEvent) => {
    if (activePtr.current !== e.pointerId) return;
    activePtr.current = null;
    const from = activeTube.current;
    activeTube.current = null; dragStart.current = null;
    if (from === null) return;
    if (!dragMoved.current) { handleTubeTap(from); return; }
    handleDragEnd(from, hitTest(e.clientX, e.clientY));
  }, [handleTubeTap, handleDragEnd, hitTest]);

  const onCancel = useCallback((e: React.PointerEvent) => {
    if (activePtr.current !== e.pointerId) return;
    activePtr.current = null; activeTube.current = null; dragStart.current = null;
    if (dragMoved.current) handleDragCancel();
    dragMoved.current = false;
  }, [handleDragCancel]);

  if (phase === "done") {
    const stars = starScores
      ? (score >= starScores[0] ? 3 : score >= starScores[1] ? 2 : 1)
      : hookStars;
    return (
      <GameResult
        icon={<Trophy size={36} className="text-teal" />} iconBg="bg-teal-light"
        title={stars === 3 ? "Sorting Master!" : stars === 2 ? "Well Sorted!" : "Keep Sorting"}
        stars={stars} score={score}
        subtitle={`Solved in ${moves} moves`}
        accentColor="bg-teal" onReset={onPlayAgain}
        onNextLevel={onNextLevel} onBack={onBack} levelNumber={levelNumber} newBest={newBest}
      >
        {hasTimeLimit && (
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-[20px] font-bold text-ink">{moves}</p>
              <p className="text-[11px] text-ink-muted font-medium">Moves</p>
            </div>
            <div>
              <p className="text-[20px] font-bold text-ink">{fmt(timer)}</p>
              <p className="text-[11px] text-ink-muted font-medium">Time Left</p>
            </div>
          </div>
        )}
      </GameResult>
    );
  }

  const isDrag = draggingFrom !== null;
  const gCol = isDrag && tubes[draggingFrom]
    ? tubes[draggingFrom].balls[tubes[draggingFrom].balls.length - 1] : null;

  return (
    <div className="flex flex-col gap-3 select-none"
      onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onCancel}
      style={{ touchAction: "none" }}>

      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-semibold text-ink-secondary">{moves} moves</span>
        {moves > 0 && (
          <span className="text-[13px] font-bold text-ink tabular-nums">
            Score: {score}
          </span>
        )}
        {hasTimeLimit && (
          <span className="text-[13px] font-semibold text-ink-secondary flex items-center gap-1.5">
            <Clock size={14} className="text-coral" /> {started ? fmt(timer) : fmt(totalTime)}
          </span>
        )}
      </div>

      <div className="h-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {lastMoveResult === "error" && phase === "playing" && (
            <motion.p key="err" initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }} className="text-[12px] font-semibold text-rose text-center">
              Tube is full!
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Tubes ── */}
      <div className="flex items-end justify-center gap-3 md:gap-4 flex-wrap py-3">
        {tubes.map((tube, i) => (
          <FlaskTube key={tube.id} tube={tube} idx={i} bpt={ballsPerTube}
            selected={selectedTube === i} dragSrc={draggingFrom === i}
            validDrop={validTargets.has(i)}
            dimmed={isDrag && !validTargets.has(i) && draggingFrom !== i}
            onDown={onDown} setRef={setTubeRef} />
        ))}
      </div>

      {isDrag && gCol && (
        <div ref={ghostRef} className="fixed pointer-events-none z-50"
          style={{ ...bStyle(gCol), width: BALL * 1.15, height: BALL * 1.15,
            boxShadow: `0 12px 32px ${gCol}55, ${bStyle(gCol).boxShadow}`,
            left: -100, top: -100 }} />
      )}

      {hasTimeLimit && (
        <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden shadow-inner">
          <motion.div className={`h-full rounded-full ${
            (timer / totalTime) * 100 > 50 ? "bg-green" : (timer / totalTime) * 100 > 25 ? "bg-gold" : "bg-rose"
          }`}
            initial={false} animate={{ width: `${(timer / totalTime) * 100}%` }}
            transition={{ duration: 0.8, ease: "linear" }} />
        </div>
      )}

      <p className="text-[11px] text-ink-muted text-center flex items-center justify-center gap-1">
        <GripVertical size={12} /> Drag a ball or tap to select &amp; place
      </p>
    </div>
  );
}

/* ─── Flask Tube ────────────────────────────────────── */

interface FlaskProps {
  tube: Tube; idx: number; bpt: number;
  selected: boolean; dragSrc: boolean; validDrop: boolean; dimmed: boolean;
  onDown: (e: React.PointerEvent, i: number) => void;
  setRef: (i: number, el: HTMLDivElement | null) => void;
}

function FlaskTube({ tube, idx, bpt, selected, dragSrc, validDrop, dimmed, onDown, setRef }: FlaskProps) {
  const topI = tube.balls.length - 1;
  const hideTop = dragSrc || selected;
  const sorted = tube.balls.length === bpt && tube.balls.every((b) => b === tube.balls[0]);

  let border = "var(--color-border)";
  let glow = "";
  if (sorted) {
    border = "var(--color-green)";
    glow = "drop-shadow(0 0 10px color-mix(in srgb, var(--color-green) 30%, transparent))";
  } else if (validDrop) {
    border = "color-mix(in srgb, var(--color-green) 55%, transparent)";
    glow = "drop-shadow(0 0 8px color-mix(in srgb, var(--color-green) 20%, transparent))";
  } else if (selected) {
    border = "var(--color-teal)";
    glow = "drop-shadow(0 0 10px color-mix(in srgb, var(--color-teal) 25%, transparent))";
  }

  const br = `0 0 ${TUBE_W / 2}px ${TUBE_W / 2}px`;

  return (
    <motion.div
      className="flex flex-col items-center"
      style={{ opacity: dimmed ? 0.35 : 1, transition: "opacity 0.15s" }}
      animate={sorted ? { scale: [1, 1.05, 1] } : {}}
      transition={sorted ? { duration: 0.4 } : {}}
    >

      {/* Lifted ball */}
      <div className="flex items-end justify-center" style={{ height: LIFTED_H, marginBottom: 2 }}>
        <AnimatePresence>
          {selected && tube.balls.length > 0 && !dragSrc && (
            <motion.div
              initial={{ y: 16, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 500, damping: 26 }}
              style={bStyle(tube.balls[topI])} />
          )}
        </AnimatePresence>
      </div>

      {/* Flask wrapper */}
      <div ref={(el) => setRef(idx, el)}
        onPointerDown={(e) => onDown(e, idx)}
        className="cursor-pointer flex flex-col items-center"
        style={{ filter: glow, transition: "filter 0.2s" }}>

        {/* Rim — wider flared lip */}
        <div style={{
          width: RIM_W, height: RIM_H,
          borderLeft: `2px solid ${border}`,
          borderRight: `2px solid ${border}`,
          borderTop: `2px solid ${border}`,
          borderBottom: "none",
          borderRadius: `${RIM_H}px ${RIM_H}px 0 0`,
          background: `linear-gradient(180deg,
            color-mix(in srgb, var(--color-card) 80%, transparent),
            color-mix(in srgb, var(--color-card) 40%, transparent))`,
          transition: "border-color 0.2s",
        }} />

        {/* Tube body */}
        <div style={{
          width: TUBE_W, height: TUBE_H,
          borderLeft: `2px solid ${border}`,
          borderRight: `2px solid ${border}`,
          borderBottom: `2px solid ${border}`,
          borderTop: "none",
          borderRadius: br,
          transition: "border-color 0.2s",
          overflow: "hidden",
          position: "relative",
        }}>

          {/* Glass gradient fill */}
          <div className="absolute inset-0 pointer-events-none" style={{
            borderRadius: br,
            background: `linear-gradient(135deg,
              color-mix(in srgb, var(--color-card) 60%, transparent) 0%,
              color-mix(in srgb, var(--color-card) 20%, transparent) 40%,
              color-mix(in srgb, var(--color-card) 35%, transparent) 100%)`,
          }} />

          {/* Left shine streak */}
          <div className="absolute pointer-events-none" style={{
            left: 4, top: 8, width: 4, bottom: TUBE_W / 2 + 4,
            borderRadius: 4,
            background: `linear-gradient(180deg,
              color-mix(in srgb, var(--color-card) 70%, transparent) 0%,
              color-mix(in srgb, var(--color-card) 10%, transparent) 100%)`,
          }} />

          {/* Right subtle shine */}
          <div className="absolute pointer-events-none" style={{
            right: 5, top: 16, width: 2.5, bottom: TUBE_W / 2 + 12,
            borderRadius: 3,
            background: `linear-gradient(180deg,
              color-mix(in srgb, var(--color-card) 35%, transparent) 0%,
              transparent 100%)`,
          }} />

          {/* Inner shadow at bottom for depth */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{
            height: TUBE_W / 2 + 10,
            borderRadius: br,
            background: `radial-gradient(ellipse at 50% 100%,
              color-mix(in srgb, var(--color-ink) 5%, transparent) 0%,
              transparent 70%)`,
          }} />

          {/* Valid pulse */}
          {validDrop && (
            <motion.div className="absolute inset-0 pointer-events-none"
              style={{ borderRadius: br,
                background: "color-mix(in srgb, var(--color-green) 8%, transparent)" }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.1 }} />
          )}

          {/* Balls */}
          <div style={{
            position: "relative", zIndex: 1,
            width: "100%", height: "100%",
            display: "flex", flexDirection: "column-reverse",
            alignItems: "center", justifyContent: "flex-start",
            paddingBottom: TUBE_W / 2 - BALL / 2 + PAD,
            paddingTop: PAD, gap: GAP,
          }}>
            {tube.balls.map((color, i) => {
              const hidden = i === topI && hideTop;
              return (
                <motion.div key={`${tube.id}-${i}`}
                  animate={{ scale: hidden ? 0 : 1, opacity: hidden ? 0 : 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={bStyle(color)} />
              );
            })}
          </div>

          {/* Empty label */}
          {tube.balls.length === 0 && !validDrop && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] font-semibold tracking-wider uppercase"
                style={{ color: "var(--color-ink-muted)", opacity: 0.3 }}>Empty</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
