import type { AvatarId } from '../data/avatars'

const src: Record<AvatarId, string> = {
  dog: '/avatars/dog.png',
  cat: '/avatars/cat.png',
  cat2: '/avatars/cat2.png',
  panda: '/avatars/panda.png',
}

interface Props {
  avatar: AvatarId
  size?: number
  className?: string
  ring?: boolean
  level?: number
}

export default function AvatarImg({ avatar, size = 80, className = '', ring, level }: Props) {
  const r = size <= 36 ? 10 : size <= 48 ? 12 : size <= 64 ? 16 : 20
  return (
    <div className="relative inline-block flex-shrink-0">
      <img
        src={src[avatar]}
        alt={avatar}
        draggable={false}
        className={`object-cover select-none ${ring ? 'ring-[3px] ring-coral/25' : ''} ${className}`}
        style={{ width: size, height: size, borderRadius: r }}
      />
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
