"use client"
import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { ParticleSystem } from './ParticleSystem'
import { PostFX } from './PostFX'
import { DOWNGRADE, PARTICLE_COUNT, Tier } from './tiers'

interface ParticleCanvasProps {
  tier: 'high' | 'medium'
  onTierChange: (tier: Tier) => void
}

// Everything that imports three.js lives behind this file, which ParticleName loads with next/dynamic.
export default function ParticleCanvas({ tier, onTierChange }: ParticleCanvasProps) {
  const [isInView, setIsInView] = useState(true)

  // Stop the render loop once the hero is well off screen.
  useEffect(() => {
    const el = document.getElementById('hero-canvas-container')
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      frameloop={isInView ? 'always' : 'never'}
    >
      <PerformanceMonitor
        onDecline={() => onTierChange(DOWNGRADE[tier])}
        onFallback={() => onTierChange('static')}
      />
      <Suspense fallback={null}>
        <ParticleSystem count={PARTICLE_COUNT[tier]} />
        {/* Phones use LiteParticles instead, which has no bloom pass. */}
        <PostFX />
      </Suspense>
    </Canvas>
  )
}
