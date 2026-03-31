import type { AvatarId } from '../data/avatars'

const src: Record<AvatarId, string> = {
  owl: '/avatars/owl.png',
  dog: '/avatars/dog.png',
  cat: '/avatars/cat.png',
  cat2: '/avatars/cat2.png',
}

const sleepSrc: Partial<Record<AvatarId, string>> = {
  owl: '/avatars/owl-sleep.png',
  cat: '/avatars/cat-sleep.png',
  cat2: '/avatars/cat2-sleep.png',
  dog: '/avatars/dog-sleep.png',
}

interface Props {
  avatar: AvatarId
  size?: number
  className?: string
  ring?: boolean
  level?: number
  sleeping?: boolean
}

export default function AvatarImg({ avatar, size = 80, className = '', ring, level, sleeping }: Props) {
  const r = size <= 36 ? 10 : size <= 48 ? 12 : size <= 64 ? 16 : 20
  return (
    <div
      className={`relative inline-block flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className={`w-full h-full overflow-hidden flex items-center justify-center ${ring ? 'ring-[3px] ring-coral/25' : ''}`}
        style={{ borderRadius: r }}
      >
        <img
          src={sleeping && sleepSrc[avatar] ? sleepSrc[avatar]! : src[avatar]}
          alt={avatar}
          draggable={false}
          className="w-full h-full object-contain select-none"
          style={sleeping && !sleepSrc[avatar] ? { filter: 'grayscale(0.4) brightness(0.85)' } : undefined}
        />
      </div>
      {sleeping && (
        <span className="zzz-anim absolute -top-1 -right-1 text-[14px] font-bold text-ink-muted pointer-events-none select-none">
          💤
        </span>
      )}
      {level != null && (
        <div
          className="absolute -bottom-1 -right-1 bg-coral text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-[var(--shadow-btn)]"
          style={{ width: size * 0.32, height: size * 0.32, minWidth: 18, minHeight: 18 }}
        >
          {level}
        </div>
      )}
    </div>
  )
}
