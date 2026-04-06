import { useState, lazy, Suspense, useRef } from "react";
import { useSound } from "../hooks/use-sound";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  ArrowLeft,
  Coins,
  Clock,
  Zap,
  Star,
  LayoutGrid,
  Eye,
  Brain,
  Hash,
  ScanEye,
  FlaskConical,
  Lock,
} from "lucide-react";
import CoinBadge from "../components/coin-badge";
import EnergyBadge from "../components/energy-badge";
import EnergyControl from "../components/energy-control";
import ErrorBoundary from "../components/error-boundary";
import GameIntro from "../components/games/game-intro";
import LevelSelect from "../components/games/level-select";
import { games, categories } from "../data/games";
import type { GameId, GameCategory } from "../data/games";
import { getLevelConfig, TOTAL_LEVELS } from "../data/level-configs";
import type { BaseLevelConfig } from "../data/level-configs";
import ParallaxHeader from "../components/parallax-header";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { addCoins, spendEnergy, addEnergy, resetEnergy } from "../store/player-slice";
import { completeLevel, completeEndless, selectGameProgress } from "../store/progress-slice";
import { addToast, setShowPupilTest } from "../store/ui-slice";
import { MAX_ENERGY } from "../constants";

// Lazy-load game components
const MemoryMatch = lazy(() => import("../components/games/memory-match"));
const ColorVision = lazy(() => import("../components/games/color-vision"));
const ReactionTime = lazy(() => import("../components/games/reaction-time"));
const PatternRecall = lazy(() => import("../components/games/pattern-recall"));
const NumberSequence = lazy(() => import("../components/games/number-sequence"));
const ContrastTest = lazy(() => import("../components/games/contrast-test"));
const BallSort = lazy(() => import("../components/games/ball-sort"));

const iconMap: Record<string, React.ReactNode> = {
  grid: <LayoutGrid size={24} />,
  eye: <Eye size={24} />,
  zap: <Zap size={24} />,
  brain: <Brain size={24} />,
  hash: <Hash size={24} />,
  "scan-eye": <ScanEye size={24} />,
  "flask-conical": <FlaskConical size={24} />,
};

export interface GameComponentProps {
  onComplete: (score: number) => void;
  onPlayAgain: () => void;
  onNextLevel?: () => void;
  levelNumber?: number;
  newBest?: boolean;
  starScores?: [number, number];
}

const gameComponents: Record<GameId, React.ComponentType<GameComponentProps>> = {
  "memory-match": MemoryMatch,
  "color-vision": ColorVision,
  "reaction-time": ReactionTime,
  "pattern-recall": PatternRecall,
  "number-sequence": NumberSequence,
  "contrast-test": ContrastTest,
  "ball-sort": BallSort,
};

