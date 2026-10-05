"use client"
import { useRef } from 'react'
import { m, useScroll, useTransform, type MotionValue } from 'motion/react'

interface ScrollWordsProps {
  /** One entry per line. Lines with `muted` stay dimmer when lit. */
  lines: { text: string; muted?: boolean }[]
  label?: React.ReactNode
}

// A pinned statement whose words light up one by one as the reader scrolls through it.
// The section is taller than the viewport; the text stays centred while progress runs 0 → 1.
// Under prefers-reduced-motion the pin collapses and every word is simply lit (CSS only, so SSR matches).
export function ScrollWords({ lines, label }: ScrollWordsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const words = lines.flatMap((line, li) => line.text.split(' ').map((word) => ({ word, li, muted: line.muted })))
  const total = words.length
  let index = 0

  return (
    <div ref={ref} className="relative h-[220vh] motion-reduce:h-auto">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center motion-reduce:static motion-reduce:h-auto motion-reduce:py-24">
        {label}
        <p className="font-display text-5xl leading-[1.05] md:text-8xl">
          {lines.map((line, li) => (
            <span key={li} className="block">
              {words
                .filter((w) => w.li === li)
                .map((w) => {
                  const i = index++
                  return (
                    <Word key={i} progress={scrollYProgress} range={[i / total, (i + 1) / total]} muted={w.muted}>
                      {w.word}
                    </Word>
                  )
                })}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}

function Word({
  children,
  progress,
  range,
  muted,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
  muted?: boolean
}) {
  // Leave the last 15% of the pin fully lit so the line can be read before it scrolls away
  const opacity = useTransform(progress, [range[0] * 0.85, range[1] * 0.85], [0.12, muted ? 0.45 : 1])
  return (
    <m.span className={`mr-[0.22em] inline-block ${muted ? 'motion-reduce:opacity-45!' : 'motion-reduce:opacity-100!'}`} style={{ opacity }}>
      {children}
    </m.span>
  )
}
