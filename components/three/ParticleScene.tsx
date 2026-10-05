"use client"
import { useState, Suspense, useEffect, useMemo, useRef, type RefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import { useScroll } from 'motion/react'
import { PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { ParticleSystem } from './ParticleSystem'
import { usePerformanceTier, usePrefersReducedMotion, lowerTier, Tier } from './tiers'
import { displayFontFamily } from '@/utils/canvasSampling'

export interface ParticleNameProps {
  lines: string[]
  className?: string
  scrollDissolve?: boolean
  // The section the dissolve is measured against, usually the hero
  scrollTarget?: RefObject<HTMLElement | null>
  fitHeight?: number
  offsetY?: number
  // Called once particles are on screen, so the page can fade out its typographic fallback
  onReady?: () => void
}

// The three.js renderer (with bloom). ParticleName loads it only for the high and medium tiers.
export default function ParticleScene({ lines, className = 'absolute inset-0', scrollDissolve = false, scrollTarget, fitHeight, offsetY, onReady }: ParticleNameProps) {
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

  // Pause rendering when the hero is off screen. Scroll smoothing (Lenis) is ticked from Motion's
  // frame loop, so useScroll below stays in step with it without a scroll listener of our own.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { scrollYProgress } = useScroll({
    target: scrollTarget ?? containerRef,
    offset: ['start start', 'end start'],
  })

  const caOffset = useMemo(() => new THREE.Vector2(0.0003, 0.0003), [])
  const eventSource = typeof document !== 'undefined' ? document.body : undefined

  if (tier === 'static') return null

  return (
    <div ref={containerRef} aria-hidden="true" className={`${className} z-0 pointer-events-none`}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        frameloop={active && !reducedMotion ? 'always' : 'never'}
        // The canvas never moves inside its section, so skip R3F's per-scroll re-measure; with it on,
        // every smooth-scroll tick re-rendered the scene even with the hero off screen.
        resize={{ scroll: false }}
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
              scrollProgress={scrollDissolve ? scrollYProgress : undefined}
              fitHeight={fitHeight}
              offsetY={offsetY}
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
