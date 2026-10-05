export function sampleTextToParticles(
  text: string,
  particleCount: number,
  font = '900 120px "Oswald", sans-serif'
) {
  // Create an offscreen canvas
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return new Float32Array()

  // Scale up for 2x density as requested
  const scale = 2
  const width = 1000 * scale
  const height = 300 * scale
  canvas.width = width
  canvas.height = height

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)

  // Draw text
  ctx.font = font
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Adjust font size for scale
  ctx.font = `900 ${140 * scale}px "Oswald", sans-serif`
  ctx.fillText(text, width / 2, height / 2)

  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  const validPositions: { x: number; y: number }[] = []

  // Step through pixels and collect valid ones based on density
  // We skip some pixels to make sampling faster
  const step = scale
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4
      const r = data[index]
      
      // If pixel is not black
      if (r > 128) {
        // Map to world space (normalize and center)
        const normalizedX = (x / width - 0.5) * 16 // arbitrary world scale
        const normalizedY = -(y / height - 0.5) * 4.8
        
        validPositions.push({ x: normalizedX, y: normalizedY })
      }
    }
  }

  // Pick random valid positions for the targets
  const targets = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    const randomIndex = Math.floor(Math.random() * validPositions.length)
    const pos = validPositions[randomIndex]
    
    // Some ambient dust particles at other depths
    const isAmbient = Math.random() < 0.12 // 10-15%
    
    targets[i * 3] = isAmbient ? (Math.random() - 0.5) * 20 : pos.x
    targets[i * 3 + 1] = isAmbient ? (Math.random() - 0.5) * 20 : pos.y
    targets[i * 3 + 2] = isAmbient ? (Math.random() - 0.5) * 8 - 2 : (Math.random() - 0.5) * 0.4
  }

  return targets
}
