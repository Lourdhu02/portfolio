"use client"
import { useRef } from 'react'
import { m, useScroll, useTransform } from 'motion/react'

// Scroll-out for the hero: as the next scene arrives the hero sinks, shrinks and fades,
// so the page reads as one continuous camera move rather than stacked blocks.
export function HeroScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.86])
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  // Once fully faded, drop the layer so the compositor stops blending an invisible WebGL canvas
  const visibility = useTransform(opacity, (o) => (o <= 0.001 ? 'hidden' : 'visible'))

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <m.div className="absolute inset-0" style={{ scale, y, opacity, visibility }} data-scroll-fx>
        {children}
      </m.div>
    </section>
  )
}
