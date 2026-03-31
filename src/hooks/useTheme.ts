import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type ThemeId = 'cool' | 'warm'

const themes: Record<ThemeId, Record<string, string>> = {
  cool: {
    '--color-bg': '#EDF3F8',
    '--color-card': '#FFFFFF',
    '--color-muted': '#E8ECF0',
    '--color-border': '#C8CED2',
    '--color-coral': '#7BA7B5',
    '--color-coral-light': '#E0EEF2',
    '--color-coral-dark': '#5E8E9C',
    '--color-teal': '#4DC9A0',
    '--color-teal-light': '#DFF6F0',
    '--color-gold': '#8CC99D',
    '--color-gold-light': '#E0F5E9',
    '--color-violet': '#384D56',
    '--color-violet-light': '#E8ECF0',
    '--color-sky': '#A8C4D0',
    '--color-sky-light': '#EDF3F8',
    '--color-green': '#4DC9A0',
    '--color-green-light': '#DFF6F0',
    '--color-rose': '#5E6E76',
    '--color-rose-light': '#E8ECF0',
    '--color-ink': '#1A2A2E',
    '--color-ink-secondary': '#5E6E76',
    '--color-ink-muted': '#ACB4BA',
    '--shadow-card': '0 2px 12px rgba(30, 48, 56, 0.06)',
    '--shadow-btn': '0 4px 16px rgba(123, 167, 181, 0.22)',
    '--shadow-soft': '0 1px 4px rgba(30, 48, 56, 0.04)',
    '--shadow-elevated': '0 4px 24px rgba(30, 48, 56, 0.08), 0 1px 3px rgba(30, 48, 56, 0.04)',
  },
  warm: {
    '--color-bg': '#FFF5EE',
    '--color-card': '#FFFFFF',
    '--color-muted': '#F7EBE3',
    '--color-border': '#F0DDD3',
    '--color-coral': '#E86A50',
    '--color-coral-light': '#FDEBE6',
    '--color-coral-dark': '#D0503A',
    '--color-teal': '#2AB89E',
    '--color-teal-light': '#DFF6F0',
    '--color-gold': '#F5A623',
    '--color-gold-light': '#FEF3DC',
    '--color-violet': '#8B6CC1',
    '--color-violet-light': '#EDE5F8',
    '--color-sky': '#4DA3E8',
    '--color-sky-light': '#E0EFFE',
    '--color-green': '#4CB870',
    '--color-green-light': '#E0F5E9',
    '--color-rose': '#E86A76',
    '--color-rose-light': '#FDE8EA',
    '--color-ink': '#1E1B18',
    '--color-ink-secondary': '#6B6560',
    '--color-ink-muted': '#A9A19A',
    '--shadow-card': '0 2px 12px rgba(120, 80, 50, 0.06)',
    '--shadow-btn': '0 4px 16px rgba(232, 106, 80, 0.22)',
    '--shadow-soft': '0 1px 4px rgba(120, 80, 50, 0.04)',
    '--shadow-elevated': '0 4px 24px rgba(120, 80, 50, 0.08), 0 1px 3px rgba(120, 80, 50, 0.04)',
  },
}

export const themeLabels: Record<ThemeId, string> = {
  cool: 'Arctic Breeze',
  warm: 'Sunset Glow',
}

export function useTheme() {
  const [themeId, setThemeId] = useLocalStorage<ThemeId>('gamerify-theme', 'cool')

  useEffect(() => {
    const vars = themes[themeId]
    const root = document.documentElement
    for (const [key, val] of Object.entries(vars)) {
      root.style.setProperty(key, val)
    }
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', vars['--color-bg'])
  }, [themeId])

  return { themeId, setThemeId }
}
