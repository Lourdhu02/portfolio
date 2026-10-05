import { sampleTextToParticles } from '@/utils/canvasSampling'

// Shared by the R3F hero (desktop) and the plain WebGL hero (phones), so both build the same name.
// No three.js import here: phones load this without the three chunk.

// Seeded PRNG (mulberry32) so the particle layout is deterministic and render stays pure
function createRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const PARTICLE_COLOR = '#EDEDF0'
export const PARTICLE_ACCENT = '#FF4655'

export function buildParticles(particleCount: number) {
  // Generate target positions from text
  const targets = sampleTextToParticles('LOURDU RAJU', particleCount)

  // Initial random positions
  const positions = new Float32Array(particleCount * 3)
  const seeds = new Float32Array(particleCount)
  const sizes = new Float32Array(particleCount)
  const accents = new Float32Array(particleCount)
  const random = createRandom(particleCount)

  for (let i = 0; i < particleCount; i++) {
    // Nebula-like initial distribution
    positions[i * 3] = (random() - 0.5) * 40
    positions[i * 3 + 1] = (random() - 0.5) * 40
    positions[i * 3 + 2] = (random() - 0.5) * 40 - 10

    seeds[i] = random()
    sizes[i] = random() * 0.5 + 0.1

    // 6-8% tinted signal red
    accents[i] = random() < 0.07 ? 1.0 : 0.0
  }

  return { positions, targets, seeds, sizes, accents }
}
