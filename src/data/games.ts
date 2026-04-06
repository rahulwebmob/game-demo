export type GameId =
  | "memory-match"
  | "color-vision"
  | "reaction-time"
  | "pattern-recall"
  | "number-sequence"
  | "contrast-test"
  | "ball-sort";

export type GameCategory = "brain" | "eye" | "memory";

export interface GameRules {
  howToPlay: string;
  scoring: string;
  stars: [string, string, string]; // 3-star, 2-star, 1-star descriptions
  starScores: [number, number]; // [3-star min score, 2-star min score]
}

export interface GameDef {
  id: GameId;
  name: string;
  description: string;
  category: GameCategory;
  icon: string;
  bg: string;
  fg: string;
  time: string;
  difficulty: "Easy" | "Medium" | "Hard";
  hasLevels: boolean; // true = 50-level progression, false = single-session benchmark
  starCoins: [number, number, number]; // coins for 3-star, 2-star, 1-star
  xpReward: number;
  maxScore: number;
  rules: GameRules;
}

export const categories: { id: GameCategory | "all"; label: string }[] = [
  { id: "all", label: "All Games" },
  { id: "brain", label: "Brain Health" },
  { id: "eye", label: "Eye Care" },
  { id: "memory", label: "Memory" },
];

export const games: GameDef[] = [
  {
    id: "memory-match",
    name: "Memory Match",
    description:
      "Flip cards to find matching pairs. Great for Alzheimer's prevention.",
    category: "memory",
    icon: "grid",
    bg: "var(--color-coral-light)",
    fg: "var(--color-coral)",
    time: "~2 min",
    difficulty: "Easy",
    hasLevels: true,
    starCoins: [30, 20, 10],
    xpReward: 50,
    maxScore: 100,
    rules: {
      howToPlay: "Tap cards to flip them and find matching emoji pairs. Match all pairs to complete the level.",
      scoring: "Score is based on move efficiency (70%) and speed (30%). Fewer moves and faster time = higher score.",
      stars: ["Score 70%+", "Score 40–69%", "Score below 40%"],
      starScores: [80, 50],
    },
  },
  {
    id: "color-vision",
    name: "Color Vision",
    description:
      "Find the odd color out. Tests color perception and eye health.",
    category: "eye",
    icon: "eye",
    bg: "var(--color-violet-light)",
    fg: "var(--color-violet)",
    time: "~1 min",
    difficulty: "Medium",
    hasLevels: true,
    starCoins: [25, 15, 5],
    xpReward: 40,
    maxScore: 550,
    rules: {
      howToPlay: "A grid of colored squares appears — one square is a slightly different shade. Tap the odd one out! The grid gets larger and colors get closer each round.",
      scoring: "Each correct answer earns points based on the round number. More rounds and harder differences at higher levels.",
      stars: ["Score 70%+", "Score 40–69%", "Score below 40%"],
      starScores: [385, 220],
    },
  },
  {
    id: "reaction-time",
    name: "Reaction Time",
    description:
      "Tap as fast as you can when the screen changes. Measures brain speed.",
    category: "brain",
    icon: "zap",
    bg: "var(--color-gold-light)",
    fg: "var(--color-gold)",
    time: "~1 min",
    difficulty: "Easy",
    hasLevels: false,
    starCoins: [20, 12, 5],
    xpReward: 30,
    maxScore: 100,
    rules: {
      howToPlay: "Wait for the screen to turn green, then tap as fast as you can! You'll do 5 rounds. Tapping too early resets the round.",
      scoring: "Score = 100 − (average reaction time ÷ 7). Faster average = higher score.",
      stars: ["Avg under 400ms", "Avg 400–549ms", "Avg 550ms+"],
      starScores: [43, 22],
    },
  },
  {
    id: "pattern-recall",
    name: "Pattern Recall",
    description:
      "Remember and repeat the highlighted pattern. Trains working memory.",
    category: "memory",
    icon: "brain",
    bg: "var(--color-teal-light)",
    fg: "var(--color-teal)",
    time: "~2 min",
    difficulty: "Medium",
    hasLevels: true,
    starCoins: [35, 20, 10],
    xpReward: 60,
    maxScore: 540,
    rules: {
      howToPlay: "Watch the cells light up in sequence, then repeat the pattern by tapping in the same order. Each round adds more steps. You have limited lives.",
      scoring: "Each round cleared earns points based on difficulty. Later rounds are worth more. Complete all rounds for the max score!",
      stars: ["Score 70%+", "Score 40–69%", "Score below 40%"],
      starScores: [380, 215],
    },
  },
  {
    id: "number-sequence",
    name: "Number Sequence",
    description:
      "Find the missing number in the sequence. Sharpens mental math.",
    category: "brain",
    icon: "hash",
    bg: "var(--color-sky-light)",
    fg: "var(--color-sky)",
    time: "~1 min",
    difficulty: "Hard",
    hasLevels: true,
    starCoins: [40, 25, 10],
    xpReward: 70,
    maxScore: 432,
    rules: {
      howToPlay: "A number sequence is shown with one number missing. Pick the correct answer from 4 choices. Patterns get harder each round.",
      scoring: "Each correct answer earns points based on the round. Later rounds are worth more. Wrong answers earn nothing.",
      stars: ["Score 70%+", "Score 40–69%", "Score below 40%"],
      starScores: [300, 170],
    },
  },
  {
    id: "contrast-test",
    name: "Contrast Test",
    description:
      "Identify the lighter square. Checks contrast sensitivity of your eyes.",
    category: "eye",
    icon: "scan-eye",
    bg: "var(--color-rose-light)",
    fg: "var(--color-rose)",
    time: "~1 min",
    difficulty: "Easy",
    hasLevels: true,
    starCoins: [20, 12, 5],
    xpReward: 35,
    maxScore: 318,
    rules: {
      howToPlay: "A grid of gray squares appears — one is slightly lighter or darker. Tap the different one! The contrast difference shrinks each round.",
      scoring: "Each correct answer earns points based on the round number. Higher levels have more rounds and subtler differences.",
      stars: ["Score 70%+", "Score 40–69%", "Score below 40%"],
      starScores: [223, 127],
    },
  },
  {
    id: "ball-sort",
    name: "Ball Sort",
    description:
      "Sort colored balls into tubes so each tube holds only one color. A fun logic puzzle!",
    category: "brain",
    icon: "flask-conical",
    bg: "var(--color-teal-light)",
    fg: "var(--color-teal)",
    time: "~2 min",
    difficulty: "Medium",
    hasLevels: true,
    starCoins: [35, 20, 10],
    xpReward: 55,
    maxScore: 525,
    rules: {
      howToPlay: "Tap a tube to select the top ball, then tap another tube to move it there. A ball can only be placed on a matching color or in an empty tube. Sort all balls so each tube holds a single color!",
      scoring: "Score is based on efficiency — fewer moves means a higher score. Solve the puzzle in as few moves as possible!",
      stars: ["Score 370+ (70%+)", "Score 210–369 (40%+)", "Score below 210"],
      starScores: [370, 210],
    },
  },
];
