"use client"
import { m, type Variants } from 'motion/react'
import { duration, ease } from '@/lib/tokens'

const item: Variants = {
  hidden: { opacity: 0, y: 48 },
  shown: { opacity: 1, y: 0, transition: { duration: duration.reveal, ease: ease.out } },
}

interface RevealProps {
  children: React.ReactNode
  className?: string
  /** Seconds between direct children marked with <RevealItem>. */
  stagger?: number
  delay?: number
  as?: 'div' | 'section' | 'header' | 'footer'
}

// Fades and lifts its content once it enters the viewport. With `stagger`, each <RevealItem>
// inside follows the one before it. MotionConfig reducedMotion="user" turns the lift off.
export function Reveal({ children, className, stagger = 0, delay = 0, as = 'div' }: RevealProps) {
  const Tag = m[as]
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      variants={stagger ? { hidden: {}, shown: { transition: { staggerChildren: stagger, delayChildren: delay } } } : item}
      transition={stagger ? undefined : { delay }}
    >
      {children}
    </Tag>
  )
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <m.div className={className} variants={item}>
      {children}
    </m.div>
  )
}
