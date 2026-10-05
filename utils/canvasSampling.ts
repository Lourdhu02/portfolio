// The display font family as next/font registered it, read from the CSS variable
// that app/layout.tsx puts on <html>. Canvas text needs the real family name, not the variable.
export function displayFontFamily() {
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-big-shoulders').trim()
  return family || '"Arial Narrow", sans-serif'
}

export interface SampledText {
  targets: Float32Array
  // Size of the text block in world units, so the scene can scale it to fit the viewport
  width: number
  height: number
}

const FONT_PX = 280 // drawn at 2x the ~140px display size for denser sampling
const WORLD_PER_PX = 2.4 / FONT_PX // one line of caps is ~2.4 world units tall
const LINE_HEIGHT = 0.92

// Draws `lines` (stacked, centred) on an offscreen canvas and samples particle targets from the
// filled pixels. About 12% of particles become ambient dust at other depths for parallax.
export function sampleTextToParticles(
  lines: string[],
  particleCount: number,
  random: () => number,
  fontFamily = displayFontFamily()
): SampledText {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return { targets: new Float32Array(particleCount * 3), width: 1, height: 1 }

  const font = `900 ${FONT_PX}px ${fontFamily}`
  ctx.font = font
  const textWidth = Math.max(...lines.map(l => ctx.measureText(l).width))
  const lineStep = FONT_PX * LINE_HEIGHT
  const pad = FONT_PX * 0.1
  const width = Math.ceil(textWidth + pad * 2)
  const height = Math.ceil(lineStep * lines.length + pad * 2)
  canvas.width = width
  canvas.height = height

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)
  ctx.font = font
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, pad + lineStep * (i + 0.5))
  })

  const data = ctx.getImageData(0, 0, width, height).data
  // Filled pixel coordinates in a typed array (x, y pairs): no per-pixel array growth or boxing
  const filled = new Uint32Array(Math.ceil(width / 2) * Math.ceil(height / 2) * 2)
  let filledLength = 0
  const step = 2
  for (let y = 0; y < height; y += step) {
    const row = y * width
    for (let x = 0; x < width; x += step) {
      if (data[(row + x) * 4] > 128) {
        filled[filledLength++] = x
        filled[filledLength++] = y
      }
    }
  }

  const worldW = width * WORLD_PER_PX
  const worldH = height * WORLD_PER_PX
  const targets = new Float32Array(particleCount * 3)
  const pixels = filledLength / 2

  for (let i = 0; i < particleCount; i++) {
    if (pixels === 0 || random() < 0.12) {
      targets[i * 3] = (random() - 0.5) * Math.max(worldW, 12) * 1.4
      targets[i * 3 + 1] = (random() - 0.5) * Math.max(worldH, 8) * 2
      targets[i * 3 + 2] = (random() - 0.5) * 8 - 2
      continue
    }
    const p = Math.floor(random() * pixels) * 2
    targets[i * 3] = (filled[p] / width - 0.5) * worldW
    targets[i * 3 + 1] = -(filled[p + 1] / height - 0.5) * worldH
    targets[i * 3 + 2] = (random() - 0.5) * 0.4
  }

  return { targets, width: worldW, height: worldH }
}
