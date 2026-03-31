import { useEffect, useRef, useState } from 'react'
import * as tf from '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-cpu'
import '@tensorflow/tfjs-backend-webgl'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'

const isAndroid = () => /android/i.test(navigator.userAgent)

interface EyeTrackerProps {
  onLoad?: () => void
  setFaceDetected: (detected: boolean) => void
  faceDetected: boolean
  shouldStop?: boolean
  onCenteringComplete?: () => void
  isForPupilTest?: boolean
  onMediaRecorderStarted?: () => void
}

interface FacePrediction {
  keypoints: Array<{ x: number; y: number; z?: number }>
}

const VIDEO_WIDTH = 640
const VIDEO_HEIGHT = 480

export default function EyeTracker({
  onLoad,
  setFaceDetected,
  faceDetected,
  shouldStop = false,
  onCenteringComplete,
  isForPupilTest = false,
}: EyeTrackerProps) {
  const MIN_FACE_WIDTH = isAndroid() ? 30 : 50

  const [isInitializing, setIsInitializing] = useState(true)
  const [isStopped, setIsStopped] = useState(false)
  const [centeringProgress, setCenteringProgress] = useState(0)
  const [isCenteringComplete, setIsCenteringComplete] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const centeringStartTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const videoElement = videoRef.current
    const detector = detectorRef.current
    const stream = streamRef.current
    const rafId = rafIdRef.current

    async function init(): Promise<void> {
      try {
        await tf.ready()
        try {
          await tf.setBackend('webgl')
        } catch {
          await tf.setBackend('cpu')
        }
        await tf.ready()

        detectorRef.current = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          { runtime: 'tfjs', maxFaces: 1, refineLandmarks: false },
        )

        streamRef.current = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { exact: 30 },
          },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current
          videoRef.current.onloadedmetadata = async () => {
            if (videoRef.current) {
              try {
                await videoRef.current.play()
                setIsInitializing(false)
                onLoad?.()
                detectLoop()
              } catch {
                // play error
              }
            }
          }
        }
      } catch {
        // init error
      }
    }

    async function detectLoop(): Promise<void> {
      const detector = detectorRef.current
      const videoElement = videoRef.current
      if (!detector || !videoElement || isStopped) return

      try {
        if (videoElement.readyState < 2) {
          rafIdRef.current = requestAnimationFrame(detectLoop)
          return
        }

        const predictions = await detector.estimateFaces(videoElement, {
          flipHorizontal: false,
        })

        const valid = predictions.filter((pred: FacePrediction) => {
          const xs = pred.keypoints.map((k) => k.x)
          return Math.max(...xs) - Math.min(...xs) >= MIN_FACE_WIDTH
        })

        const isDetected = valid.length > 0
        setFaceDetected(isDetected)

        // Centering logic (not during pupil test phase)
        if (isDetected && valid.length > 0 && !isForPupilTest) {
          const pred = valid[0]
          const xs = pred.keypoints.map((k) => k.x)
          const ys = pred.keypoints.map((k) => k.y)
          const centerX = (Math.min(...xs) + Math.max(...xs)) / 2
          const centerY = (Math.min(...ys) + Math.max(...ys)) / 2

          const isCentered =
            Math.abs(centerX - VIDEO_WIDTH / 2) < VIDEO_WIDTH * 0.25 &&
            Math.abs(centerY - VIDEO_HEIGHT / 2) < VIDEO_HEIGHT * 0.25

          if (isCentered && !isCenteringComplete) {
            if (centeringStartTimeRef.current === null) {
              centeringStartTimeRef.current = Date.now()
            }
            const elapsed = Date.now() - centeringStartTimeRef.current
            const progress = Math.min((elapsed / 5000) * 100, 100)
            setCenteringProgress(progress)

            if (elapsed >= 5000 && !isCenteringComplete) {
              setIsCenteringComplete(true)
              onCenteringComplete?.()
            }
          } else if (!isCentered) {
            centeringStartTimeRef.current = null
            setCenteringProgress(0)
            setIsCenteringComplete(false)
          }
        } else if (!isDetected && !isForPupilTest) {
          centeringStartTimeRef.current = null
          setCenteringProgress(0)
          setIsCenteringComplete(false)
        }

        drawOverlay(valid)

        if (!isStopped) {
          rafIdRef.current = requestAnimationFrame(detectLoop)
        }
      } catch {
        if (!isStopped) {
          rafIdRef.current = requestAnimationFrame(detectLoop)
        }
      }
    }

    function drawOverlay(predictions: FacePrediction[]): void {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT)
      predictions.forEach((pred) => {
        const xs = pred.keypoints.map((k) => k.x)
        const ys = pred.keypoints.map((k) => k.y)
        const minX = Math.min(...xs)
        const minY = Math.min(...ys)
        const maxX = Math.max(...xs)
        const maxY = Math.max(...ys)

        ctx.strokeStyle = 'red'
        ctx.lineWidth = 2
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY)
      })
    }

    init()

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (detector && 'dispose' in detector) {
        try {
          ;(detector as unknown as { dispose: () => void }).dispose()
        } catch { /* */ }
      }
      if (stream) stream.getTracks().forEach((track) => track.stop())
      if (videoElement) videoElement.srcObject = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle stopping the eye tracker
  useEffect(() => {
    if (shouldStop && !isStopped) {
      setIsStopped(true)
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) videoRef.current.srcObject = null
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT)
      }
      centeringStartTimeRef.current = null
      setCenteringProgress(0)
      setIsCenteringComplete(false)
    }
  }, [shouldStop, isStopped])

  // Restart when shouldStop becomes false
  useEffect(() => {
    if (!shouldStop && isStopped) {
      const restartEyeTracker = async () => {
        try {
          await tf.ready()
          if (!detectorRef.current) {
            detectorRef.current = await faceLandmarksDetection.createDetector(
              faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
              { runtime: 'tfjs', maxFaces: 1, refineLandmarks: false },
            )
          }
          streamRef.current = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { exact: 30 },
            },
            audio: false,
          })
          if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current
            videoRef.current.onloadedmetadata = async () => {
              if (videoRef.current) {
                try {
                  await videoRef.current.play()
                  setIsStopped(false)
                  const detectLoop = async () => {
                    const detector = detectorRef.current
                    const videoElement = videoRef.current
                    if (!detector || !videoElement || isStopped) return
                    try {
                      if (videoElement.readyState < 2) {
                        rafIdRef.current = requestAnimationFrame(detectLoop)
                        return
                      }
                      const predictions = await detector.estimateFaces(videoElement, { flipHorizontal: false })
                      const valid = predictions.filter((pred: FacePrediction) => {
                        const xs = pred.keypoints.map((k) => k.x)
                        return Math.max(...xs) - Math.min(...xs) >= MIN_FACE_WIDTH
                      })
                      setFaceDetected(valid.length > 0)
                      if (!isStopped) rafIdRef.current = requestAnimationFrame(detectLoop)
                    } catch {
                      if (!isStopped) rafIdRef.current = requestAnimationFrame(detectLoop)
                    }
                  }
                  detectLoop()
                } catch { /* */ }
              }
            }
          }
        } catch { /* */ }
      }
      restartEyeTracker()
    }
  }, [shouldStop, isStopped, setFaceDetected, MIN_FACE_WIDTH])

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg mx-auto bg-black shadow-[var(--shadow-card)]"
      style={{ aspectRatio: `${VIDEO_WIDTH} / ${VIDEO_HEIGHT}`, border: `2px solid ${faceDetected ? 'var(--color-teal)' : 'var(--color-rose)'}` }}
    >
      {/* Loading overlay */}
      {isInitializing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
          <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin mb-3" />
          <span className="text-white text-[14px]">Initializing Camera...</span>
        </div>
      )}

      {/* Face status badge */}
      <div
        className="absolute top-2 left-2 z-[2] px-2 py-0.5 rounded text-[10px] font-bold"
        style={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          color: faceDetected ? '#4caf50' : 'red',
        }}
      >
        {isForPupilTest
          ? faceDetected ? 'Tracking' : 'No Face'
          : faceDetected ? 'Face OK' : 'No Face'}
      </div>

      {/* Centering progress (camera setup phase only) */}
      {!isForPupilTest && faceDetected && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[2] bg-black/80 text-white px-3 py-1.5 rounded-lg text-center min-w-[150px]">
          <p className="text-[10px] mb-1">Keep centered</p>
          <div className="w-full h-[3px] bg-white/30 rounded-full overflow-hidden mb-1">
            <div
              className="h-full rounded-full transition-[width] duration-100"
              style={{
                width: `${centeringProgress}%`,
                backgroundColor: isCenteringComplete ? '#4caf50' : '#2196f3',
              }}
            />
          </div>
          <span className="text-[8px]">
            {isCenteringComplete ? 'Ready!' : `${Math.round(centeringProgress / 20)}/5`}
          </span>
        </div>
      )}

      <video
        ref={videoRef}
        playsInline
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'scaleX(-1)',
        }}
      />
      <canvas
        ref={canvasRef}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          transform: 'scaleX(-1)',
        }}
      />
    </div>
  )
}
