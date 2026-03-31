import { motion } from 'framer-motion'

function Bone({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton-bone rounded-2xl ${className}`} />
  )
}

export default function Skeleton({ variant = 'home' }: { variant?: 'home' | 'customize' | 'leaderboard' | 'daily' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col px-5 md:px-8 lg:px-10 pt-7 md:pt-10 pb-2 gap-5 md:gap-7"
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Bone className="w-10 h-10 md:w-12 md:h-12 !rounded-[14px]" />
          <Bone className="w-32 h-6 md:w-40 md:h-7" />
        </div>
        <Bone className="w-20 h-8 !rounded-full" />
      </div>

      {variant === 'home' && (
        <>
          <Bone className="w-3/4 h-14 md:h-16" />
          <Bone className="w-full h-12 !rounded-2xl" />
          <Bone className="w-full h-24 md:h-28 !rounded-2xl" />
          <div className="grid grid-cols-4 gap-3 md:gap-5">
            {[0, 1, 2, 3].map(i => <Bone key={i} className="h-20 md:h-24" />)}
          </div>
          <Bone className="w-full h-40 md:h-48 !rounded-3xl" />
        </>
      )}

      {variant === 'leaderboard' && (
        <>
          <Bone className="w-full h-12 !rounded-2xl" />
          <div className="flex items-end justify-center gap-3 md:gap-5 pt-3">
            <Bone className="flex-1 h-36 md:h-44" />
            <Bone className="flex-[1.25] h-48 md:h-56" />
            <Bone className="flex-1 h-28 md:h-36" />
          </div>
          {[0, 1, 2, 3].map(i => <Bone key={i} className="w-full h-14 md:h-16" />)}
        </>
      )}

      {variant === 'customize' && (
        <>
          <Bone className="w-full h-48 md:h-56 !rounded-3xl" />
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            {[0, 1, 2, 3].map(i => <Bone key={i} className="h-24 md:h-28" />)}
          </div>
        </>
      )}

      {variant === 'daily' && (
        <>
          <Bone className="w-full h-52 md:h-60 !rounded-3xl" />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 md:gap-3">
            {[0, 1, 2, 3, 4, 5].map(i => <Bone key={i} className="h-28 md:h-32" />)}
          </div>
          <Bone className="w-full h-14 md:h-16" />
        </>
      )}
    </motion.div>
  )
}
