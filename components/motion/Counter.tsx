"use client"
import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'motion/react'

interface CounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

export function Counter({ value, prefix = "", suffix = "", decimals = 0, duration = 1.5 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })
  
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000
  })

  useEffect(() => {
    if (inView) {
      motionValue.set(value)
    }
  }, [inView, value, motionValue])

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`
      }
    })
  }, [springValue, prefix, suffix, decimals])

  return (
    <span ref={ref} className="tabular-nums">
      {/* SSR fallback for SEO */}
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  )
}
