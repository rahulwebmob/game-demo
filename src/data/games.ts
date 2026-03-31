export type GameId = 'memory-match' | 'color-vision' | 'reaction-time' | 'pattern-recall' | 'number-sequence' | 'contrast-test'

export type GameCategory = 'brain' | 'eye' | 'memory'

export interface GameDef {
  id: GameId
  name: string
  description: string
  category: GameCategory
  icon: string
  bg: string
  fg: string
  time: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  coinReward: number
  xpReward: number
}

export const categories: { id: GameCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Games' },
  { id: 'brain', label: 'Brain Health' },
  { id: 'eye', label: 'Eye Care' },
  { id: 'memory', label: 'Memory' },
]

export const games: GameDef[] = [
  {
    id: 'memory-match',
    name: 'Memory Match',
    description: 'Flip cards to find matching pairs. Great for Alzheimer\'s prevention.',
    category: 'memory',
    icon: 'grid',
    bg: '#FDEBE6',
    fg: '#E86A50',
    time: '3 min',
    difficulty: 'Easy',
    coinReward: 30,
    xpReward: 50,
  },
  {
    id: 'color-vision',
    name: 'Color Vision',
    description: 'Find the odd color out. Tests color perception and eye health.',
    category: 'eye',
    icon: 'eye',
    bg: '#EDE5F8',
    fg: '#8B6CC1',
    time: '2 min',
    difficulty: 'Medium',
    coinReward: 25,
    xpReward: 40,
  },
  {
    id: 'reaction-time',
    name: 'Reaction Time',
    description: 'Tap as fast as you can when the screen changes. Measures brain speed.',
    category: 'brain',
    icon: 'zap',
    bg: '#FEF3DC',
    fg: '#F5A623',
    time: '1 min',
    difficulty: 'Easy',
    coinReward: 20,
    xpReward: 30,
  },
  {
    id: 'pattern-recall',
    name: 'Pattern Recall',
    description: 'Remember and repeat the highlighted pattern. Trains working memory.',
    category: 'memory',
    icon: 'brain',
    bg: '#DFF6F0',
    fg: '#2AB89E',
    time: '3 min',
    difficulty: 'Medium',
    coinReward: 35,
    xpReward: 60,
  },
  {
    id: 'number-sequence',
    name: 'Number Sequence',
    description: 'Find the missing number in the sequence. Sharpens mental math.',
    category: 'brain',
    icon: 'hash',
    bg: '#E0EFFE',
    fg: '#4DA3E8',
    time: '2 min',
    difficulty: 'Hard',
    coinReward: 40,
    xpReward: 70,
  },
  {
    id: 'contrast-test',
    name: 'Contrast Test',
    description: 'Identify the lighter square. Checks contrast sensitivity of your eyes.',
    category: 'eye',
    icon: 'scan-eye',
    bg: '#FDE8EA',
    fg: '#E86A76',
    time: '2 min',
    difficulty: 'Easy',
    coinReward: 20,
    xpReward: 35,
  },
]
