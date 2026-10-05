"use client"
import { useState, Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { ParticleSystem } from './ParticleSystem'
import { usePerformanceTier, Tier } from './tiers'
import { displayFontFamily } from '@/utils/canvasSampling'

export function ParticleName() {
  const defaultTier = usePerformanceTier()
  const [tier, setTier] = useState<Tier>(defaultTier)
  const [isInView, setIsInView] = useState(true)
  const [fontReady, setFontReady] = useState(false)

  // Particle targets are sampled from canvas text, so the display font must be loaded first
  useEffect(() => {
    let cancelled = false
    const ready = () => { if (!cancelled) setFontReady(true) }
    document.fonts.load(`900 100px ${displayFontFamily()}`).then(ready, ready)
    return () => { cancelled = true }
  }, [])

  // Very basic intersection observer for pausing when far off screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { rootMargin: '500px' } // Keep rendering a bit outside viewport
    )
    
    const el = document.getElementById('hero-canvas-container')
    if (el) observer.observe(el)
      
    return () => observer.disconnect()
  }, [])

  if (tier === 'low') {
    return (
      <div className="flex h-[100vh] w-full items-center justify-center bg-bg relative z-0">
        <h1 className="font-display text-[clamp(72px,12vw,220px)] leading-[0.85] text-text text-center tracking-tight">
          LOURDU RAJU
        </h1>
      </div>
    )
  }

  return (
    <div id="hero-canvas-container" className="absolute inset-0 z-0 h-full w-full pointer-events-auto">
      {/* HTML H1 for SEO and LCP */}
      <h1 className="sr-only">Lourdu Raju</h1>
      
      {/* 
        We use frameloop="always" when in view to handle smooth mouse repulsion,
        and "demand" when out of view to effectively pause it.
      */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        frameloop={isInView ? 'always' : 'demand'}
      >
        <PerformanceMonitor 
          onDecline={() => setTier('medium')}
          onFallback={() => setTier('low')}
        />
        <Suspense fallback={null}>
          {fontReady && <ParticleSystem tier={tier} />}
          <EffectComposer multisampling={0}>
            <Bloom 
              luminanceThreshold={0.8} 
              luminanceSmoothing={0.9} 
              intensity={2.0} 
              mipmapBlur 
            />
            <ChromaticAberration 
              blendFunction={BlendFunction.NORMAL} 
              offset={new THREE.Vector2(0.001, 0.001)} 
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}
