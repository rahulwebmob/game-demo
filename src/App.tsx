import { useEffect, useCallback, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NavBar from "./components/nav-bar";
import SleepOverlay from "./components/sleep-overlay";
import ToastContainer from "./components/toast";
import ErrorBoundary from "./components/error-boundary";
import Skeleton from "./components/skeleton";
import { useTheme, isDarkTheme } from "./hooks/use-theme";
import { useSound } from "./hooks/use-sound";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import {
  navigate as navAction,
  finishLoading,
  setShowPupilTest,
  setShowSleepOverlay,
  addToast,
  dismissToast,
} from "./store/ui-slice";
import { fillEnergy } from "./store/player-slice";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/home"));
const Games = lazy(() => import("./pages/games"));
const Customize = lazy(() => import("./pages/customize"));
const Leaderboard = lazy(() => import("./pages/leaderboard"));
const DailyLogin = lazy(() => import("./pages/daily-login"));
const Profile = lazy(() => import("./pages/profile"));
const PupilTest = lazy(() => import("./components/pupil-test"));

export default function App() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const sfx = useSound();

  const { tab, direction, loading, showPupilTest, showSleepOverlay, toasts } =
    useAppSelector((s) => s.ui);
  const { avatar, energy, claimedToday } = useAppSelector((s) => s.player);

  // Scroll to top on hard refresh + clean up legacy password storage
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    localStorage.removeItem("gamerify-password");
  }, []);

  // SW update + offline/online listeners
  useEffect(() => {
    const onUpdate = () =>
      dispatch(
        addToast({ message: "New version available — refresh to update!" }),
      );
    const onOffline = () =>
      dispatch(addToast({ message: "You are offline" }));
    const onOnline = () =>
      dispatch(addToast({ message: "Back online!" }));

    window.addEventListener("sw-update-available", onUpdate);
    window.addEventListener("app-offline", onOffline);
    window.addEventListener("app-online", onOnline);
    return () => {
      window.removeEventListener("sw-update-available", onUpdate);
      window.removeEventListener("app-offline", onOffline);
      window.removeEventListener("app-online", onOnline);
    };
  }, [dispatch]);

  // Navigate with direction + skeleton
  const navigate = useCallback(
    (to: typeof tab) => {
      sfx("navigate");
      dispatch(navAction(to));
      window.scrollTo({ top: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      setTimeout(() => {
        dispatch(finishLoading());
        window.scrollTo({ top: 0, behavior: "instant" });
      }, 180);
    },
    [sfx, dispatch],
  );

  const pageVariants = {
    enter: (d: number) => ({ opacity: 0, x: d * 60, scale: 0.98 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d: number) => ({ opacity: 0, x: d * -40, scale: 0.98 }),
  };

  return (
    <div className="min-h-dvh bg-bg max-w-[430px] md:max-w-[768px] lg:max-w-[960px] mx-auto relative overflow-hidden">
      {/* Sleep overlay (first load) */}
      <AnimatePresence>
        {showSleepOverlay && energy === 0 && !showPupilTest && (
          <SleepOverlay
            avatar={avatar}
            onStartEyeCheck={() => {
              dispatch(setShowSleepOverlay(false));
              dispatch(setShowPupilTest(true));
            }}
            onClose={() => dispatch(setShowSleepOverlay(false))}
          />
        )}
      </AnimatePresence>

      {/* Pupil Test overlay */}
      {showPupilTest && (
        <Suspense fallback={null}>
          <ErrorBoundary fallbackTitle="Eye check failed">
            <PupilTest
              onComplete={() => {
                dispatch(fillEnergy());
                dispatch(setShowSleepOverlay(false));
                dispatch(setShowPupilTest(false));
                dispatch(addToast({ message: "Energy restored! 5/5" }));
                sfx("success");
              }}
              onClose={() => dispatch(setShowPupilTest(false))}
              onError={(msg) => {
                dispatch(addToast({ message: msg }));
                dispatch(setShowPupilTest(false));
              }}
            />
          </ErrorBoundary>
        </Suspense>
      )}

      {/* Toasts */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => dispatch(dismissToast(id))}
      />

      {/* Ambient background blobs (hidden on dark themes) */}
      {!isDarkTheme(theme.themeId) && (
        <>
          <motion.div
            className="fixed w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--color-coral) 8%, transparent), transparent 70%)",
              top: "-8%",
              right: "-12%",
            }}
            animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="fixed w-[220px] h-[220px] md:w-[320px] md:h-[320px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--color-gold) 6%, transparent), transparent 70%)",
              bottom: "10%",
              left: "-10%",
            }}
            animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="fixed w-[180px] h-[180px] md:w-[260px] md:h-[260px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--color-violet) 5%, transparent), transparent 70%)",
              top: "40%",
              right: "-5%",
            }}
            animate={{ x: [0, 12, 0], y: [0, 18, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      <div className="relative z-10 pb-24 md:pb-28 min-h-dvh">
        <AnimatePresence mode="wait" custom={direction}>
          {loading ? (
            <Skeleton
              key="skeleton"
              variant={tab as "home" | "games" | "customize" | "leaderboard" | "daily" | "profile"}
            />
          ) : (
            <motion.div
              key={tab}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Suspense fallback={<Skeleton variant="home" />}>
                <ErrorBoundary fallbackTitle="Page failed to load">
                  {tab === "home" && <Home navigate={navigate} />}
                  {tab === "games" && <Games />}
                  {tab === "customize" && <Customize navigate={navigate} />}
                  {tab === "leaderboard" && <Leaderboard />}
                  {tab === "daily" && <DailyLogin />}
                  {tab === "profile" && <Profile navigate={navigate} />}
                </ErrorBoundary>
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <NavBar active={tab} onChange={navigate} dot={!claimedToday} />
    </div>
  );
}
