"use client"
import { Component, ReactNode, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { detectTier, PARTICLE_COUNT, Tier } from './tiers'
import { displayFontFamily } from '@/utils/canvasSampling'

// Each renderer is its own chunk, fetched only by devices that will use it: desktops get three.js
// with bloom, phones get the plain WebGL version of the same shaders, and 'static' gets neither.
const ParticleCanvas = dynamic(() => import('./ParticleCanvas'), { ssr: false })
const LiteParticles = dynamic(() => import('./LiteParticles'), { ssr: false })

// WebGL can still fail at context creation (blocklisted GPU, lost context); show the static hero then.
class CanvasBoundary extends Component<{ fallback: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.fallback()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function StaticHero() {
  return (
    <div className="flex h-[100vh] w-full items-center justify-center bg-bg relative z-0">
      <h1 className="font-display text-[clamp(72px,12vw,220px)] leading-[0.85] text-text text-center tracking-tight">
        LOURDU RAJU
      </h1>
    </div>
  )
}

export function ParticleName() {
  // null until the device is measured on the client; nothing heavy is requested before then.
  const [tier, setTier] = useState<Tier | null>(null)

  useEffect(() => {
    const detected = detectTier()
    let cancelled = false
    if (detected === 'static') {
      queueMicrotask(() => !cancelled && setTier(detected))
      return () => { cancelled = true }
    }
    // Wait for the display font so the sampled glyphs match, and for an idle slot so hydration finishes first.
    let idleId: number | undefined
    document.fonts.load(`900 140px ${displayFontFamily()}`).catch(() => {}).finally(() => {
      if (cancelled) return
      const start = () => !cancelled && setTier(detected)
      // Safari has no requestIdleCallback.
      if (typeof window.requestIdleCallback === 'function') idleId = window.requestIdleCallback(start, { timeout: 1200 })
      else idleId = window.setTimeout(start, 200)
    })
    return () => {
      cancelled = true
      if (idleId === undefined) return
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleId)
      else window.clearTimeout(idleId)
    }
  }, [])

  if (tier === 'static') return <StaticHero />

  return (
    <div id="hero-canvas-container" className="absolute inset-0 z-0 h-full w-full pointer-events-auto">
      {/* HTML H1 for SEO and LCP */}
      <h1 className="sr-only">Lourdu Raju</h1>
      {tier && (
        <CanvasBoundary fallback={() => setTier('static')}>
          {tier === 'low' ? (
            <LiteParticles count={PARTICLE_COUNT.low} onTierChange={setTier} />
          ) : (
            <ParticleCanvas tier={tier} onTierChange={setTier} />
          )}
        </CanvasBoundary>
      )}
    </div>
  )
}
