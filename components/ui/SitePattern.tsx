"use client"
import { useEffect, useRef } from 'react'

// Site background: a live isometric cube lattice (tumbling blocks) on one fixed canvas.
// Cubes near the pointer rise out of the floor and catch the accent colour, a click or tap
// sends a ripple through the field, and a few cubes breathe on their own when nothing moves.
// The lattice scrolls with the page and fades out behind the hero name. It exists so the
// glass panels have real detail to blur and bend.
//
// Also defines the refraction filter that .glass uses on Chromium (see globals.css).

const A = 22 // cube edge in px
const W = 38 // horizontal pitch: 2 · A · cos 30°, rounded to whole pixels
const ROW = 33 // vertical pitch: 1.5 · A
const LIFT = 9 // px a fully raised cube rises
const REACH = 150 // pointer influence radius in px

type Ripple = { x: number; y: number; t0: number }

function readColour(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

export function SitePattern() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Phones skip the idle breathing so the canvas only redraws while you touch or scroll
    const idle = !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches

    let ink = readColour('--color-text')
    let accent = readColour('--color-accent')
    let light = document.documentElement.dataset.theme === 'light'
    const themeObserver = new MutationObserver(() => {
      ink = readColour('--color-text')
      accent = readColour('--color-accent')
      light = document.documentElement.dataset.theme === 'light'
      request()
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-jinx'] })

    let vw = 0
    let vh = 0
    let dpr = 1
    function resize() {
      vw = window.innerWidth
      vh = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas!.width = Math.round(vw * dpr)
      canvas!.height = Math.round(vh * dpr)
      request()
    }

    const pointer = { x: -1e4, y: -1e4, active: false }
    const ripples: Ripple[] = []
    const lift = new Map<number, number>() // key → current lift 0..1, only for cubes in motion
    let frame = 0
    let last = performance.now()
    let nextBreath = 0
    const breaths = new Map<number, number>() // key → start time of a self-raise

    function request() {
      if (!frame) frame = requestAnimationFrame(draw)
    }

    function target(key: number, cx: number, cy: number, now: number) {
      let t = 0
      if (pointer.active) {
        const d2 = (cx - pointer.x) ** 2 + (cy - pointer.y) ** 2
        t = Math.exp(-d2 / (REACH * REACH))
      }
      for (const r of ripples) {
        const age = (now - r.t0) / 1000
        const radius = age * 520
        const d = Math.hypot(cx - r.x, cy - r.y)
        const band = Math.exp(-((d - radius) ** 2) / 1800) * Math.max(0, 1 - age / 1.6)
        if (band > t) t = band
      }
      const b = breaths.get(key)
      if (b !== undefined) {
        const p = (now - b) / 2400
        if (p >= 1) breaths.delete(key)
        else t = Math.max(t, Math.sin(p * Math.PI) * 0.7)
      }
      return t
    }

    function draw(now: number) {
      frame = 0
      const dt = Math.min(64, now - last)
      last = now
      const k = 1 - Math.pow(0.001, dt / 1000 * 2.2) // frame-rate independent easing
      const sy = window.scrollY

      // Retire finished ripples; start a lone breathing cube now and then
      for (let i = ripples.length - 1; i >= 0; i--) if (now - ripples[i].t0 > 1700) ripples.splice(i, 1)
      if (idle && now > nextBreath) {
        nextBreath = now + 900 + Math.random() * 1400
        const j = Math.floor((sy + Math.random() * vh) / ROW)
        const i = Math.floor(Math.random() * (vw / W + 1))
        breaths.set(j * 4096 + i, now)
      }

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.clearRect(0, 0, vw, vh)
      ctx!.lineWidth = 0.75
      ctx!.lineJoin = 'round'

      // Hero fade: cubes near the name, in page coordinates, are drawn faint
      const heroY = vh * 0.46
      const heroRx = vw * 0.48
      const heroRy = vh * 0.3

      const j0 = Math.floor((sy - A - LIFT) / ROW)
      const j1 = Math.ceil((sy + vh + A) / ROW)
      let moving = ripples.length > 0 || breaths.size > 0
      const h = W / 2
      const baseTop = light ? 0.04 : 0.045
      const baseLeft = light ? 0.018 : 0.018
      const baseEdge = light ? 0.075 : 0.07

      for (let j = j0; j <= j1; j++) {
        const pageY = j * ROW
        const cy = pageY - sy
        const offset = j & 1 ? W / 2 : 0
        for (let i = -1; i <= vw / W + 1; i++) {
          const cx = i * W + offset
          const key = j * 4096 + i
          const goal = reduce ? 0 : target(key, cx, cy, now)
          let l = lift.get(key) ?? 0
          if (goal > 0.002 || l > 0.002) {
            l += (goal - l) * k
            if (Math.abs(goal - l) > 0.002) moving = true
            if (l < 0.002 && goal <= 0.002) lift.delete(key)
            else lift.set(key, l)
          }
          const dx = (cx - vw / 2) / heroRx
          const dyh = (pageY - heroY) / heroRy
          const e = dx * dx + dyh * dyh
          const fade = e >= 1 ? 1 : Math.max(0, (Math.sqrt(e) - 0.35) / 0.65)
          if (fade <= 0.01 && l < 0.01) continue

          const up = l * LIFT
          const ty = cy - up
          // Top face (rises), left and right faces (stretch down to the floor)
          ctx!.beginPath()
          ctx!.moveTo(cx, ty - A); ctx!.lineTo(cx + h, ty - A / 2); ctx!.lineTo(cx, ty); ctx!.lineTo(cx - h, ty - A / 2); ctx!.closePath()
          ctx!.globalAlpha = Math.min(1, (baseTop + l * 0.14) * Math.max(fade, l))
          ctx!.fillStyle = l > 0.05 ? accent : ink
          ctx!.fill()
          ctx!.globalAlpha = (baseEdge + l * 0.3) * Math.max(fade, l)
          ctx!.strokeStyle = l > 0.05 ? accent : ink
          ctx!.stroke()

          ctx!.beginPath()
          ctx!.moveTo(cx - h, ty - A / 2); ctx!.lineTo(cx, ty); ctx!.lineTo(cx, cy + A); ctx!.lineTo(cx - h, cy + A / 2); ctx!.closePath()
          ctx!.globalAlpha = (baseLeft + l * 0.1) * Math.max(fade, l)
          ctx!.fillStyle = ink
          ctx!.fill()
          ctx!.globalAlpha = (baseEdge + l * 0.2) * Math.max(fade, l)
          ctx!.strokeStyle = ink
          ctx!.stroke()

          ctx!.beginPath()
          ctx!.moveTo(cx, ty); ctx!.lineTo(cx + h, ty - A / 2); ctx!.lineTo(cx + h, cy + A / 2); ctx!.lineTo(cx, cy + A); ctx!.closePath()
          ctx!.stroke()
        }
      }
      ctx!.globalAlpha = 1
      if (moving || lift.size > 0) request()
    }

    function onMove(e: PointerEvent) {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
      request()
    }
    function onLeave() { pointer.active = false; request() }
    function onDown(e: PointerEvent) {
      if (reduce) return
      ripples.push({ x: e.clientX, y: e.clientY, t0: performance.now() })
      request()
    }
    function onUp(e: PointerEvent) { if (e.pointerType !== 'mouse') { pointer.active = false; request() } }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      themeObserver.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', request)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <filter id="glass-lens" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="2" seed="11" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="3" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="42" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </>
  )
}
