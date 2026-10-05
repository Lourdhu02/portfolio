"use client"
import { m, useScroll, useSpring } from 'motion/react'
import { spring } from '@/lib/tokens'

// Hairline at the top of the viewport that fills with page progress
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, spring.scroll)

  return (
    <m.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-px origin-left bg-accent"
      style={{ scaleX, viewTransitionName: 'scroll-progress' }}
    />
  )
}
