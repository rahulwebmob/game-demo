import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, Check, Clock, Zap } from "@/components/animate-ui/icons/index.ts";
import AvatarImg from "../avatar-img";
import { useAppSelector } from "../../store/hooks";
import { useSound } from "../../hooks/use-sound";
import TestPreparation from "./test-preparation";
import CameraSetup from "./camera-setup";
import EyeTracker from "./eye-tracker";
import PupilTestScreen from "./pupil-test-screen";

const isAndroid = () => /android/i.test(navigator.userAgent);

const STEPS = ["Preparation", "Camera Setup", "Test Execution"];

interface PupilTestProps {
  onComplete: (videoBlob?: Blob) => void;
  onClose: () => void;
  onError?: (msg: string) => void;
}

export default function PupilTest({
  onComplete,
  onClose,
  onError,
}: PupilTestProps) {
  const sfx = useSound();
  const { avatar, accessory } = useAppSelector((s) => s.player);
  const faceWasDetectedRef = useRef(false);
  const cameraVideoRef = useRef<HTMLDivElement>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [faceDetected, setFaceDetected] = useState(isAndroid());
  const [eyeTrackerReady, setEyeTrackerReady] = useState(isAndroid());
  const [shouldStartTest, setShouldStartTest] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [shouldStopEyeTracker, setShouldStopEyeTracker] = useState(false);
  const [isCenteringComplete, setIsCenteringComplete] = useState(isAndroid());

  const handleCenteringComplete = useCallback(() => {
    setIsCenteringComplete(true);
  }, []);

  const handlePupilTestMediaRecorderStarted = useCallback(() => {
    setTimeout(() => setShouldStopEyeTracker(false), 1200);
  }, []);

  const handleNext = () => {
    if (activeStep === 1) {
      if (!isAndroid()) {
        if (!eyeTrackerReady) return;
        if (!isCenteringComplete) return;
      }
      // Stop eye tracker when entering test phase
      setShouldStopEyeTracker(true);
      faceWasDetectedRef.current = true;
      document.documentElement.requestFullscreen?.();
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setEyeTrackerReady(isAndroid());
      setShouldStartTest(false);
      setIsCenteringComplete(isAndroid());
      setShouldStopEyeTracker(false);
      setActiveStep((prev) => prev - 1);
    } else {
      onClose();
    }
  };

  const handleRetest = useCallback(() => {
    setShouldStartTest(false);
    setEyeTrackerReady(isAndroid());
    setIsTestCompleted(false);
    setIsCenteringComplete(isAndroid());
    setShouldStopEyeTracker(false);
    setActiveStep(0);
  }, []);

  // Fullscreen exit detection during test
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (activeStep === 2 && !document.fullscreenElement) {
        handleRetest();
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [activeStep, handleRetest]);

  // Scroll camera into view
  useEffect(() => {
    if (shouldStartTest && cameraVideoRef.current) {
      setTimeout(() => {
        cameraVideoRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [shouldStartTest]);

  // Face tracking loss detection
  const handleRetestRef = useRef(handleRetest);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    handleRetestRef.current = handleRetest;
  }, [handleRetest]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (isAndroid()) return;
    if (!eyeTrackerReady || !shouldStartTest || isTestCompleted) return;
    if (!faceDetected && faceWasDetectedRef.current && activeStep === 2) {
      onErrorRef.current?.("Face tracking lost! The test will restart.");
      queueMicrotask(() => handleRetestRef.current());
    }
    faceWasDetectedRef.current = faceDetected;
  }, [
    faceDetected,
    eyeTrackerReady,
    shouldStartTest,
    activeStep,
    isTestCompleted,
  ]);

  // Step 3: Full-screen pupil test
  if (activeStep === 2) {
    return (
      <>
        <PupilTestScreen
          onComplete={onComplete}
          onTestComplete={() => setIsTestCompleted(true)}
          onMediaRecorderStarted={handlePupilTestMediaRecorderStarted}
          onError={onError}
        />
        {/* Hidden eye tracker for face tracking during test (non-Android only) */}
        {shouldStartTest && !isTestCompleted && !isAndroid() && (
          <div className="hidden">
            <EyeTracker
              faceDetected={faceDetected}
              shouldStop={shouldStopEyeTracker}
              setFaceDetected={setFaceDetected}
              onLoad={() => setEyeTrackerReady(true)}
              isForPupilTest
            />
          </div>
        )}
      </>
    );
  }

  // Steps 1 & 2: Preparation / Camera Setup overlay
  return (
    <div className="fixed inset-0 z-[60] bg-bg overflow-y-auto">
      {/* Ambient background blobs (matching main app) */}
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
      <div className="relative z-10 max-w-[430px] md:max-w-[768px] lg:max-w-[960px] mx-auto px-5 md:px-8 lg:px-10 pt-7 md:pt-10 pb-6 md:pb-8 flex flex-col gap-5 md:gap-7">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-coral-light flex items-center justify-center"
            >
              <Eye size={20} className="text-coral" />
            </motion.div>
            <div>
              <h2 className="text-[22px] md:text-[28px] font-bold text-ink tracking-tight">
                Eye Check
              </h2>
              <p className="text-[11px] md:text-[13px] text-ink-muted">
                Complete this test to earn energy & unlock games
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-light">
            <Clock size={12} className="text-teal" />
            <span className="text-[10px] md:text-[11px] font-bold text-teal">~20s</span>
          </div>
        </motion.div>

        {/* Avatar: sleeping → awake */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center justify-center gap-4 md:gap-6"
        >
          {/* Sleeping */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative">
              <AvatarImg avatar={avatar} size={64} accessory={accessory} sleeping />
              {/* ZZZ */}
              <motion.span
                className="absolute -top-2 -right-2 font-extrabold text-[14px] pointer-events-none select-none"
                style={{ color: "var(--color-gold)" }}
                animate={{ y: [0, -10, -20], opacity: [0, 0.7, 0], rotate: [-5, 5, -5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
              >
                z
              </motion.span>
              <motion.span
                className="absolute -top-4 right-[-14px] font-extrabold text-[10px] pointer-events-none select-none"
                style={{ color: "var(--color-gold)" }}
                animate={{ y: [0, -12, -24], opacity: [0, 0.5, 0], rotate: [5, -5, 5] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
              >
                z
              </motion.span>
            </div>
            <span className="text-[10px] font-semibold text-ink-muted">Tired</span>
          </div>

          {/* Arrow */}
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight size={20} className="text-coral" strokeWidth={2.5} />
          </motion.div>

          {/* Awake */}
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <AvatarImg avatar={avatar} size={64} accessory={accessory} />
            </motion.div>
            <span className="text-[10px] font-bold text-teal">Energized!</span>
          </div>
        </motion.div>

        {/* Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="flex items-center gap-2 md:gap-3 glass-card rounded-2xl p-3 md:p-3.5 shadow-[var(--shadow-soft)]"
        >
          {STEPS.map((label, i) => {
            const completed = i < activeStep;
            const active = i === activeStep;
            return (
              <div
                key={label}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-1.5 w-full">
                  <motion.div
                    animate={{
                      background: completed
                        ? "var(--color-teal)"
                        : active
                          ? "var(--color-coral)"
                          : "var(--color-muted)",
                      scale: completed ? [1, 1.15, 1] : 1,
                    }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    {completed ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      >
                        <Check size={11} className="text-white" strokeWidth={3} />
                      </motion.div>
                    ) : (
                      <span className={`text-[9px] md:text-[10px] font-bold ${active ? "text-white" : "text-ink-muted"}`}>
                        {i + 1}
                      </span>
                    )}
                  </motion.div>
                  <div className="flex-1 h-[4px] md:h-[5px] rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: completed ? "var(--color-teal)" : "var(--color-coral)" }}
                      initial={{ width: "0%" }}
                      animate={{ width: i <= activeStep ? "100%" : "0%" }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <motion.span
                  animate={{
                    color: completed
                      ? "var(--color-teal)"
                      : active
                        ? "var(--color-coral)"
                        : "var(--color-ink-muted)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-[9px] md:text-[11px] font-semibold"
                >
                  {label}
                </motion.span>
              </div>
            );
          })}
        </motion.div>

        {/* Step content */}
        <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {activeStep === 0 && <TestPreparation />}
          {activeStep === 1 && (
            <>
              <CameraSetup
                shouldStartTest={shouldStartTest}
                setShouldStartTest={setShouldStartTest}
              />

              {/* Eye tracker (visible during camera setup, non-Android) */}
              {shouldStartTest && !isAndroid() && (
                <div ref={cameraVideoRef} className="mt-4 md:mt-6">
                  <EyeTracker
                    faceDetected={faceDetected}
                    shouldStop={shouldStopEyeTracker}
                    setFaceDetected={setFaceDetected}
                    onLoad={() => setEyeTrackerReady(true)}
                    onCenteringComplete={handleCenteringComplete}
                    isForPupilTest={false}
                  />
                </div>
              )}
            </>
          )}
        </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between py-2 md:py-3">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              sfx("tap");
              handleBack();
            }}
            className="flex items-center gap-1.5 px-5 md:px-6 py-2.5 md:py-3 rounded-xl bg-muted text-ink text-[13px] md:text-[14px] font-semibold border-none cursor-pointer"
          >
            <ArrowLeft size={15} />
            {activeStep === 0 ? "Close" : "Back"}
          </motion.button>
          {(() => {
            const isDisabled =
              activeStep === 1 &&
              !isAndroid() &&
              (!eyeTrackerReady || !isCenteringComplete);
            const isStartTest = activeStep === 1;
            return (
              <motion.button
                whileTap={isDisabled ? undefined : { scale: 0.93 }}
                whileHover={isDisabled ? undefined : { y: -1 }}
                onClick={() => {
                  sfx("navigate");
                  handleNext();
                }}
                disabled={isDisabled}
                className={`flex items-center gap-1.5 px-5 md:px-6 py-2.5 md:py-3 rounded-xl text-[13px] md:text-[14px] font-bold border-none cursor-pointer relative overflow-hidden ${
                  isDisabled
                    ? "bg-muted text-ink-muted cursor-not-allowed"
                    : "text-white shadow-[var(--shadow-btn)]"
                }`}
                style={
                  isDisabled
                    ? undefined
                    : { background: "linear-gradient(135deg, var(--color-coral), var(--color-teal))" }
                }
              >
                {/* Shimmer on active button */}
                {!isDisabled && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                  />
                )}
                {isStartTest && !isDisabled && <Zap size={14} className="relative z-10" />}
                <span className="relative z-10">{isStartTest ? "Start Test" : "Next"}</span>
                <ArrowRight size={15} className="relative z-10" />
              </motion.button>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
