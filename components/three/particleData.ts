import { sampleTextToParticles } from '@/utils/canvasSampling'

// Particle buffers for the hero name. Shared by ParticleSystem (three.js, desktop) and
// LiteParticles (plain WebGL, phones) so both draw the same layout. No three.js import here.

// Seeded PRNG (mulberry32) so the particle layout is deterministic and render stays pure
function createRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildParticles(particleCount: number, lines: string[]) {
  const random = createRandom(particleCount)
  const sampled = sampleTextToParticles(lines, particleCount, random)

  const posArray = new Float32Array(particleCount * 3)
  const seedArray = new Float32Array(particleCount)
  const sizeArray = new Float32Array(particleCount)
  const accentArray = new Float32Array(particleCount)

  for (let i = 0; i < particleCount; i++) {
    // Nebula-like initial distribution
    posArray[i * 3] = (random() - 0.5) * 40
    posArray[i * 3 + 1] = (random() - 0.5) * 40
    posArray[i * 3 + 2] = (random() - 0.5) * 40 - 10

    seedArray[i] = random()
    sizeArray[i] = random() * 0.028 + 0.012 // world units

    // 6-8% tinted signal red
    accentArray[i] = random() < 0.07 ? 1.0 : 0.0
  }

  return {
    positions: posArray,
    targets: sampled.targets,
    seeds: seedArray,
    sizes: sizeArray,
    accents: accentArray,
    textWidth: sampled.width,
    textHeight: sampled.height,
  }
}

// Behaviour constants both renderers share
export const NO_SHOCK = 100 // seconds; old enough that the ring has fully faded
