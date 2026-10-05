"use client"
import { useState, Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { ParticleSystem } from './ParticleSystem'
import { usePerformanceTier, usePrefersReducedMotion, lowerTier, Tier } from './tiers'
import { displayFontFamily } from '@/utils/canvasSampling'

interface ParticleNameProps {
  lines: string[]
  className?: string
  scrollDissolve?: boolean
  // Called once particles are on screen, so the page can fade out its typographic fallback
  onReady?: () => void
}

// Client-only: load through next/dynamic with ssr: false. Renders nothing on the static tier,
// where the page's own <h1> stays as the hero.
export default function ParticleName({ lines, className = 'absolute inset-0', scrollDissolve = false, onReady }: ParticleNameProps) {
  const deviceTier = usePerformanceTier()
  const reducedMotion = usePrefersReducedMotion()
  const [downgrade, setDowngrade] = useState(0)
  const [fontReady, setFontReady] = useState(false)
  const [active, setActive] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  let tier: Tier = deviceTier
  for (let i = 0; i < downgrade; i++) tier = lowerTier(tier)

  // Particle targets are sampled from canvas text, so the display font must be loaded first
  useEffect(() => {
    let cancelled = false
    const ready = () => { if (!cancelled) setFontReady(true) }
    document.fonts.load(`900 100px ${displayFontFamily()}`).then(ready, ready)
    return () => { cancelled = true }
  }, [])

  // Pause rendering when the canvas is off screen; for the scroll-dissolve hero, fade the
  // starfield out over the second screen and stop once it is gone
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (scrollDissolve) {
      const onScroll = () => {
        const h = window.innerHeight
        el.style.opacity = String(1 - THREE.MathUtils.clamp((window.scrollY - h) / h, 0, 1))
        setActive(window.scrollY < h * 2)
      }
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [scrollDissolve])

  const caOffset = useMemo(() => new THREE.Vector2(0.0003, 0.0003), [])
  const eventSource = typeof document !== 'undefined' ? document.body : undefined

  if (tier === 'static') return null

  return (
    <div ref={containerRef} aria-hidden="true" className={`${className} z-0 pointer-events-none`}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        frameloop={active && !reducedMotion ? 'always' : 'demand'}
        eventSource={eventSource}
        eventPrefix="client"
      >
        <PerformanceMonitor onDecline={() => setDowngrade(d => Math.min(d + 1, 2))} />
        <Suspense fallback={null}>
          {fontReady && (
            <ParticleSystem
              key={tier}
              tier={tier}
              lines={lines}
              reducedMotion={reducedMotion}
              scrollDissolve={scrollDissolve}
              onReady={onReady}
            />
          )}
          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.9} intensity={2.0} mipmapBlur />
            {/* Only on the high tier, where dots are dense enough that the fringe reads as a lens, not noise */}
            <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={caOffset} opacity={tier === 'high' ? 1 : 0} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}
