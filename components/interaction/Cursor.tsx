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

const FACES = ['front', 'back', 'right', 'left', 'top', 'bottom'] as const

// Mouse-only cursor: a small wireframe cube, white on dark and black on light. Its red
// vertex is the hotspot: the cube hangs from it and turns around it, so the point you
// click is always the red one. Touch, pen and keyboard users keep
// the native behaviour; focus rings are untouched. Styles live in globals.css (.cube-cursor).
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

  // Two layers on the same point: the cube blends with "difference" so it is white
  // over dark surfaces and black over light ones, pixel by pixel, in either theme;
  // the red vertex and the label sit on a normal layer so they keep their colours.
  const layer = { x, y }
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] mix-blend-difference">
        <m.div className="cube-cursor" data-variant={state.variant} data-pressed={pressed || undefined} data-hidden={hidden || undefined} style={layer}>
          <div className="cube-cursor__scale">
            <div className="cube-cursor__spin">
              <div className="cube-cursor__cube">
                {FACES.map((f) => <span key={f} className={`cube-cursor__face cube-cursor__face--${f}`} />)}
              </div>
            </div>
          </div>
        </m.div>
      </div>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
        <m.div className="cube-cursor" data-variant={state.variant} data-pressed={pressed || undefined} data-hidden={hidden || undefined} style={layer}>
          <span className="cube-cursor__vertex" />
          <span className="cube-cursor__label" data-show={labelled || undefined}>
            {state.label ?? (state.variant === 'copy' ? 'Copy' : 'View')}
          </span>
        </m.div>
      </div>
    </>
  )
}
