"use client"
import { Component, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { usePerformanceTier } from './tiers'
import type { ParticleNameProps } from './ParticleScene'

// Client-only: load through next/dynamic with ssr: false. Renders nothing on the static tier,
// where the page's own <h1> stays as the hero.
//
// This file is deliberately light. It picks a renderer for the device and only then fetches it:
// touch devices on the low tier (phones, most tablets) get LiteParticles, the same shaders in plain
// WebGL (a few KB, no bloom pass); everything else gets ParticleScene (three.js + bloom, ~270KB
// gzipped); static gets nothing.
const ParticleScene = dynamic(() => import('./ParticleScene'), { ssr: false })
const LiteParticles = dynamic(() => import('./LiteParticles'), { ssr: false })

// WebGL can still fail when the real context is created (blocklisted GPU, lost context).
// Render nothing then, so the page's heading stays.
class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function ParticleName(props: ParticleNameProps) {
  const tier = usePerformanceTier()
  if (tier === 'static') return null
  // Safe to read here: this component only ever renders on the client
  const lite = tier === 'low' && window.matchMedia('(pointer: coarse)').matches
  return (
    <WebGLBoundary>
      {lite ? <LiteParticles {...props} /> : <ParticleScene {...props} />}
    </WebGLBoundary>
  )
}
