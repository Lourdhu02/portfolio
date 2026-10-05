"use client"
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import { duration, ease } from '@/lib/tokens'

// Every component uses `m.*` so only domAnimation ships by default.
// Routes that need layout animations can wrap themselves in LazyMotion with domMax.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: duration.ui, ease: ease.out }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}
