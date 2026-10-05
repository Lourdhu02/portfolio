// Renders the synthetic training, validation and stress-sweep sets with the exact
// renderer the /lab page uses (lib/lab/meter.ts), inside headless Chromium.
//
//   npm i --prefix /tmp/labgen playwright-core esbuild
//   NODE_PATH=/tmp/labgen/node_modules node scripts/lab/generate.mjs out/ [trainN]
//
// Writes <set>.u8 (N x 32 x 128 grayscale) and <set>.json (labels, specs).
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'
import os from 'os'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright-core')
const esbuild = require('esbuild')

const out = process.argv[2] ?? 'lab-data'
const trainN = Number(process.argv[3] ?? 160000)
fs.mkdirSync(out, { recursive: true })

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
const bundle = esbuild.buildSync({
  entryPoints: [path.join(root, 'lib/lab/meter.ts')],
  bundle: true, format: 'iife', globalName: 'Meter', write: false,
}).outputFiles[0].text

const browser = await chromium.launch({ executablePath: process.env.CHROME })

// job: { seed, n, sweep?: {key, level} }
async function renderChunk(page, job) {
  return page.evaluate(({ seed, n, sweep }) => {
    const M = window.Meter
    const r = M.rng(seed)
    const c = new OffscreenCanvas(M.W, M.H)
    const ctx = c.getContext('2d', { willReadFrequently: true })
    const px = new Uint8Array(n * M.IN_W * M.IN_H)
    const labels = []
    for (let i = 0; i < n; i++) {
      const spec = M.randomSpec(r)
      if (sweep) spec.stress = { ...M.NO_STRESS, [sweep.key]: sweep.level }
      px.set(M.toGray(M.renderMeter(ctx, spec)), i * M.IN_W * M.IN_H)
      labels.push(spec.text)
    }
    let s = ''
    for (let i = 0; i < px.length; i += 0x8000) s += String.fromCharCode.apply(null, px.subarray(i, i + 0x8000))
    return { b64: btoa(s), labels }
  }, job)
}

async function runSet(name, jobs) {
  if (fs.existsSync(path.join(out, `${name}.json`))) return console.log(`${name}: exists, skipped`)
  const workers = Math.max(1, os.cpus().length)
  const pages = await Promise.all(Array.from({ length: workers }, async () => {
    const p = await browser.newPage()
    await p.addScriptTag({ content: bundle })
    return p
  }))
  const results = new Array(jobs.length)
  let next = 0
  const t0 = Date.now()
  await Promise.all(pages.map(async (p) => {
    while (next < jobs.length) {
      const j = next++
      results[j] = await renderChunk(p, jobs[j])
      if (j % 20 === 0) process.stdout.write(`\r${name} ${j}/${jobs.length} ${((Date.now() - t0) / 1000).toFixed(0)}s`)
    }
  }))
  await Promise.all(pages.map((p) => p.close()))
  const bufs = results.map((r) => Buffer.from(r.b64, 'base64'))
  fs.writeFileSync(path.join(out, `${name}.u8`), Buffer.concat(bufs))
  const meta = jobs.flatMap((j, k) => results[k].labels.map((t) => ({ t, ...(j.sweep ?? {}) })))
  fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify(meta))
  console.log(`\n${name}: ${meta.length} samples`)
}

const chunk = 500
const train = Array.from({ length: Math.ceil(trainN / chunk) }, (_, i) => ({ seed: 1_000_003 * (i + 1), n: chunk }))
const val = Array.from({ length: 10 }, (_, i) => ({ seed: 97_000_001 + i, n: chunk }))
const sweep = []
for (const key of ['blur', 'noise', 'tilt', 'glare', 'fade', 'dirt'])
  for (let l = 0; l <= 10; l++) sweep.push({ seed: 55_000_000 + l * 131 + key.length * 7919, n: 300, sweep: { key, level: l / 10 } })

await runSet('val', val)
await runSet('sweep', sweep)
await runSet('train', train)
await browser.close()
