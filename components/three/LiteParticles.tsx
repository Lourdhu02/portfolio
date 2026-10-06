"use client"
import { useEffect, useRef } from 'react'
import { useScroll } from 'motion/react'
import { buildParticles, type Particles } from './particleData'
import { PARTICLE_COUNT, usePrefersReducedMotion } from './tiers'
import { createLiteRenderer, type LiteOptions, type LiteRenderer } from './liteRenderer'
import type { LiteWorkerIn, LiteWorkerOut } from './liteWorker'
import type { ParticleNameProps } from './ParticleScene'

// The low-tier hero (phones): ParticleSystem's look drawn with plain WebGL by liteRenderer.
// three.js + R3F + postprocessing are ~270KB gzipped and one points draw call needs almost none of
// it, so phones skip them (and the bloom pass, which is several full-screen passes per frame).
// The renderer runs in a worker on an OffscreenCanvas where the browser allows it, so WebGL setup
// and every frame stay off the main thread; otherwise it draws on this canvas directly.
// This component owns the DOM side: text sampling, size, pointer, taps, scroll and visibility.

const MAX_DPR = 1.75

// Same interface as createLiteRenderer, with each call posted to the worker
function startInWorker(canvas: HTMLCanvasElement, data: Particles, options: LiteOptions, onReady: () => void): LiteRenderer {
  const worker = new Worker(new URL('./liteWorker.ts', import.meta.url), { type: 'module' })
  const send = (m: LiteWorkerIn, transfer: Transferable[] = []) => worker.postMessage(m, transfer)
  worker.onmessage = (e: MessageEvent<LiteWorkerOut>) => {
    if (e.data.type === 'ready') onReady()
  }
  const offscreen = canvas.transferControlToOffscreen()
  const arrays = [data.positions, data.targets, data.seeds, data.sizes, data.accents]
  send({ type: 'init', canvas: offscreen, data, options }, [offscreen, ...arrays.map((a) => a.buffer)])
  const call = (method: Exclude<keyof LiteRenderer, 'dispose'>) => (...args: number[]) => send({ type: 'call', method, args })
  return {
    resize: call('resize'),
    pointer: call('pointer'),
    shock: call('shock'),
    scatter: call('scatter'),
    play: call('play'),
    pause: call('pause'),
    dispose() {
      send({ type: 'dispose' })
      worker.terminate()
    },
  }
}

export default function LiteParticles({ lines, className = 'absolute inset-0', scrollDissolve = false, scrollTarget, fitHeight = 0.55, offsetY = 0, onReady }: ParticleNameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({
    target: scrollTarget ?? containerRef,
    offset: ['start start', 'end start'],
  })

  // Read through a ref so a prop change never rebuilds the GL state
  const live = useRef({ scrollDissolve, scrollYProgress, onReady })
  useEffect(() => {
    live.current = { scrollDissolve, scrollYProgress, onReady }
  })

  const linesKey = lines.join('\n')

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let disposed = false
    let teardown = () => {}

    // Particle targets are sampled from canvas text, so the display font must be loaded first
    const fontFamily = getComputedStyle(document.documentElement).getPropertyValue('--font-big-shoulders').trim() || '"Arial Narrow", sans-serif'
    const start = () => {
      if (!disposed) teardown = setup(container)
    }
    document.fonts.load(`900 100px ${fontFamily}`).then(start, start)

    function setup(container: HTMLDivElement) {
      // A fresh canvas per setup: once handed to a worker, a canvas can't be handed over again
      const canvas = document.createElement('canvas')
      canvas.className = 'block h-full w-full'
      // No bloom pass here; a compositor-side brightness lift stands in for its glow at no per-pixel shader cost
      canvas.style.filter = 'brightness(1.35)'
      container.appendChild(canvas)

      const data = buildParticles(PARTICLE_COUNT.low, linesKey.split('\n'))
      const options = { fitHeight, offsetY, reducedMotion }
      const ready = () => live.current.onReady?.()
      const renderer = typeof canvas.transferControlToOffscreen === 'function' && typeof Worker === 'function'
        ? startInWorker(canvas, data, options, ready)
        : createLiteRenderer(canvas, data, options, ready)
      if (!renderer) return () => canvas.remove()
      const r = renderer

      function resize() {
        const { width, height } = container.getBoundingClientRect()
        r.resize(width, height, Math.min(window.devicePixelRatio || 1, MAX_DPR))
      }

      // Pointer in [-1, 1] over the canvas, read from the whole page like ParticleScene's eventSource
      const toCanvas = (e: PointerEvent): [number, number] => {
        const rect = canvas.getBoundingClientRect()
        return [((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1]
      }
      const onPointerMove = (e: PointerEvent) => r.pointer(...toCanvas(e))
      // A click or tap sends a shockwave ring from that point
      const onPointerDown = (e: PointerEvent) => {
        if (window.scrollY > window.innerHeight * 0.5) return
        r.shock(...toCanvas(e))
      }

      // The hero fades out by ~0.75 of its own scroll-out, so finish scattering before it goes
      const dissolve = (p: number) => {
        if (live.current.scrollDissolve) r.scatter(Math.min(1, Math.max(0, p / 0.6)))
      }
      const unsubscribeScroll = reducedMotion ? () => {} : live.current.scrollYProgress.on('change', dissolve)
      if (!reducedMotion) dissolve(live.current.scrollYProgress.get())

      resize()
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(container)
      // Pause rendering when the hero is off screen
      const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? r.play() : r.pause()))
      visibility.observe(container)
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      if (!reducedMotion) window.addEventListener('pointerdown', onPointerDown)

      return () => {
        unsubscribeScroll()
        visibility.disconnect()
        resizeObserver.disconnect()
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerdown', onPointerDown)
        r.dispose()
        canvas.remove()
      }
    }

    return () => {
      disposed = true
      teardown()
    }
  }, [linesKey, fitHeight, offsetY, reducedMotion])

  return (
    <div ref={containerRef} aria-hidden="true" data-particles className={`${className} z-0 pointer-events-none`} />
  )
}
