import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X, Eye } from "lucide-react";
import { useSound } from "../hooks/useSound";
import TestPreparation from "./pupil-test/TestPreparation";
import CameraSetup from "./pupil-test/CameraSetup";
import EyeTracker from "./pupil-test/EyeTracker";
import PupilTestScreen from "./pupil-test/PupilTestScreen";

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
      <div className="relative z-10 max-w-[430px] md:max-w-[768px] lg:max-w-[960px] mx-auto px-5 md:px-8 lg:px-10 py-7 md:py-10 flex flex-col gap-5 md:gap-7 min-h-dvh">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-coral-light flex items-center justify-center">
              <Eye size={20} className="text-coral" />
            </div>
            <div>
              <h2 className="text-[22px] md:text-[28px] font-bold text-ink tracking-tight">
                Eye Check
              </h2>
              <p className="text-[11px] md:text-[13px] text-ink-muted">
                Complete this test to earn energy & unlock games
              </p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => {
              sfx("modalClose");
              onClose();
            }}
            aria-label="Close eye check"
            className="w-11 h-11 md:w-12 md:h-12 rounded-full glass-card border border-border flex items-center justify-center border-none cursor-pointer shadow-[var(--shadow-soft)]"
          >
            <X size={16} className="text-ink" />
          </motion.button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 md:gap-3 glass-card rounded-2xl p-2 md:p-2.5 shadow-[var(--shadow-soft)]">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center gap-1.5"
            >
              <div
                className={`w-full h-[4px] md:h-[5px] rounded-full transition-colors ${
                  i <= activeStep ? "bg-coral" : "bg-muted"
                }`}
              />
              <span
                className={`text-[10px] md:text-[12px] font-semibold ${
                  i <= activeStep ? "text-coral" : "text-ink-muted"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1">
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
        </div>

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
            Back
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              sfx("navigate");
              handleNext();
            }}
            disabled={
              activeStep === 1 &&
              !isAndroid() &&
              (!eyeTrackerReady || !isCenteringComplete)
            }
            className={`flex items-center gap-1.5 px-5 md:px-6 py-2.5 md:py-3 rounded-xl text-[13px] md:text-[14px] font-bold border-none cursor-pointer shadow-[var(--shadow-btn)] ${
              activeStep === 1 &&
              !isAndroid() &&
              (!eyeTrackerReady || !isCenteringComplete)
                ? "bg-muted text-ink-muted cursor-not-allowed shadow-none"
                : "bg-coral text-white"
            }`}
          >
            Next
            <ArrowRight size={15} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
