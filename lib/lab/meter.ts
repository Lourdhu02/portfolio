// Synthetic seven-segment meter renderer. The same code renders the training set
// (scripts/lab/generate.mjs runs it in headless Chromium) and the specimen on /lab,
// so what the visitor sees is drawn from the distribution the model was trained on.
//
// Geometry is drawn with Canvas 2D; every photometric stress (blur, noise, glare,
// fade) runs in plain JS on the pixels so results match across browsers.

export const W = 512
export const H = 128
export const IN_W = 128
export const IN_H = 32
export const ALPHABET = '0123456789.' // CTC class i+1; class 0 is blank

export type StressKey = 'blur' | 'noise' | 'tilt' | 'glare' | 'fade' | 'dirt'
export type Stress = Record<StressKey, number>
export const STRESS_KEYS: StressKey[] = ['blur', 'noise', 'tilt', 'glare', 'fade', 'dirt']
export const NO_STRESS: Stress = { blur: 0, noise: 0, tilt: 0, glare: 0, fade: 0, dirt: 0 }

export interface MeterSpec {
  text: string
  seed: number
  scheme: number
  stress: Stress
}

// mulberry32: small, fast, seedable
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gauss(r: () => number) {
  const u = Math.max(r(), 1e-9)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
}

interface Scheme {
  name: string
  bg: [number, number, number]
  on: [number, number, number]
  ghost: number
  glow: number
}

export const SCHEMES: Scheme[] = [
  { name: 'Reflective LCD', bg: [150, 162, 136], on: [28, 34, 26], ghost: 0.1, glow: 0 },
  { name: 'Backlit LCD', bg: [96, 150, 214], on: [10, 22, 48], ghost: 0.12, glow: 0 },
  { name: 'Red LED', bg: [18, 6, 6], on: [255, 64, 52], ghost: 0.08, glow: 10 },
  { name: 'VFD', bg: [6, 16, 15], on: [96, 245, 224], ghost: 0.06, glow: 8 },
  { name: 'Amber LCD', bg: [214, 150, 48], on: [36, 20, 6], ghost: 0.1, glow: 0 },
]

// Segment masks, bit order a b c d e f g
const SEG: Record<string, number> = {
  '0': 0b1111110, '1': 0b0110000, '2': 0b1101101, '3': 0b1111001, '4': 0b0110011,
  '5': 0b1011011, '6': 0b1011111, '7': 0b1110000, '8': 0b1111111, '9': 0b1111011,
}

// Random reading: 4–8 digits, optional decimal point, leading zeros allowed
export function randomText(r: () => number) {
  const n = 4 + Math.floor(r() * 5)
  let s = ''
  for (let i = 0; i < n; i++) s += Math.floor(r() * 10)
  if (r() < 0.65) {
    const p = 1 + Math.floor(r() * Math.min(3, n - 1))
    s = s.slice(0, n - p) + '.' + s.slice(n - p)
  }
  return s
}

// Training distribution of stress: mostly mild, with a long tail into hard cases
export function randomStress(r: () => number): Stress {
  const s = {} as Stress
  for (const k of STRESS_KEYS) s[k] = r() < 0.35 ? 0 : Math.min(1, Math.pow(r(), 1.6) * 1.05)
  return s
}

export function randomSpec(r: () => number): MeterSpec {
  return {
    text: randomText(r),
    seed: Math.floor(r() * 2 ** 31),
    scheme: Math.floor(r() * SCHEMES.length),
    stress: randomStress(r),
  }
}

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

function segPolys(x: number, y: number, w: number, h: number, t: number): [number, number][][] {
  // Hexagonal bars; t = stroke thickness
  const hb = (x0: number, y0: number, len: number): [number, number][] => [
    [x0, y0], [x0 + t / 2, y0 - t / 2], [x0 + len - t / 2, y0 - t / 2],
    [x0 + len, y0], [x0 + len - t / 2, y0 + t / 2], [x0 + t / 2, y0 + t / 2],
  ]
  const vb = (x0: number, y0: number, len: number): [number, number][] => [
    [x0, y0], [x0 + t / 2, y0 + t / 2], [x0 + t / 2, y0 + len - t / 2],
    [x0, y0 + len], [x0 - t / 2, y0 + len - t / 2], [x0 - t / 2, y0 + t / 2],
  ]
  const g = t * 0.18
  const m = y + h / 2
  return [
    hb(x + g, y, w - 2 * g), // a
    vb(x + w, y + g, h / 2 - 2 * g), // b
    vb(x + w, m + g, h / 2 - 2 * g), // c
    hb(x + g, y + h, w - 2 * g), // d
    vb(x, m + g, h / 2 - 2 * g), // e
    vb(x, y + g, h / 2 - 2 * g), // f
    hb(x + g, m, w - 2 * g), // g
  ]
}

