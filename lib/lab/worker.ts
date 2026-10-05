// Web Worker for /lab: renders the stressed meter, runs the model and times it,
// so the page thread only paints.
import { parseModel, forward, decode, type Model } from './infer'
import { renderMeter, toGray, normalize, rng, randomSpec, W, H, NO_STRESS, type MeterSpec, type StressKey } from './meter'

export type WorkerIn =
  | { type: 'load'; url: string }
  | { type: 'read'; id: number; spec: MeterSpec }
  | { type: 'sweep'; id: number; key: StressKey; perLevel: number; seed: number }
  | { type: 'cancel' }

export type ReadResult = {
  type: 'read'
  id: number
  image: ImageData
  gray: Uint8Array
  probs: Float32Array
  T: number
  K: number
  text: string
  path: number[]
  chars: { ch: string; conf: number; from: number; to: number }[]
  confidence: number
  ms: number
}

export type WorkerOut =
  | { type: 'ready'; bytes: number; ms: number; alphabet: string }
  | { type: 'error'; message: string }
  | ReadResult
  | { type: 'sweep-point'; id: number; level: number; exact: number; n: number; msP50: number }
  | { type: 'sweep-done'; id: number }

let model: Model | null = null
let sweepId = 0
const canvas = new OffscreenCanvas(W, H)
const ctx = canvas.getContext('2d', { willReadFrequently: true })!

function post(m: WorkerOut) {
  ;(self as unknown as Worker).postMessage(m)
}

function read(spec: MeterSpec) {
  const image = renderMeter(ctx, spec)
  const gray = toGray(image)
  const x = normalize(gray)
  const t0 = performance.now()
  const { probs, T, K } = forward(model!, x)
  const d = decode(probs, T, K, model!.alphabet)
  const ms = performance.now() - t0
  return { image, gray, probs, T, K, ms, ...d }
}

self.onmessage = async (e: MessageEvent<WorkerIn>) => {
  const msg = e.data
  try {
    if (msg.type === 'load') {
      const t0 = performance.now()
      const buf = await (await fetch(msg.url)).arrayBuffer()
      model = parseModel(buf)
      // Warm the JIT so the first visible timing is not a cold start
      forward(model, new Float32Array(model.inH * model.inW))
      post({ type: 'ready', bytes: buf.byteLength, ms: performance.now() - t0, alphabet: model.alphabet })
    } else if (msg.type === 'read' && model) {
      post({ type: 'read', id: msg.id, ...read(msg.spec) })
    } else if (msg.type === 'cancel') {
      sweepId = -1
    } else if (msg.type === 'sweep' && model) {
      sweepId = msg.id
      for (let l = 0; l <= 10; l++) {
        const r = rng(msg.seed + l * 7919)
        let ok = 0
        const times: number[] = []
        for (let i = 0; i < msg.perLevel; i++) {
          const spec = randomSpec(r)
          spec.stress = { ...NO_STRESS, [msg.key]: l / 10 }
          const out = read(spec)
          times.push(out.ms)
          if (out.text === spec.text) ok++
          // Yield so a cancel or a new read can get through
          if (i % 8 === 7) {
            await new Promise((res) => setTimeout(res, 0))
            if (sweepId !== msg.id) return
          }
        }
        times.sort((a, b) => a - b)
        post({ type: 'sweep-point', id: msg.id, level: l / 10, exact: ok / msg.perLevel, n: msg.perLevel, msP50: times[times.length >> 1] })
      }
      post({ type: 'sweep-done', id: msg.id })
    }
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
}
