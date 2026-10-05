"use client"
import { useRef } from 'react'
import { m, useReducedMotion, useSpring } from 'motion/react'
import { spring } from '@/lib/tokens'

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
}

// Pulls its child toward a mouse pointer. Touch, pen and reduced-motion users get a static element.
export function Magnetic({ children, strength = 10 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const x = useSpring(0, spring.magnetic)
  const y = useSpring(0, spring.magnetic)

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!ref.current || reduce || e.pointerType !== 'mouse') return
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const distanceX = e.clientX - (left + width / 2)
    const distanceY = e.clientY - (top + height / 2)
    x.set((distanceX / (width / 2 + 80)) * strength)
    y.set((distanceY / (height / 2 + 80)) * strength)
  }

  function onPointerLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <m.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ x, y }}
      className="inline-block"
    >
      {children}
    </m.div>
  )
}
