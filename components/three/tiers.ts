import { useSyncExternalStore } from 'react'

// high/medium/low pick a particle budget; static means no WebGL2, so the hero stays typographic
export type Tier = 'high' | 'medium' | 'low' | 'static'

export const PARTICLE_COUNT = { high: 24000, medium: 12000, low: 6000 } as const

// Device capabilities never change during a session, so there is nothing to subscribe to.
const subscribe = () => () => {}

let cached: Tier | null = null

function getDeviceTier(): Tier {
  if (cached) return cached
  const webgl2 = !!document.createElement('canvas').getContext('webgl2')
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  const cores = navigator.hardwareConcurrency || 4
  const coarse = window.matchMedia('(pointer: coarse)').matches

  if (!webgl2) cached = 'static'
  else if (coarse || memory <= 4 || cores <= 4) cached = 'low'
  else if (memory <= 8 || cores <= 8) cached = 'medium'
  else cached = 'high'
  return cached
}

export function usePerformanceTier(): Tier {
  return useSyncExternalStore(subscribe, getDeviceTier, () => 'static')
}

export function lowerTier(tier: Tier): Tier {
  return tier === 'high' ? 'medium' : tier === 'medium' ? 'low' : tier
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(reducedMotionQuery)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false
  )
}
