"use client"
import { Children, useRef } from 'react'
import { m, useScroll, useTransform } from 'motion/react'

interface ParallaxProps {
  children: React.ReactNode
  className?: string
  /** Pixels of travel across the element's pass through the viewport. Negative moves against scroll. */
  offset?: number
}

// Drifts its content as it crosses the viewport. Transform only, so it stays on the compositor.
// data-scroll-fx lets globals.css pin it in place under prefers-reduced-motion.
export function Parallax({ children, className, offset = 60 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset])

  return (
    <m.div ref={ref} className={className} style={{ y }} data-scroll-fx>
      {children}
    </m.div>
  )
}

// Grid whose odd and even items drift at different rates, so neighbouring columns slide past each other.
// itemClassNames[i] lands on item i's wrapper, for grid placement such as col-span.
export function ParallaxGrid({
  children,
  className,
  itemClassNames = [],
}: {
  children: React.ReactNode
  className?: string
  itemClassNames?: string[]
}) {
  return (
    <div className={className}>
      {Children.toArray(children).map((child, i) => (
        <Parallax key={i} offset={i % 2 ? 72 : 24} className={itemClassNames[i]}>
          {child}
        </Parallax>
      ))}
    </div>
  )
}
