export type AvatarId = 'dog' | 'cat' | 'cat2' | 'panda'

export interface Avatar {
  id: AvatarId
  name: string
  bg: string
  price: number
}

export const avatars: Avatar[] = [
  { id: 'dog', name: 'Buddy', bg: '#F0AD2A', price: 0 },
  { id: 'cat', name: 'Whiskers', bg: '#1AC9C9', price: 100 },
  { id: 'cat2', name: 'Ginger', bg: '#5DD99A', price: 200 },
  { id: 'panda', name: 'Bamboo', bg: '#F04858', price: 350 },
]

export interface Accessory {
  id: string
  name: string
  icon: string
  price: number
}

export const accessories: Accessory[] = [
  { id: 'glasses', name: 'Glasses', icon: 'glasses', price: 50 },
  { id: 'mask', name: 'Shield', icon: 'shield', price: 30 },
  { id: 'crown', name: 'Crown', icon: 'crown', price: 500 },
  { id: 'bow', name: 'Bow Tie', icon: 'ribbon', price: 80 },
  { id: 'hat', name: 'Top Hat', icon: 'hat', price: 150 },
  { id: 'star', name: 'Star', icon: 'star', price: 200 },
]

export const dailyRewards = [
  { day: 1, coins: 10, label: 'Day 1' },
  { day: 2, coins: 20, label: 'Day 2' },
  { day: 3, coins: 30, label: 'Day 3' },
  { day: 4, coins: 50, label: 'Day 4' },
  { day: 5, coins: 75, label: 'Day 5' },
  { day: 6, coins: 100, label: 'Day 6' },
  { day: 7, coins: 200, label: 'Day 7' },
]

export const leaderboardData = [
  { rank: 1, name: 'ProGamer99', avatar: 'panda' as AvatarId, score: 12450 },
  { rank: 2, name: 'NinjaKitty', avatar: 'cat' as AvatarId, score: 11200 },
  { rank: 3, name: 'DogeMaster', avatar: 'dog' as AvatarId, score: 10800 },
  { rank: 4, name: 'PandaKing', avatar: 'panda' as AvatarId, score: 9500 },
  { rank: 5, name: 'CatWhisper', avatar: 'cat2' as AvatarId, score: 8900 },
  { rank: 6, name: 'FireDog', avatar: 'dog' as AvatarId, score: 7600 },
  { rank: 7, name: 'LunarCat', avatar: 'cat' as AvatarId, score: 6800 },
  { rank: 8, name: 'StarPanda', avatar: 'panda' as AvatarId, score: 5400 },
  { rank: 9, name: 'AceHunter', avatar: 'dog' as AvatarId, score: 4900 },
  { rank: 10, name: 'MoonCat', avatar: 'cat2' as AvatarId, score: 4200 },
]

export const dailyQuests = [
  { id: 'play3', title: 'Play 3 Games', icon: 'gamepad', progress: 2, total: 3, reward: 50 },
  { id: 'win1', title: 'Win a Match', icon: 'trophy', progress: 0, total: 1, reward: 100 },
  { id: 'visit_lb', title: 'Visit Leaderboard', icon: 'bar-chart', progress: 1, total: 1, reward: 20 },
]

export const featuredItems = [
  { id: 'crown', name: 'Crown', originalPrice: 500, salePrice: 350, color: '#F0AD2A' },
  { id: 'star', name: 'Star', originalPrice: 200, salePrice: 120, color: '#2DB574' },
  { id: 'hat', name: 'Top Hat', originalPrice: 150, salePrice: 99, color: '#1AC9C9' },
]

export const playerStats = { level: 12, xp: 340, xpToNext: 500 }
