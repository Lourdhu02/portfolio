import { createLiteRenderer, type LiteOptions, type LiteRenderer } from './liteRenderer'
import type { Particles } from './particleData'

// Runs the low-tier hero on an OffscreenCanvas, so creating the WebGL context (the slowest step on
// software-rendered GPUs) and drawing each frame never block the page's main thread.

type Method = Exclude<keyof LiteRenderer, 'dispose'>

export type LiteWorkerIn =
  | { type: 'init'; canvas: OffscreenCanvas; data: Particles; options: LiteOptions }
  | { type: 'call'; method: Method; args: number[] }
  | { type: 'dispose' }

export type LiteWorkerOut = { type: 'ready' } | { type: 'failed' }

const post = (m: LiteWorkerOut) => (self as unknown as Worker).postMessage(m)
let renderer: LiteRenderer | null = null

self.onmessage = (e: MessageEvent<LiteWorkerIn>) => {
  const msg = e.data
  if (msg.type === 'init') {
    renderer = createLiteRenderer(msg.canvas, msg.data, msg.options, () => post({ type: 'ready' }))
    if (!renderer) post({ type: 'failed' })
  } else if (msg.type === 'call') {
    ;(renderer?.[msg.method] as ((...args: number[]) => void) | undefined)?.(...msg.args)
  } else {
    renderer?.dispose()
    renderer = null
  }
}