function rgb(c: [number, number, number], a = 1) {
  return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`
}

// Draw the clean scene (geometry + dirt + tilt). Photometric stress is applied after.
function drawGeometry(ctx: Ctx, spec: MeterSpec, r: () => number) {
  const sc = SCHEMES[spec.scheme % SCHEMES.length]
  const jit = (c: [number, number, number], k: number) =>
    c.map((v) => Math.max(0, Math.min(255, v + (r() - 0.5) * k))) as [number, number, number]
  const bg = jit(sc.bg, 30)
  const on = jit(sc.on, 24)
  const st = spec.stress

  // Housing behind the display (shows when tilted or loosely cropped)
  const housing = 20 + r() * 60
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = `rgb(${housing},${housing},${housing + 4})`
  ctx.fillRect(0, 0, W, H)

  const ang = (r() - 0.5) * 2 * (0.012 + st.tilt * 0.2)
  const shear = (r() - 0.5) * 2 * (0.03 + st.tilt * 0.32)
  const sy = 1 - st.tilt * 0.12 * r()
  const cos = Math.cos(ang)
  const sin = Math.sin(ang)
  ctx.setTransform(cos, sin, -sin + shear, cos * sy, W / 2, H / 2)

  // Display window, like a detector crop with some slack
  const mx = 6 + r() * 26
  const my = 4 + r() * 12
  const dw = W - 2 * mx
  const dh = H - 2 * my
  ctx.fillStyle = rgb(bg)
  ctx.fillRect(-dw / 2, -dh / 2, dw, dh)

  // Digit layout
  const chars = spec.text.replace(/\./g, '')
  const dots = new Set<number>()
  {
    let k = -1
    for (const ch of spec.text) {
      if (ch === '.') dots.add(k)
      else k++
    }
  }
  const n = chars.length
  const hasUnit = r() < 0.4
  const usable = dw * (hasUnit ? 0.8 : 0.94)
  const cellH = dh * (0.62 + r() * 0.2)
  const cellW = Math.min(usable / n, cellH * (0.55 + r() * 0.2))
  const digW = cellW * (0.62 + r() * 0.1)
  const thick = Math.max(3, digW * (0.15 + r() * 0.08))
  const slant = (r() < 0.6 ? 0.12 : 0) + r() * 0.06
  const total = cellW * n
  const x0 = -dw / 2 + (dw * (hasUnit ? 0.8 : 1) - total) / 2 + (r() - 0.5) * 6
  const y0 = -cellH / 2 + (r() - 0.5) * dh * 0.1

  ctx.save()
  ctx.transform(1, 0, -slant, 1, 0, 0)
  const drawPoly = (p: [number, number][]) => {
    ctx.beginPath()
    ctx.moveTo(p[0][0], p[0][1])
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1])
    ctx.closePath()
    ctx.fill()
  }
  for (let i = 0; i < n; i++) {
    const cx = x0 + i * cellW + (cellW - digW) / 2
    const polys = segPolys(cx, y0, digW, cellH, thick)
    const mask = SEG[chars[i]]
    for (let s = 0; s < 7; s++) {
      const lit = (mask >> (6 - s)) & 1
      ctx.fillStyle = lit ? rgb(on) : rgb(on, sc.ghost)
      if (lit && sc.glow) {
        ctx.shadowColor = rgb(on, 0.8)
        ctx.shadowBlur = sc.glow
      }
      drawPoly(polys[s])
      ctx.shadowBlur = 0
    }
    // Decimal point after this digit
    const lit = dots.has(i)
    ctx.fillStyle = lit ? rgb(on) : rgb(on, sc.ghost)
    const ds = thick * 1.1
    ctx.fillRect(cx + digW + (cellW - digW) / 2 - ds * 0.9, y0 + cellH - ds / 2, ds, ds)
  }
  ctx.restore()

  if (hasUnit) {
    ctx.fillStyle = rgb(on, 0.85)
    ctx.font = `600 ${Math.round(dh * 0.18)}px sans-serif`
    ctx.textBaseline = 'middle'
    ctx.fillText(r() < 0.5 ? 'kWh' : 'kVAh', dw / 2 - dw * 0.18, dh * 0.22)
  }

  // Dirt and scratches
  const blobs = Math.round(st.dirt * 14)
  for (let i = 0; i < blobs; i++) {
    const bx = (r() - 0.5) * dw
    const by = (r() - 0.5) * dh
    const rr = 4 + r() * 22 * (0.4 + st.dirt)
    const shade = r() < 0.7 ? 20 : 200
    ctx.fillStyle = `rgba(${shade},${shade - 6},${shade - 12},${0.35 + r() * 0.5})`
    ctx.beginPath()
    ctx.ellipse(bx, by, rr, rr * (0.3 + r() * 0.7), r() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  const scratches = Math.round(st.dirt * 5)
  ctx.lineCap = 'round'
  for (let i = 0; i < scratches; i++) {
    ctx.strokeStyle = `rgba(230,230,220,${0.25 + r() * 0.35})`
    ctx.lineWidth = 1 + r() * 2
    ctx.beginPath()
    const ax = (r() - 0.5) * dw
    const ay = (r() - 0.5) * dh
    ctx.moveTo(ax, ay)
    ctx.lineTo(ax + (r() - 0.5) * 160, ay + (r() - 0.5) * 60)
    ctx.stroke()
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

function blurRGBA(d: Uint8ClampedArray, sigma: number) {
  if (sigma < 0.3) return
  const rad = Math.ceil(sigma * 2.5)
  const k: number[] = []
  let sum = 0
  for (let i = -rad; i <= rad; i++) {
    const v = Math.exp(-(i * i) / (2 * sigma * sigma))
    k.push(v)
    sum += v
  }
  for (let i = 0; i < k.length; i++) k[i] /= sum
  const tmp = new Float32Array(W * H * 3)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      for (let c = 0; c < 3; c++) {
        let a = 0
        for (let i = -rad; i <= rad; i++) {
          const xx = Math.min(W - 1, Math.max(0, x + i))
          a += d[(y * W + xx) * 4 + c] * k[i + rad]
        }
        tmp[(y * W + x) * 3 + c] = a
      }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      for (let c = 0; c < 3; c++) {
        let a = 0
        for (let i = -rad; i <= rad; i++) {
          const yy = Math.min(H - 1, Math.max(0, y + i))
          a += tmp[(yy * W + x) * 3 + c] * k[i + rad]
        }
        d[(y * W + x) * 4 + c] = a
      }
}

function photometric(d: Uint8ClampedArray, st: Stress, r: () => number) {
  blurRGBA(d, 0.4 + st.blur * 6.5)

  // Glare: a soft hotspot plus a specular streak
  const gx = r() * W
  const gy = r() * H
  const gr = 40 + r() * 140
  const streakAng = r() * Math.PI
  const sx = Math.cos(streakAng)
  const sy = Math.sin(streakAng)
  const gi = st.glare * (0.8 + r() * 0.4)

  // Fade: low contrast plus an exposure shift
  const fade = st.fade * 0.85
  const shift = (r() - 0.5) * 120 * st.fade
  const shadeDir = r() * Math.PI * 2
  const shade = st.fade * 0.5 * r()

  const sigma = 2 + st.noise * 70
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      const dx = x - gx
      const dy = y - gy
      const hot = Math.exp(-(dx * dx + dy * dy) / (gr * gr))
      const along = Math.abs(dx * sy - dy * sx)
      const streak = Math.exp(-(along * along) / 60) * 0.6
      const g = gi * 255 * Math.min(1, hot + streak)
      const sh = 1 - shade * (0.5 + 0.5 * Math.cos(shadeDir) * (x / W - 0.5) * 2)
      const nz = gauss(r) * sigma
      for (let c = 0; c < 3; c++) {
        let v = d[i + c]
        v = 128 + (v - 128) * (1 - fade) + shift
        v = v * sh + g + nz + gauss(r) * sigma * 0.25
        d[i + c] = v
      }
    }
}

// Render a stressed meter into ctx (W x H). Returns the RGBA pixels.
export function renderMeter(ctx: Ctx, spec: MeterSpec): ImageData {
  const r = rng(spec.seed)
  drawGeometry(ctx, spec, r)
  const img = ctx.getImageData(0, 0, W, H)
  photometric(img.data, spec.stress, r)
  ctx.putImageData(img, 0, 0)
  return img
}

// 4x4 box downsample to IN_W x IN_H grayscale, 0..255
export function toGray(img: ImageData): Uint8Array {
  const out = new Uint8Array(IN_W * IN_H)
  const d = img.data
  for (let y = 0; y < IN_H; y++)
    for (let x = 0; x < IN_W; x++) {
      let a = 0
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 4; i++) {
          const p = ((y * 4 + j) * W + x * 4 + i) * 4
          a += 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2]
        }
      out[y * IN_W + x] = Math.round(a / 16)
    }
  return out
}

// Per-image standardisation, identical to scripts/lab/train.py
export function normalize(g: Uint8Array): Float32Array {
  const n = g.length
  let m = 0
  for (let i = 0; i < n; i++) m += g[i]
  m /= n
  let v = 0
  for (let i = 0; i < n; i++) v += (g[i] - m) ** 2
  const s = Math.sqrt(v / n) + 4
  const x = new Float32Array(n)
  for (let i = 0; i < n; i++) x[i] = (g[i] - m) / s
  return x
}
