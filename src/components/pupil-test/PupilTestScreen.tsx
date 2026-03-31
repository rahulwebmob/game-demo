import { useState, useEffect, useRef, useMemo } from 'react'
import { CheckCircle } from 'lucide-react'
import { useSound } from '../../hooks/useSound'

interface Props {
  onComplete: (videoBlob?: Blob) => void
  onTestComplete?: () => void
  onMediaRecorderStarted?: () => void
  onError?: (msg: string) => void
}

type Phase = 'COUNTDOWN' | 'TEST' | 'DONE'

const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)

const TEST_DURATION = 20
const COLOR_STAGES = [
  { from: 0, to: 5, color: 'black' },
  { from: 5, to: 10, color: 'blue' },
  { from: 10, to: 15, color: 'black' },
  { from: 15, to: 20, color: 'blue' },
]

export default function PupilTestScreen({ onComplete, onTestComplete, onMediaRecorderStarted, onError }: Props) {
  const sfx = useSound()
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const videoBlobRef = useRef<Blob | null>(null)

  const [count, setCount] = useState<number>(5)
  const [timer, setTimer] = useState<number>(0)
  const [phase, setPhase] = useState<Phase>('COUNTDOWN')

  const currentColor = useMemo(() => {
    if (phase !== 'TEST') return 'neutral'
    const stage = COLOR_STAGES.find(({ from, to }) => timer >= from && timer < to)
    return stage?.color || 'neutral'
  }, [phase, timer])

  const startRecording = async () => {
    try {
      const resolutionAttempts = [
        { width: 3840, height: 2160 }, // 4K
        { width: 2560, height: 1440 }, // QHD
        { width: 1920, height: 1080 }, // FHD
        { width: 1280, height: 720 },  // HD
      ]

      let stream: MediaStream | null = null

      for (const res of resolutionAttempts) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { exact: 'user' },
              width: { ideal: res.width, min: 1280 },
              height: { ideal: res.height, min: 720 },
              frameRate: { exact: 30 },
              aspectRatio: { ideal: 16 / 9 },
            },
            audio: false,
          })
          break
        } catch {
          continue
        }
      }

      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            frameRate: { exact: 30 },
          },
          audio: false,
        })
      }

      streamRef.current = stream
      chunksRef.current = []

      let mimeType = 'video/webm'
      let recorderOptions: MediaRecorderOptions = {}

      if (isIOSDevice) {
        // iOS: MP4, 20 Mbps
        mimeType = 'video/mp4'
        recorderOptions = {
          mimeType: 'video/mp4',
          videoBitsPerSecond: 20000000,
        }
      } else {
        // Android/Desktop: codec detection + dynamic bitrate
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          mimeType = 'video/webm;codecs=vp9'
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
          mimeType = 'video/webm;codecs=vp8'
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm'
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4'
        }

        // Dynamic bitrate from actual camera resolution (Android path)
        const videoTrack = stream.getVideoTracks()[0]
        const settings = videoTrack.getSettings()
        const width = (settings.width as number) || 1920
        const height = (settings.height as number) || 1080
        const fps = (settings.frameRate as number) || 30

        const bpp = mimeType.includes('vp9')
          ? 0.12
          : mimeType.includes('vp8')
            ? 0.1
            : mimeType.includes('mp4')
              ? 0.11
              : 0.1

        let computed = Math.floor(width * height * fps * bpp)
        if (computed < 12_000_000) computed = 12_000_000
        if (computed > 60_000_000) computed = 60_000_000

        recorderOptions = {
          mimeType,
          videoBitsPerSecond: computed,
        }
      }

      const recorder = new MediaRecorder(stream, recorderOptions)

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      const capturedMimeType = mimeType
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: capturedMimeType })
        videoBlobRef.current = blob
        stream!.getTracks().forEach((t) => t.stop())
      }

      // Android: 500ms delay before recording (exact from source)
      if (!isIOSDevice) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      recorder.start()
      recorderRef.current = recorder

      // Notify parent that MediaRecorder has started (for eye-tracker restart)
      onMediaRecorderStarted?.()
    } catch {
      onError?.('Failed to access camera')
    }
  }

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
  }

  const startTimer = () => {
    setTimer(0)
    intervalRef.current = window.setInterval(() => {
      setTimer((t) => t + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Countdown phase
  useEffect(() => {
    if (phase !== 'COUNTDOWN') return
    if (count > 0) {
      const t = setTimeout(() => setCount((c) => c - 1), 1000)
      return () => clearTimeout(t)
    }
    setPhase('TEST')
  }, [count, phase])

  // Test phase - start recording + timer
  useEffect(() => {
    if (phase !== 'TEST') return
    let active = true
    ;(async () => {
      await startRecording()
      if (active) startTimer()
    })()
    return () => {
      active = false
      stopTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Test duration check
  useEffect(() => {
    if (phase === 'TEST' && timer >= TEST_DURATION) {
      stopTimer()
      stopRecording()
      setPhase('DONE')
      sfx('wakeUp')
      onTestComplete?.()
    }
  }, [timer, phase, onTestComplete, sfx])

  // DONE phase - auto-dismiss after 1.5s
  useEffect(() => {
    if (phase !== 'DONE') return
    const t = setTimeout(() => {
      onComplete(videoBlobRef.current || undefined)
    }, 1500)
    return () => clearTimeout(t)
  }, [phase, onComplete])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
        recorderRef.current = null
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="h-dvh flex flex-col justify-center items-center text-center transition-colors duration-300"
        style={{
          backgroundColor:
            phase === 'COUNTDOWN' ? '#111' : phase === 'DONE' ? '#111' : currentColor,
        }}
      >
        {/* Timer display top-right */}
        <span className="absolute top-4 right-6 text-white text-[13px]">
          Timer: {timer}s
        </span>

        {/* COUNTDOWN */}
        {phase === 'COUNTDOWN' && (
          <h3 className="text-[28px] md:text-[36px] font-semibold text-white">
            Test begins in {count}...
          </h3>
        )}

        {/* TEST */}
        {phase === 'TEST' && (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-[60px] h-[60px] flex items-center justify-center">
              {/* Pulse ring 1 */}
              <div
                className="absolute w-[40px] h-[40px] rounded-full border border-white"
                style={{ animation: 'pulse-ring 2s ease-out infinite' }}
              />
              {/* Pulse ring 2 (0.5s delayed) */}
              <div
                className="absolute w-[40px] h-[40px] rounded-full border border-white"
                style={{ animation: 'pulse-ring 2s ease-out infinite 0.5s' }}
              />
              {/* Center dot */}
              <div
                className="w-[16px] h-[16px] rounded-full bg-white"
                style={{ animation: 'pulse-dot 1.5s ease-in-out infinite' }}
              />
            </div>
            <p className="text-white/90 text-[15px]">Focus on the center dot</p>
          </div>
        )}

        {/* DONE */}
        {phase === 'DONE' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-teal/20 flex items-center justify-center">
              <CheckCircle size={36} className="text-teal" />
            </div>
            <h3 className="text-[22px] md:text-[28px] font-bold text-white">
              Test Complete!
            </h3>
            <p className="text-teal text-[15px] font-semibold">Energy Restored!</p>
          </div>
        )}
      </div>
    </div>
  )
}
