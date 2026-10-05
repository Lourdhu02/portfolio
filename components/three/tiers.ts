export type Tier = 'high' | 'medium' | 'low' | 'static'

// Particle budget per tier. 'static' renders the plain text hero and never loads three.js.
export const PARTICLE_COUNT: Record<Exclude<Tier, 'static'>, number> = {
  high: 24000,
  medium: 12000,
  low: 8000,
}

// One step down when PerformanceMonitor sees the frame rate drop.
export const DOWNGRADE: Record<Tier, Tier> = {
  high: 'medium',
  medium: 'low',
  low: 'static',
  static: 'static',
}

// A feature check only: actually creating a throwaway context costs as much as the real one.
// If context creation fails later, ParticleName's error boundary falls back to the static hero.
function hasWebGL() {
  return typeof WebGL2RenderingContext !== 'undefined' || typeof WebGLRenderingContext !== 'undefined'
}

// Runs once on the client, before three.js is requested, so phones never download or build the desktop budget.
export function detectTier(): Tier {
  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean }
  }
  const memory = nav.deviceMemory ?? 8
  const cores = nav.hardwareConcurrency || 4
  const saveData = nav.connection?.saveData === true
  const isPhone =
    window.matchMedia('(pointer: coarse)').matches ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  if (saveData || memory <= 2 || cores <= 2 || !hasWebGL()) return 'static'
  if (isPhone) return 'low'
  if (memory <= 4 || cores <= 4) return 'medium'
  if (memory >= 8 && cores >= 8) return 'high'
  return 'medium'
}
