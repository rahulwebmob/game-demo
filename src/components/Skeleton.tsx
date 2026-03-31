import { motion } from "framer-motion";

function Bone({ className = "" }: { className?: string }) {
  return <div className={`skeleton-bone rounded-2xl ${className}`} />;
}

export default function Skeleton({
  variant = "home",
}: {
  variant?: "home" | "games" | "customize" | "leaderboard" | "daily" | "profile";
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col px-5 md:px-8 lg:px-10 pt-7 md:pt-10 pb-2 gap-5 md:gap-7"
    >
      {variant === "home" && (
        <>
          {/* Header: greeting + avatar */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <Bone className="w-40 h-7 md:w-48 md:h-8" />
              <Bone className="w-28 h-4 md:w-32" />
            </div>
            <div className="flex items-center gap-3">
              <Bone className="w-10 h-10 !rounded-full" />
              <Bone className="w-12 h-12 !rounded-full" />
            </div>
          </div>
          {/* Hero text */}
          <div className="flex flex-col gap-2">
            <Bone className="w-3/4 h-7 md:h-8" />
            <Bone className="w-1/2 h-4" />
          </div>
          {/* Search */}
          <Bone className="w-full h-12 md:h-14 !rounded-2xl" />
          {/* XP bar */}
          <Bone className="w-full h-20 md:h-24 !rounded-2xl" />
          {/* Categories */}
          <div className="grid grid-cols-4 gap-3 md:gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <Bone className="w-[54px] h-[54px] md:w-[68px] md:h-[68px]" />
                <Bone className="w-10 h-3" />
              </div>
            ))}
          </div>
          {/* Eye check CTA */}
          <Bone className="w-full h-20 md:h-24 !rounded-2xl" />
          {/* Featured games */}
          <div className="flex flex-col gap-3">
            <Bone className="w-32 h-5" />
            <Bone className="w-full h-24 !rounded-3xl" />
            <Bone className="w-full h-24 !rounded-3xl" />
          </div>
        </>
      )}

      {variant === "games" && (
        <>
          {/* Header: icon + title + badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bone className="w-10 h-10 md:w-12 md:h-12 !rounded-[14px]" />
              <div className="flex flex-col gap-1">
                <Bone className="w-24 h-7 md:w-32 md:h-8" />
                <Bone className="w-32 h-3.5" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bone className="w-16 h-8 !rounded-full" />
              <Bone className="w-16 h-8 !rounded-full" />
            </div>
          </div>
          {/* Filter pills */}
          <Bone className="w-full h-12 !rounded-2xl" />
          {/* Game cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl glass-card shadow-[var(--shadow-soft)]">
                <Bone className="w-12 h-12 md:w-14 md:h-14 flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <Bone className="w-3/4 h-5" />
                  <Bone className="w-full h-3" />
                  <div className="flex items-center gap-3 mt-1">
                    <Bone className="w-12 h-3" />
                    <Bone className="w-10 h-3" />
                    <Bone className="w-14 h-5 !rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {variant === "profile" && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Bone className="w-24 h-7 md:w-28 md:h-8" />
              <Bone className="w-32 h-3.5" />
            </div>
            <Bone className="w-20 h-8 !rounded-full" />
          </div>
          {/* Profile card */}
          <div className="rounded-2xl p-5 glass-card shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-4">
              <Bone className="w-[72px] h-[72px] !rounded-full flex-shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Bone className="w-32 h-6" />
                <Bone className="w-48 h-3.5" />
                <div className="flex gap-3 mt-1">
                  <Bone className="w-16 h-3.5" />
                  <Bone className="w-16 h-3.5" />
                  <Bone className="w-12 h-3.5" />
                </div>
              </div>
            </div>
            <Bone className="w-full h-2 mt-4 !rounded-full" />
          </div>
          {/* Game stats grid */}
          <div className="flex flex-col gap-3">
            <Bone className="w-32 h-5" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2 py-4 rounded-2xl glass-card shadow-[var(--shadow-soft)]">
                  <Bone className="w-9 h-9 !rounded-xl" />
                  <Bone className="w-10 h-6" />
                  <Bone className="w-16 h-3" />
                </div>
              ))}
            </div>
          </div>
          {/* Skill breakdown */}
          <div className="rounded-2xl p-4 glass-card shadow-[var(--shadow-soft)]">
            <Bone className="w-36 h-5 mb-4" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="mb-3">
                <Bone className="w-20 h-3.5 mb-1.5" />
                <Bone className="w-full h-[5px] !rounded-full" />
              </div>
            ))}
          </div>
          {/* Achievements */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl glass-card shadow-[var(--shadow-soft)]">
                <Bone className="w-10 h-10 !rounded-xl" />
                <Bone className="w-12 h-3" />
              </div>
            ))}
          </div>
        </>
      )}

      {variant === "customize" && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bone className="w-10 h-10 !rounded-[14px]" />
              <Bone className="w-32 h-7" />
            </div>
            <Bone className="w-20 h-8 !rounded-full" />
          </div>
          {/* Avatar preview */}
          <div className="flex flex-col items-center gap-3 py-6 rounded-3xl glass-card shadow-[var(--shadow-soft)]">
            <Bone className="w-28 h-28 md:w-36 md:h-36 !rounded-full" />
            <Bone className="w-24 h-5" />
          </div>
          {/* Section title */}
          <Bone className="w-24 h-5" />
          {/* Avatar grid */}
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 py-3 rounded-2xl glass-card shadow-[var(--shadow-soft)]">
                <Bone className="w-14 h-14 !rounded-full" />
                <Bone className="w-12 h-3" />
              </div>
            ))}
          </div>
          {/* Accessories title */}
          <Bone className="w-28 h-5" />
          {/* Accessories grid */}
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 py-3 rounded-2xl glass-card shadow-[var(--shadow-soft)]">
                <Bone className="w-10 h-10 !rounded-xl" />
                <Bone className="w-12 h-3" />
              </div>
            ))}
          </div>
        </>
      )}

      {variant === "leaderboard" && (
        <>
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <Bone className="w-10 h-10 md:w-12 md:h-12 !rounded-[14px]" />
            <Bone className="w-36 h-7 md:w-44 md:h-8" />
          </div>
          {/* Filter pills */}
          <Bone className="w-full h-12 !rounded-2xl" />
          {/* Podium */}
          <div className="flex items-end justify-center gap-3 md:gap-5 pt-3 md:px-8">
            <div className="flex-1 flex flex-col items-center gap-2">
              <Bone className="w-11 h-11 !rounded-full" />
              <Bone className="w-16 h-3" />
              <Bone className="w-full h-[68px] md:h-[90px] !rounded-t-2xl !rounded-b-none" />
            </div>
            <div className="flex-[1.25] flex flex-col items-center gap-2">
              <Bone className="w-14 h-14 !rounded-full" />
              <Bone className="w-20 h-3" />
              <Bone className="w-full h-[100px] md:h-[130px] !rounded-t-2xl !rounded-b-none" />
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <Bone className="w-11 h-11 !rounded-full" />
              <Bone className="w-16 h-3" />
              <Bone className="w-full h-[52px] md:h-[70px] !rounded-t-2xl !rounded-b-none" />
            </div>
          </div>
          {/* Your rank */}
          <Bone className="w-full h-14 md:h-16" />
          {/* Player rows */}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-card shadow-[var(--shadow-soft)]">
              <Bone className="w-5 h-5" />
              <Bone className="w-10 h-10 !rounded-full" />
              <Bone className="flex-1 h-4" />
              <Bone className="w-16 h-4" />
            </div>
          ))}
        </>
      )}

      {variant === "daily" && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bone className="w-10 h-10 md:w-12 md:h-12 !rounded-[14px]" />
              <Bone className="w-36 h-7 md:w-44 md:h-8" />
            </div>
            <div className="flex items-center gap-2">
              <Bone className="w-16 h-8 !rounded-full" />
              <Bone className="w-16 h-8 !rounded-full" />
            </div>
          </div>
          {/* Streak hero */}
          <div className="flex flex-col items-center gap-4 py-6 rounded-3xl glass-card shadow-[var(--shadow-soft)]">
            <Bone className="w-[68px] h-[68px] md:w-[84px] md:h-[84px] !rounded-[22px]" />
            <Bone className="w-16 h-10" />
            <Bone className="w-24 h-4" />
            {/* Week dots */}
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <Bone key={i} className="w-[34px] h-[34px] md:w-[42px] md:h-[42px] !rounded-full" />
              ))}
            </div>
          </div>
          {/* Day 1-6 grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 md:gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 py-4 rounded-2xl glass-card shadow-[var(--shadow-soft)]">
                <Bone className="w-6 h-6 !rounded-full" />
                <Bone className="w-10 h-3" />
                <Bone className="w-12 h-4" />
              </div>
            ))}
          </div>
          {/* Day 7 jackpot */}
          <Bone className="w-full h-16 md:h-20" />
          {/* Claim button */}
          <Bone className="w-full h-14 md:h-16" />
        </>
      )}
    </motion.div>
  );
}
