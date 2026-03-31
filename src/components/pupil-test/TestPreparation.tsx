import { Moon, Lightbulb, Smartphone, Maximize } from 'lucide-react'

const steps = [
  { icon: Moon, text: 'Stay in a dark room with a table lamp in front of you.' },
  { icon: Lightbulb, text: 'Avoid any glare or light source behind you.' },
  { icon: Smartphone, text: 'Use a high-resolution front camera (e.g., iPhone 14 Pro Max or above).' },
  { icon: Maximize, text: 'Ensure the test runs in fullscreen mode for better tracking.' },
]

export default function TestPreparation() {
  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 shadow-[var(--shadow-card)]">
      <h3 className="text-[16px] md:text-[18px] font-bold text-ink mb-4">
        Step 1: Test Preparation Guidelines
      </h3>
      <ul className="flex flex-col gap-3 list-none p-0 m-0">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-coral-light flex items-center justify-center flex-shrink-0 mt-0.5">
              <s.icon size={15} className="text-coral" />
            </div>
            <span className="text-[13px] md:text-[14px] text-ink-secondary leading-relaxed">{s.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
