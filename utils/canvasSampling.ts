// The display font family as next/font registered it (a hashed name), read from the CSS variable
// that app/layout.tsx puts on <html>. Canvas text needs the real family name, not the variable.
export function displayFontFamily() {
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-big-shoulders').trim()
  return family || '"Arial Narrow", sans-serif'
}

export function sampleTextToParticles(
  text: string,
  particleCount: number,
  fontFamily = displayFontFamily()
) {
  // Draw the name once on a small offscreen canvas. Every pixel is one candidate, which gives
  // the same 1000x300 sample grid as drawing at 2x and skipping every other pixel, at a quarter
  // of the fill and readback cost.
  const width = 1000
  const height = 300
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return new Float32Array(particleCount * 3)

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `900 140px ${fontFamily}`
  ctx.fillText(text, width / 2, height / 2)

  const data = ctx.getImageData(0, 0, width, height).data

  // Indices of lit pixels, in a typed array rather than an array of objects (no per-pixel allocation).
  const lit = new Uint32Array(width * height)
  let litCount = 0
  for (let i = 0, p = 0; p < data.length; i++, p += 4) {
    if (data[p] > 128) lit[litCount++] = i
  }

  const targets = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    // Some ambient dust particles at other depths
    const isAmbient = litCount === 0 || Math.random() < 0.12 // 10-15%
    if (isAmbient) {
      targets[i * 3] = (Math.random() - 0.5) * 20
      targets[i * 3 + 1] = (Math.random() - 0.5) * 20
      targets[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
      continue
    }
    const pixel = lit[Math.floor(Math.random() * litCount)]
    const x = pixel % width
    const y = (pixel - x) / width
    // Map to world space (normalize and center)
    targets[i * 3] = (x / width - 0.5) * 16 // arbitrary world scale
    targets[i * 3 + 1] = -(y / height - 0.5) * 4.8
    targets[i * 3 + 2] = (Math.random() - 0.5) * 0.4
  }

  return targets
}
