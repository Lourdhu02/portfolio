// Hand-written inference for the /lab meter reader. No runtime, no WASM: int8 weights
// are dequantised once, then each forward pass is plain loops over Float32Arrays.
// Layer layout mirrors ARCH in scripts/lab/train.py.

interface LayerMeta {
  kind: 'conv' | 'head'
  ci: number
  co: number
  k: [number, number]
  pool: [number, number] | null
  w: number
  s: number
  b: number
}

interface Layer extends LayerMeta {
  weight: Float32Array // co * ci * kh * kw
  bias: Float32Array
}

export interface Model {
  alphabet: string
  inH: number
  inW: number
  layers: Layer[]
}

export function parseModel(buf: ArrayBuffer): Model {
  const headLen = new DataView(buf).getUint32(0, true)
  const head = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, headLen)))
  const base = 4 + headLen
  const layers: Layer[] = head.layers.map((m: LayerMeta) => {
    const n = m.co * m.ci * m.k[0] * m.k[1]
    const q = new Int8Array(buf, base + m.w, n)
    const s = new Float32Array(buf.slice(base + m.s, base + m.s + 4 * m.co))
    const bias = new Float32Array(buf.slice(base + m.b, base + m.b + 4 * m.co))
    const per = n / m.co
    const weight = new Float32Array(n)
    for (let i = 0; i < n; i++) weight[i] = q[i] * s[(i / per) | 0]
    return { ...m, weight, bias }
  })
  return { alphabet: head.alphabet, inH: head.inH, inW: head.inW, layers }
}

function conv(x: Float32Array, C: number, H: number, W: number, L: Layer, relu: boolean) {
  const [kh, kw] = L.k
  const ph = kh === 2 ? 0 : kh >> 1
  const pw = kw >> 1
  const OH = H + 2 * ph - kh + 1
  const OW = W
  const out = new Float32Array(L.co * OH * OW)
  const wt = L.weight
  for (let o = 0; o < L.co; o++) {
    const ob = o * OH * OW
    out.fill(L.bias[o], ob, ob + OH * OW)
    for (let c = 0; c < C; c++) {
      const ib = c * H * W
      for (let ky = 0; ky < kh; ky++)
        for (let kx = 0; kx < kw; kx++) {
          const w = wt[((o * C + c) * kh + ky) * kw + kx]
          if (w === 0) continue
          const dx = kx - pw
          const x0 = Math.max(0, -dx)
          const x1 = Math.min(OW, W - dx)
          for (let y = 0; y < OH; y++) {
            const iy = y + ky - ph
            if (iy < 0 || iy >= H) continue
            const orow = ob + y * OW
            const irow = ib + iy * W + dx
            for (let xx = x0; xx < x1; xx++) out[orow + xx] += w * x[irow + xx]
          }
        }
    }
  }
  if (relu) for (let i = 0; i < out.length; i++) if (out[i] < 0) out[i] = 0
  return { out, H: OH, W: OW }
}

function maxpool(x: Float32Array, C: number, H: number, W: number, ph: number, pw: number) {
  const OH = (H / ph) | 0
  const OW = (W / pw) | 0
  const out = new Float32Array(C * OH * OW)
  for (let c = 0; c < C; c++)
    for (let y = 0; y < OH; y++)
      for (let xx = 0; xx < OW; xx++) {
        let m = -Infinity
        for (let j = 0; j < ph; j++)
          for (let i = 0; i < pw; i++) {
            const v = x[c * H * W + (y * ph + j) * W + xx * pw + i]
            if (v > m) m = v
          }
        out[c * OH * OW + y * OW + xx] = m
      }
  return { out, H: OH, W: OW }
}

// Returns softmax probabilities as [T][K] flattened (frame-major), K = alphabet + blank
export function forward(model: Model, input: Float32Array) {
  let x = input
  let C = 1
  let H = model.inH
  let W = model.inW
  for (const L of model.layers) {
    const r = conv(x, C, H, W, L, L.kind === 'conv')
    x = r.out
    H = r.H
    W = r.W
    C = L.co
    if (L.pool) {
      const p = maxpool(x, C, H, W, L.pool[0], L.pool[1])
      x = p.out
      H = p.H
      W = p.W
    }
  }
  // x is [K][1][T] -> probs [T][K]
  const K = C
  const T = W
  const probs = new Float32Array(T * K)
  const logits = new Float32Array(T * K)
  for (let t = 0; t < T; t++) {
    let m = -Infinity
    for (let k = 0; k < K; k++) {
      const v = x[k * T + t]
      logits[t * K + k] = v
      if (v > m) m = v
    }
    let s = 0
    for (let k = 0; k < K; k++) s += probs[t * K + k] = Math.exp(x[k * T + t] - m)
    for (let k = 0; k < K; k++) probs[t * K + k] /= s
  }
  return { probs, logits, T, K }
}

export interface Decoded {
  text: string
  path: number[] // argmax class per frame
  chars: { ch: string; conf: number; from: number; to: number }[]
  confidence: number // product of per-char confidences
}

// Greedy CTC: argmax per frame, merge repeats, drop blanks
export function decode(probs: Float32Array, T: number, K: number, alphabet: string): Decoded {
  const path: number[] = []
  for (let t = 0; t < T; t++) {
    let best = 0
    for (let k = 1; k < K; k++) if (probs[t * K + k] > probs[t * K + best]) best = k
    path.push(best)
  }
  const chars: Decoded['chars'] = []
  let prev = 0
  for (let t = 0; t < T; t++) {
    const c = path[t]
    if (c && c !== prev) chars.push({ ch: alphabet[c - 1], conf: probs[t * K + c], from: t, to: t })
    else if (c && c === prev) {
      const last = chars[chars.length - 1]
      last.to = t
      last.conf = Math.max(last.conf, probs[t * K + c])
    }
    prev = c
  }
  return {
    text: chars.map((c) => c.ch).join(''),
    path,
    chars,
    confidence: chars.reduce((a, c) => a * c.conf, 1),
  }
}
