import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import TestPreparation from './pupil-test/TestPreparation'
import CameraSetup from './pupil-test/CameraSetup'
import EyeTracker from './pupil-test/EyeTracker'
import PupilTestScreen from './pupil-test/PupilTestScreen'

const isAndroid = () => /android/i.test(navigator.userAgent)

const STEPS = ['Preparation', 'Camera Setup', 'Test Execution']

interface PupilTestProps {
  onComplete: (videoBlob?: Blob) => void
  onClose: () => void
  onError?: (msg: string) => void
}

export default function PupilTest({ onComplete, onClose, onError }: PupilTestProps) {
  const faceWasDetectedRef = useRef(false)
  const cameraVideoRef = useRef<HTMLDivElement>(null)

  const [activeStep, setActiveStep] = useState(0)
  const [faceDetected, setFaceDetected] = useState(isAndroid())
  const [eyeTrackerReady, setEyeTrackerReady] = useState(isAndroid())
  const [shouldStartTest, setShouldStartTest] = useState(false)
  const [isTestCompleted, setIsTestCompleted] = useState(false)
  const [shouldStopEyeTracker, setShouldStopEyeTracker] = useState(false)
  const [isCenteringComplete, setIsCenteringComplete] = useState(isAndroid())

  const handleCenteringComplete = useCallback(() => {
    setIsCenteringComplete(true)
  }, [])

  const handlePupilTestMediaRecorderStarted = useCallback(() => {
    setTimeout(() => setShouldStopEyeTracker(false), 1200)
  }, [])

  const handleNext = () => {
    if (activeStep === 1) {
      if (!isAndroid()) {
        if (!eyeTrackerReady) return
        if (!isCenteringComplete) return
      }
      // Stop eye tracker when entering test phase
      setShouldStopEyeTracker(true)
      faceWasDetectedRef.current = true
      document.documentElement.requestFullscreen?.()
    }
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setEyeTrackerReady(isAndroid())
      setShouldStartTest(false)
      setIsCenteringComplete(isAndroid())
      setShouldStopEyeTracker(false)
      setActiveStep((prev) => prev - 1)
    } else {
      onClose()
    }
  }

  const handleRetest = useCallback(() => {
    setShouldStartTest(false)
    setEyeTrackerReady(isAndroid())
    setIsTestCompleted(false)
    setIsCenteringComplete(isAndroid())
    setShouldStopEyeTracker(false)
    setActiveStep(0)
  }, [])

  // Fullscreen exit detection during test
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (activeStep === 2 && !document.fullscreenElement) {
        handleRetest()
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [activeStep, handleRetest])

  // Scroll camera into view
  useEffect(() => {
    if (shouldStartTest && cameraVideoRef.current) {
      setTimeout(() => {
        cameraVideoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [shouldStartTest])

  // Face tracking loss detection
  useEffect(() => {
    if (isAndroid()) return

    if (eyeTrackerReady && shouldStartTest && !isTestCompleted) {
      if (!faceDetected && faceWasDetectedRef.current && activeStep === 2) {
        onError?.('Face tracking lost! The test will restart.')
        handleRetest()
      }
      faceWasDetectedRef.current = faceDetected
    }
  }, [faceDetected, eyeTrackerReady, shouldStartTest, activeStep, isTestCompleted, onError, handleRetest])

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
    )
  }

  // Steps 1 & 2: Preparation / Camera Setup overlay
  return (
    <div className="fixed inset-0 z-[60] bg-bg overflow-y-auto">
      <div className="max-w-[430px] md:max-w-[600px] mx-auto px-5 md:px-8 py-6 md:py-8 flex flex-col gap-5 min-h-dvh">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] md:text-[22px] font-bold text-ink">Eye Check</h2>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border-none cursor-pointer"
          >
            <X size={16} className="text-ink" />
          </motion.button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full h-[4px] rounded-full transition-colors ${
                  i <= activeStep ? 'bg-coral' : 'bg-muted'
                }`}
              />
              <span className={`text-[10px] md:text-[11px] font-semibold ${
                i <= activeStep ? 'text-coral' : 'text-ink-muted'
              }`}>
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
              <CameraSetup shouldStartTest={shouldStartTest} setShouldStartTest={setShouldStartTest} />

              {/* Eye tracker (visible during camera setup, non-Android) */}
              {shouldStartTest && !isAndroid() && (
                <div ref={cameraVideoRef} className="mt-4 max-w-[600px] mx-auto">
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
        <div className="flex items-center justify-between py-2">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleBack}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-muted text-ink text-[13px] font-semibold border-none cursor-pointer"
          >
            <ArrowLeft size={15} />
            Back
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleNext}
            disabled={activeStep === 1 && !isAndroid() && (!eyeTrackerReady || !isCenteringComplete)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-bold border-none cursor-pointer shadow-[var(--shadow-btn)] ${
              activeStep === 1 && !isAndroid() && (!eyeTrackerReady || !isCenteringComplete)
                ? 'bg-muted text-ink-muted cursor-not-allowed shadow-none'
                : 'bg-coral text-white'
            }`}
          >
            Next
            <ArrowRight size={15} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