const gridItem = {
  hidden: { opacity: 0, y: 14, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

type GamePhase = "list" | "levels" | "intro" | "playing";

export default function Games() {
  const sfx = useSound();
  const dispatch = useAppDispatch();
  const { coins, energy } = useAppSelector((s) => s.player);
  const allProgress = useAppSelector((s) => s.progress.games);
  const noEnergy = energy === 0;

  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [phase, setPhase] = useState<GamePhase>("list");
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [isEndless, setIsEndless] = useState(false);
  const [filter, setFilter] = useState<GameCategory | "all">("all");
  const [showQuit, setShowQuit] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const gameCompleted = useRef(false);

  const filtered =
    filter === "all" ? games : games.filter((g) => g.category === filter);
  const activeGameDef = games.find((g) => g.id === activeGame);
  const gameProgress = useAppSelector((s) =>
    activeGame ? selectGameProgress(s, activeGame) : null,
  );

  const levelConfig =
    activeGame && activeGameDef?.hasLevels
      ? getLevelConfig(activeGame, isEndless ? TOTAL_LEVELS + 1 : selectedLevel)
      : null;

  // Star thresholds — use static GameDef thresholds for ALL games until
  // hooks are refactored to accept levelConfig (levelConfig.starScores are
  // based on scaled maxScore that hooks can't yet produce)
  const starScores: [number, number] | undefined = activeGameDef
    ? activeGameDef.rules.starScores
    : undefined;

  function handleComplete(score: number) {
    if (!activeGameDef || !activeGame || gameCompleted.current) return;
    gameCompleted.current = true;

    let stars: number;
    let coinReward: number;

    // Compute newBest before dispatching (dispatch updates the store)
    if (isEndless) {
      setNewBest(score > (gameProgress?.endlessHighScore ?? 0));
    } else {
      const lvl = activeGameDef.hasLevels ? selectedLevel : 1;
      const existing = gameProgress?.levels[lvl];
      setNewBest(!existing || score > existing.bestScore);
    }

    // Stars: always use static GameDef thresholds until hooks accept levelConfig
    const [three, two] = activeGameDef.rules.starScores;
    stars = score >= three ? 3 : score >= two ? 2 : 1;

    if (activeGameDef.hasLevels && levelConfig) {
      // Level-based games: coins scale per level from levelConfig
      const config = levelConfig as BaseLevelConfig;
      coinReward = config.coinReward[3 - stars];

      if (isEndless) {
        // Note: levelReached=0 because actual level is tracked inside hooks,
        // not exposed via onComplete. Will be fixed when hooks accept levelConfig.
        dispatch(completeEndless({ gameId: activeGame, score, levelReached: 0 }));
      } else {
        dispatch(completeLevel({ gameId: activeGame, level: selectedLevel, score, stars }));
      }
    } else {
      // Benchmark games: static coins
      coinReward = activeGameDef.starCoins[3 - stars];

      // Save as level 1 for progress tracking
      dispatch(completeLevel({ gameId: activeGame, level: 1, score, stars }));
    }

    if (coinReward > 0) {
      dispatch(addCoins(coinReward));
      sfx("coinEarn");
      dispatch(
        addToast({
          message: `Earned ${coinReward} coins (${stars}★) from ${activeGameDef.name}!`,
          type: "success",
        }),
      );
    }
  }

  function exitGame() {
    setActiveGame(null);
    setPhase("list");
    setShowQuit(false);
    setIsEndless(false);
    setSelectedLevel(1);
    setNewBest(false);
    gameCompleted.current = false;
  }

  function goToLevels() {
    setPhase("levels");
    gameCompleted.current = false;
  }

  function handleSelectLevel(level: number) {
    setSelectedLevel(level);
    setIsEndless(false);
    setPhase("intro");
  }

  function handleSelectEndless() {
    setSelectedLevel(TOTAL_LEVELS + 1);
    setIsEndless(true);
    setPhase("intro");
  }

  function handleStartGame() {
    if (phase === "playing") return; // prevent double-tap
    if (energy <= 0) {
      dispatch(addToast({ message: "Not enough energy to play!", type: "error" }));
      activeGameDef?.hasLevels ? goToLevels() : exitGame();
      return;
    }
    dispatch(spendEnergy());
    setPhase("playing");
  }

  function handleBack() {
    sfx("tap");
    if (phase === "levels") {
      exitGame();
    } else if (phase === "intro") {
      activeGameDef?.hasLevels ? setPhase("levels") : exitGame();
    } else if (gameCompleted.current) {
      activeGameDef?.hasLevels ? goToLevels() : exitGame();
    } else {
      setShowQuit(true);
    }
  }

  function handlePlayAgain() {
    if (!gameCompleted.current) return; // prevent double-tap
    if (energy <= 0) {
      dispatch(addToast({ message: "Not enough energy to play again!", type: "error" }));
      activeGameDef?.hasLevels ? goToLevels() : exitGame();
      return;
    }
    sfx("gameStart");
    dispatch(spendEnergy());
    gameCompleted.current = false;
    setNewBest(false);
    setGameKey((k) => k + 1);
  }

  function handleNextLevel() {
    if (!gameCompleted.current) return; // prevent double-tap
    if (energy <= 0) {
      dispatch(addToast({ message: "Not enough energy!", type: "error" }));
      goToLevels();
      return;
    }
    sfx("gameStart");
    dispatch(spendEnergy());
    gameCompleted.current = false;
    setNewBest(false);
    setSelectedLevel((l) => l + 1);
    setGameKey((k) => k + 1);
  }


  // ── Active game view ──
  if (activeGame && activeGameDef) {
    const GameComponent = gameComponents[activeGame];
    return (
      <div className="flex flex-col px-5 md:px-8 lg:px-10 pt-7 md:pt-10 pb-2 gap-5 md:gap-7">
        {/* Game header */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleBack}
            aria-label="Back"
            className="w-10 h-10 md:w-11 md:h-11 rounded-[14px] bg-muted flex items-center justify-center border-none cursor-pointer"
          >
            <ArrowLeft size={18} className="text-ink" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-[18px] md:text-[22px] font-bold text-ink tracking-tight">
              {activeGameDef.name}
            </h1>
            <p className="text-[11px] md:text-[13px] text-ink-muted">
              {phase === "levels"
                ? "Select a level"
                : !activeGameDef.hasLevels
                  ? "Quick Play"
                  : isEndless
                    ? "Endless Mode"
                    : `Level ${selectedLevel} of ${TOTAL_LEVELS}`}
            </p>
          </div>
          <CoinBadge amount={coins} small />
        </div>

        {/* Level select */}
        {phase === "levels" && gameProgress && (
          <LevelSelect
            game={activeGameDef}
            progress={gameProgress}
            onSelectLevel={handleSelectLevel}
            onSelectEndless={handleSelectEndless}
          />
        )}

        {/* Intro */}
        {phase === "intro" && (
          <GameIntro
            game={activeGameDef}
            icon={iconMap[activeGameDef.icon] || <Star size={24} />}
            onStart={handleStartGame}
            coinRewards={
              levelConfig
                ? (levelConfig as BaseLevelConfig).coinReward
                : undefined
            }
          />
        )}

        {/* Playing */}
        {phase === "playing" && (
          <>
            {/* Level info bar */}
            <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-gold-light/50">
              <span className="text-[12px] md:text-[13px] font-semibold text-ink-secondary flex items-center gap-1.5">
                <Star size={14} className="text-violet" />
                {!activeGameDef.hasLevels
                  ? "Quick Play"
                  : isEndless
                    ? "Endless"
                    : `Level ${selectedLevel}`}
              </span>
              <span className="text-[12px] md:text-[13px] font-semibold text-ink-secondary flex items-center gap-1.5">
                <Coins size={14} className="text-gold" /> Up to{" "}
                {levelConfig
                  ? (levelConfig as BaseLevelConfig).coinReward[0]
                  : activeGameDef.starCoins[0]}{" "}
                coins
              </span>
              <span className="text-[12px] md:text-[13px] font-semibold text-ink-secondary flex items-center gap-1.5">
                <Clock size={14} className="text-coral" /> {activeGameDef.time}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={gameKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-20">
                      <div className="w-8 h-8 border-3 border-muted border-t-coral rounded-full animate-spin" />
                    </div>
                  }
                >
                  <ErrorBoundary fallbackTitle="Game crashed — try again">
                    <GameComponent
                      onComplete={handleComplete}
                      onPlayAgain={handlePlayAgain}
                      onNextLevel={
                        activeGameDef.hasLevels && !isEndless && selectedLevel < TOTAL_LEVELS
                          ? handleNextLevel
                          : undefined
                      }
                      levelNumber={
                        activeGameDef.hasLevels && !isEndless ? selectedLevel : undefined
                      }
                      newBest={newBest}
                      starScores={starScores}
                    />
                  </ErrorBoundary>
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {/* Quit confirmation */}
        <AnimatePresence>
          {showQuit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] flex items-center justify-center px-5"
              style={{
                background: "color-mix(in srgb, var(--color-ink) 35%, transparent)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => {
                sfx("modalClose");
                setShowQuit(false);
              }}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card rounded-2xl p-5 md:p-6 w-full max-w-[360px] shadow-[var(--shadow-elevated)] flex flex-col items-center gap-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-coral-light flex items-center justify-center">
                  <Gamepad2 size={24} className="text-coral" />
                </div>
                <div className="text-center">
                  <h4 className="text-[16px] md:text-[18px] font-bold text-ink">Quit Game?</h4>
                  <p className="text-[12px] md:text-[13px] text-ink-muted mt-1">
                    Your progress will be lost and 1 energy was already spent.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full mt-1">
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => {
                      sfx("modalClose");
                      setShowQuit(false);
                    }}
                    className="flex-1 py-2.5 md:py-3 rounded-xl bg-muted text-ink text-[13px] md:text-[14px] font-semibold border-none cursor-pointer"
                  >
                    Keep Playing
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={() => {
                      sfx("navigate");
                      exitGame();
                    }}
                    className="flex-1 py-2.5 md:py-3 rounded-xl bg-coral text-white text-[13px] md:text-[14px] font-bold border-none cursor-pointer shadow-[var(--shadow-btn)]"
                  >
                    Quit
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Game listing view ──
  return (
    <div className="flex flex-col px-5 md:px-8 lg:px-10 pt-7 md:pt-10 pb-2 gap-5 md:gap-7">
      <ParallaxHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-coral-light flex items-center justify-center">
              <Gamepad2 size={20} className="text-coral" />
            </div>
            <div>
              <h1 className="text-[22px] md:text-[28px] font-bold text-ink tracking-tight">
                Games
              </h1>
              <p className="text-[11px] md:text-[13px] text-ink-muted">
                Train your brain & eyes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EnergyBadge energy={energy} maxEnergy={MAX_ENERGY} />
            <CoinBadge amount={coins} small />
          </div>
        </div>
      </ParallaxHeader>

      {noEnergy && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center gap-3 shadow-[var(--shadow-card)]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-coral-light), var(--color-teal-light))",
          }}
        >
          <Eye size={20} className="text-coral flex-shrink-0" />
          <p className="text-[13px] font-semibold text-ink flex-1">
            Out of Energy — complete an eye check to play!
          </p>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              sfx("tap");
              dispatch(setShowPupilTest(true));
            }}
            className="px-3 py-1.5 rounded-xl bg-coral text-white text-[12px] font-bold border-none cursor-pointer shadow-[var(--shadow-btn)] flex-shrink-0"
          >
            Start Eye Check
          </motion.button>
        </motion.div>
      )}

      <EnergyControl
        energy={energy}
        maxEnergy={MAX_ENERGY}
        onAdd={() => dispatch(addEnergy())}
        onSpend={() => dispatch(spendEnergy())}
        onReset={() => dispatch(resetEnergy())}
        onStartEyeCheck={() => dispatch(setShowPupilTest(true))}
      />

      {/* Category filter */}
      <div className="flex gap-2 glass-card rounded-2xl p-1.5 md:p-2 shadow-[var(--shadow-soft)]">
        {categories.map((c) => {
          const on = filter === c.id;
          return (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sfx("filter");
                setFilter(c.id);
              }}
              className={`flex-1 py-2.5 md:py-3 rounded-xl text-[11px] md:text-[13px] font-semibold border-none cursor-pointer relative z-10 ${
                on ? "text-white" : "bg-transparent text-ink-muted"
              }`}
            >
              {on && (
                <motion.div
                  layoutId="game-filter"
                  className="absolute inset-0 bg-coral rounded-xl shadow-[var(--shadow-btn)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{c.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Games grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
      >
        {filtered.map((game) => {
          const gp = allProgress[game.id];
          const starCount = gp.totalStars;

          return (
            <motion.button
              key={game.id}
              variants={gridItem}
              whileTap={noEnergy ? undefined : { scale: 0.97, y: 1 }}
              whileHover={
                noEnergy
                  ? undefined
                  : { y: -3, boxShadow: "var(--shadow-elevated)" }
              }
              onClick={() => {
                if (noEnergy) return;
                sfx("tap");
                gameCompleted.current = false;
                setActiveGame(game.id);
                if (game.hasLevels) {
                  setPhase("levels");
                } else {
                  setSelectedLevel(1);
                  setIsEndless(false);
                  setPhase("intro");
                }
              }}
              className={`flex items-start gap-4 p-4 md:p-5 rounded-2xl border-none text-left shadow-[var(--shadow-soft)] relative overflow-hidden border border-border/30 ${noEnergy ? "cursor-not-allowed" : "cursor-pointer"}`}
              style={{
                background: `color-mix(in srgb, ${game.bg} 60%, var(--color-card))`,
              }}
            >
              {noEnergy && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center z-10 rounded-2xl gap-1.5"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-bg) 70%, transparent)",
                    backdropFilter: "blur(3px)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "color-mix(in srgb, var(--color-rose) 15%, transparent)",
                    }}
                  >
                    <Lock size={16} className="text-rose" />
                  </div>
                  <span className="text-[11px] font-bold text-ink-secondary">
                    Low Energy
                  </span>
                </div>
              )}
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "color-mix(in srgb, var(--color-card) 50%, transparent)",
                  color: game.fg,
                }}
              >
                {iconMap[game.icon] || <Star size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] md:text-[17px] font-bold text-ink">
                  {game.name}
                </p>
                <p className="text-[11px] md:text-[12px] text-ink-secondary mt-0.5 line-clamp-2">
                  {game.description}
                </p>
                <div className="flex items-center gap-3 mt-2.5">
                  <span className="flex items-center gap-1 text-[10px] md:text-[11px] font-semibold text-ink-muted">
                    <Clock size={11} /> {game.time}
                  </span>
                  {game.hasLevels ? (
                    <>
                      {starCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] md:text-[11px] font-bold text-gold">
                          <Star size={11} fill="var(--color-gold)" /> {starCount}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[10px] md:text-[11px] font-bold text-ink-muted">
                        Lv.{Math.min(gp.currentLevel, TOTAL_LEVELS)}
                      </span>
                    </>
                  ) : (
                    gp.levels[1]?.bestScore != null && (
                      <span className="flex items-center gap-1 text-[10px] md:text-[11px] font-bold text-gold">
                        <Zap size={11} /> Best: {gp.levels[1].bestScore} pts
                      </span>
                    )
                  )}
                  <span
                    className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      game.difficulty === "Easy"
                        ? "bg-green-light text-green"
                        : game.difficulty === "Medium"
                          ? "bg-gold-light text-gold"
                          : "bg-rose-light text-rose"
                    }`}
                  >
                    {game.difficulty}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Health tip */}
      <div className="glass-card rounded-2xl p-4 md:p-5 flex items-start gap-3.5 shadow-[var(--shadow-soft)]">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-teal-light flex items-center justify-center flex-shrink-0">
          <Brain size={20} className="text-teal" />
        </div>
        <div>
          <p className="text-[13px] md:text-[15px] font-bold text-ink">
            Daily Brain Training
          </p>
          <p className="text-[11px] md:text-[13px] text-ink-muted mt-0.5">
            Playing cognitive games for 15 minutes daily can help improve
            memory, attention, and processing speed.
          </p>
        </div>
      </div>
    </div>
  );
}
