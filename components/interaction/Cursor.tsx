"use client"
import { m, useMotionValue } from 'motion/react'
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

// Mouse-only cursor: a Valorant-style "+" crosshair, white on dark and black on light, whose
// centre is the hotspot. Touch, pen and keyboard users keep the native behaviour; focus rings
// are untouched. Styles live in globals.css (.xhair).
export function Cursor() {
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  if (!finePointer) return null
  return <CursorInner />
}

function CursorInner() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
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

  const labelled = state.variant === 'view' || state.variant === 'copy'
  const hidden = !visible || state.variant === 'text' || state.variant === 'hidden'

  // The crosshair blends with "difference" so it inverts whatever is under it; the label sits
  // on a normal layer so it keeps the accent colour.
  const layer = { x, y }
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] mix-blend-difference">
        <m.div className="xhair" data-variant={state.variant} data-pressed={pressed || undefined} data-hidden={hidden || undefined} style={layer}>
          {(['t', 'r', 'b', 'l'] as const).map((d) => <span key={d} className={`xhair__arm xhair__arm--${d}`} />)}
          <span className="xhair__dot" />
        </m.div>
      </div>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
        <m.div className="xhair" data-hidden={hidden || undefined} style={layer}>
          <span className="xhair__label" data-show={labelled || undefined}>
            {state.label ?? (state.variant === 'copy' ? 'Copy' : 'View')}
          </span>
        </m.div>
      </div>
    </>
  )
}
