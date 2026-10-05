"use client"
import { m, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { useMediaQuery } from '@/lib/useMediaQuery'

type Variant = 'default' | 'link' | 'view' | 'copy' | 'text' | 'hidden'
interface CursorState { variant: Variant; label?: string }

// Elements opt in with data-cursor="view|copy|hidden" and an optional data-cursor-label.
function resolve(el: Element | null): CursorState {
  const tagged = el?.closest<HTMLElement>('[data-cursor]')
  if (tagged) return { variant: tagged.dataset.cursor as Variant, label: tagged.dataset.cursorLabel }
  if (el?.closest('input, textarea, [contenteditable="true"]')) return { variant: 'text' }
  if (el?.closest('a, button, [role="button"], [role="option"], label, select, summary')) return { variant: 'link' }
  return { variant: 'default' }
}

const RING: Record<Variant, { size: number; opacity: number }> = {
  default: { size: 34, opacity: 1 },
  link: { size: 56, opacity: 1 },
  view: { size: 96, opacity: 1 },
  copy: { size: 80, opacity: 1 },
  text: { size: 34, opacity: 0 },
  hidden: { size: 34, opacity: 0 },
}

// Mouse-only cursor: a precise dot plus a trailing ring that grows over links and
// turns into a labelled disc over work cards. Touch, pen and keyboard users keep the
// native behaviour; focus rings are untouched.
export function Cursor() {
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  if (!finePointer) return null
  return <CursorInner />
}

function CursorInner() {
  const reduce = useReducedMotion()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 520, damping: 42, mass: 0.5 })
  const ringY = useSpring(y, { stiffness: 520, damping: 42, mass: 0.5 })
  const [state, setState] = useState<CursorState>({ variant: 'default' })
  const [visible, setVisible] = useState(false)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('has-custom-cursor')

    function onMove(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
    }
    function onOver(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return
      const next = resolve(e.target as Element)
      setState((prev) => (prev.variant === next.variant && prev.label === next.label ? prev : next))
    }
    const onLeave = (e: MouseEvent) => { if (!e.relatedTarget) setVisible(false) }
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('mouseout', onLeave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      root.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      document.removeEventListener('mouseout', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [x, y])

  const ring = RING[state.variant]
  const filled = state.variant === 'view' || state.variant === 'copy'
  const showDot = visible && !filled && state.variant !== 'text' && state.variant !== 'hidden'

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
      <m.div
        className="absolute left-0 top-0 flex items-center justify-center rounded-full border"
        style={{ x: reduce ? x : ringX, y: reduce ? y : ringY, translateX: '-50%', translateY: '-50%' }}
        initial={false}
        animate={{
          width: ring.size,
          height: ring.size,
          opacity: visible ? ring.opacity : 0,
          scale: pressed ? 0.82 : 1,
          backgroundColor: filled ? 'var(--color-accent)' : state.variant === 'link' ? 'rgba(237,237,240,0.08)' : 'rgba(237,237,240,0)',
          borderColor: filled ? 'rgba(255,70,85,0)' : state.variant === 'link' ? 'var(--color-accent)' : 'rgba(237,237,240,0.35)',
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.6 }}
      >
        <m.span
          className="whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-bg"
          initial={false}
          animate={{ opacity: filled ? 1 : 0, scale: filled ? 1 : 0.6 }}
          transition={{ duration: 0.18 }}
        >
          {state.label ?? (state.variant === 'copy' ? 'Copy' : 'View')}
        </m.span>
      </m.div>
      <m.div
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-accent"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        initial={false}
        animate={{ opacity: showDot ? 1 : 0, scale: pressed ? 1.8 : 1 }}
        transition={{ duration: 0.12 }}
      />
    </div>
  )
}
