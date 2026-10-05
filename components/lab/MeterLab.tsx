"use client"
import { useEffect, useRef, useState } from 'react'
import { ALPHABET, SCHEMES, STRESS_KEYS, NO_STRESS, IN_W, IN_H, W, H, randomText, type MeterSpec, type Stress, type StressKey } from '@/lib/lab/meter'
import card from '@/lib/lab/model-card.json'
import { useMeterWorker, percentile } from './useMeterWorker'
import { Lattice, CollapseStrip } from './Lattice'
import { StressSlider, interp } from './StressSlider'
import { SweepChart } from './SweepChart'

const STRESS_COPY: Record<StressKey, { label: string; hint: string }> = {
  blur: { label: 'Blur', hint: 'Shaky hands, dirty lens, autofocus miss' },
  noise: { label: 'Noise', hint: 'Low light, cheap sensor, high ISO' },
  tilt: { label: 'Tilt', hint: 'Off-axis shot; rotation and shear' },
  glare: { label: 'Glare', hint: 'Sun or flash on the meter glass' },
  fade: { label: 'Fade', hint: 'Low contrast, wrong exposure, shadow' },
  dirt: { label: 'Dirt', hint: 'Grime, scratches, a spider in the housing' },
}

const curves = card.curves as Record<StressKey, number[]>
const fmt = (n: number) => n.toLocaleString('en-US')

function sanitize(s: string) {
  let out = ''
  let dot = false
  for (const c of s) {
    if (c >= '0' && c <= '9') out += c
    else if (c === '.' && !dot && out.length) {
      out += c
      dot = true
    }
  }
  return out.slice(0, 10)
}

export function MeterLab() {
  const { ready, error, result, timings, read, sweep, runSweep, cancelSweep } = useMeterWorker()
  const [spec, setSpec] = useState<MeterSpec>({ text: '04827.1', seed: 20261005, scheme: 0, stress: { ...NO_STRESS } })
  const [hover, setHover] = useState<number | null>(null)
  const [sweepKey, setSweepKey] = useState<StressKey>('blur')
  const specCanvas = useRef<HTMLCanvasElement>(null)
  const inputCanvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (spec.text) read(spec)
  }, [spec, read])

  useEffect(() => {
    if (!result) return
    specCanvas.current?.getContext('2d')?.putImageData(result.image, 0, 0)
    const ctx = inputCanvas.current?.getContext('2d')
    if (ctx) {
      const img = ctx.createImageData(IN_W, IN_H)
      for (let i = 0; i < result.gray.length; i++) {
        const g = result.gray[i]
        img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = g
        img.data[i * 4 + 3] = 255
      }
      ctx.putImageData(img, 0, 0)
    }
  }, [result])

  const setStress = (k: StressKey, v: number) => setSpec((s) => ({ ...s, stress: { ...s.stress, [k]: v } }))
  const newMeter = () => {
    const r = Math.random
    setSpec((s) => ({ ...s, text: randomText(r), seed: Math.floor(r() * 2 ** 31), scheme: Math.floor(r() * SCHEMES.length) }))
  }
  const reshoot = () => setSpec((s) => ({ ...s, seed: Math.floor(Math.random() * 2 ** 31) }))
  const nearBreak = () => {
    // Put every slider where the offline curve says accuracy is ~85%
    const st = {} as Stress
    for (const k of STRESS_KEYS) {
      let v = 0
      for (let x = 0; x <= 1.0001; x += 0.01) if (interp(curves[k], x) >= 0.85) v = x
      st[k] = Math.round(v * 0.35 * 100) / 100
    }
    setSpec((s) => ({ ...s, stress: st }))
  }

  const correct = result && result.text === spec.text
  const digits = spec.text.replace('.', '').length
  const outOfRange = digits < 4 || digits > 8
  const p50 = percentile(timings, 0.5)
  const p95 = percentile(timings, 0.95)
  const hoverBand = hover !== null && result ? { left: `${(hover * (W / result.T) * 100) / W}%`, width: `${100 / result.T}%` } : null
  const sweepPoints = sweep && sweep.key === sweepKey ? sweep.points : []
  const threads = ready ? navigator.hardwareConcurrency : 0

  return (
    <div className="space-y-6">
      {/* Instrument */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section aria-label="Specimen" className="lg:col-span-7 bg-surface border border-line p-5 md:p-6" style={{ borderBottomRightRadius: 14 }}>
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-muted mb-4">
            <span><span className="text-detect">Specimen</span> · {SCHEMES[spec.scheme].name} · seed {spec.seed}</span>
            <span>{W}×{H} rgb</span>
          </div>
          <div className="relative">
            <canvas ref={specCanvas} width={W} height={H} className="block w-full h-auto bg-bg" aria-label={`Synthetic meter showing ${spec.text}`} role="img" />
            {hoverBand && <div aria-hidden="true" className="absolute inset-y-0 border-x border-detect bg-detect/15 pointer-events-none" style={hoverBand} />}
            {['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'].map((c) => (
              <span key={c} aria-hidden="true" className={`absolute w-3 h-3 border-detect ${c}`} />
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 items-start">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">What the model sees · {IN_W}×{IN_H}</div>
              <canvas ref={inputCanvas} width={IN_W} height={IN_H} className="block w-64 max-w-full h-auto border border-line" style={{ imageRendering: 'pixelated' }} aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Reading on the meter</span>
                <input
                  value={spec.text}
                  onChange={(e) => setSpec((s) => ({ ...s, text: sanitize(e.target.value) }))}
                  inputMode="decimal"
                  className="mt-1 w-full bg-bg border border-line focus:border-detect outline-none px-3 py-2 font-mono text-lg tracking-[0.2em] text-text"
                  aria-describedby="reading-hint"
                />
              </label>
              <p id="reading-hint" className={`font-mono text-[10px] ${outOfRange ? 'text-accent' : 'text-muted/70'}`}>
                {outOfRange ? 'Outside the training range (4 to 8 digits). Expect it to struggle.' : 'Type any reading. Digits and one decimal point.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={newMeter} className="px-3 py-1.5 border border-detect text-detect bg-detect/10 hover:bg-detect/20 font-mono text-[11px] uppercase tracking-wider transition-colors">New meter</button>
                <button onClick={reshoot} className="px-3 py-1.5 border border-line hover:border-muted text-text font-mono text-[11px] uppercase tracking-wider transition-colors">Reshoot</button>
                {SCHEMES.map((s, i) => (
                  <button
                    key={s.name}
                    onClick={() => setSpec((p) => ({ ...p, scheme: i }))}
                    aria-pressed={spec.scheme === i}
                    title={s.name}
                    className={`w-7 h-7 border transition-colors ${spec.scheme === i ? 'border-text' : 'border-line hover:border-muted'}`}
                    style={{ background: `rgb(${s.bg.join(',')})` }}
                  >
                    <span className="sr-only">{s.name}</span>
                    <span aria-hidden="true" className="block mx-auto w-2.5 h-2.5" style={{ background: `rgb(${s.on.join(',')})` }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Prediction" aria-live="polite" className="lg:col-span-5 bg-surface border border-line p-5 md:p-6 flex flex-col" style={{ borderBottomRightRadius: 14 }}>
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted mb-4">
            <span className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${error ? 'bg-accent' : ready ? 'bg-success' : 'bg-muted animate-pulse'}`} />
              {error ? 'Model failed to load' : ready ? 'Model live on your device' : 'Loading model'}
            </span>
            <span>greedy ctc</span>
          </div>

          <div className="min-h-[5.5rem] flex items-end gap-[0.06em] font-display text-6xl md:text-7xl leading-none tracking-wide">
            {result?.chars.length ? (
              result.chars.map((c, i) => (
                <span key={i} className="relative inline-flex flex-col items-center">
                  <span className={c.conf > 0.9 ? 'text-text' : c.conf > 0.6 ? 'text-detect' : 'text-accent'}>{c.ch}</span>
                  <span className="mt-2 h-[3px] w-full bg-line overflow-hidden" title={`${(c.conf * 100).toFixed(1)}%`}>
                    <span className="block h-full bg-detect" style={{ width: `${c.conf * 100}%` }} />
                  </span>
                </span>
              ))
            ) : (
              <span className="text-muted/40">{result ? '∅' : '—'}</span>
            )}
          </div>

          <div className="mt-5 font-mono text-xs space-y-1.5">
            <div className="flex justify-between"><span className="text-muted">Ground truth</span><span>{spec.text}</span></div>
            <div className="flex justify-between">
              <span className="text-muted">Verdict</span>
              <span className={correct ? 'text-success' : 'text-accent'}>{!result ? '—' : correct ? 'Exact match' : 'Misread'}</span>
            </div>
            <div className="flex justify-between"><span className="text-muted">Sequence confidence</span><span>{result ? `${(result.confidence * 100).toFixed(1)}%` : '—'}</span></div>
          </div>

          <dl className="mt-auto pt-6 grid grid-cols-2 gap-px bg-line border border-line font-mono">
            {[
              ['Forward p50', timings.length ? `${p50.toFixed(1)} ms` : '—'],
              ['Forward p95', timings.length ? `${p95.toFixed(1)} ms` : '—'],
              ['Runs measured', fmt(timings.length)],
              ['Weights', ready ? `${(ready.bytes / 1024).toFixed(0)} KB int8` : '—'],
              ['Parameters', fmt(card.params)],
              ['Compute', `${(card.macs / 1e6).toFixed(1)}M MACs`],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface p-3">
                <dt className="text-[10px] uppercase tracking-widest text-muted">{k}</dt>
                <dd className="text-lg text-text mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 font-mono text-[10px] text-muted/70">
            Timed with performance.now() around the forward pass, in a Web Worker{threads ? ` on your ${threads}-thread device` : ''}. Hand-written JS: no WASM, no WebGL, no server.
          </p>
        </section>
      </div>

      {/* CTC lattice */}
      <section aria-label="CTC decoding" className="bg-surface border border-line p-5 md:p-6" style={{ borderBottomRightRadius: 14 }}>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-detect">How it reads · CTC over {result?.T ?? card.frames} frames</h2>
          <span className="font-mono text-[10px] text-muted">Hover a column to see the slice of the meter it looks at</span>
        </div>
        {result ? (
          <div>
            <div>
              <Lattice result={result} alphabet={ALPHABET} hover={hover} onHover={setHover} />
              <div className="mt-3" style={{ paddingLeft: `${(22 / (22 + result.T * 18)) * 100}%` }}>
                <CollapseStrip result={result} alphabet={ALPHABET} hover={hover} />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-48 grid place-items-center font-mono text-xs text-muted">{error ?? 'Waiting for the first forward pass…'}</div>
        )}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[11px] text-muted leading-relaxed">
          <p><span className="text-text">1 · Every frame votes.</span> The network turns the image into {card.frames} columns and scores each one across the 11 symbols plus a blank (ε).</p>
          <p><span className="text-text">2 · Repeats merge.</span> Neighbouring frames with the same symbol are one character (struck through above). That is why “77” needs a blank between the sevens.</p>
          <p><span className="text-text">3 · Blanks drop.</span> What is left is the reading. No character boxes, no segmentation: the same trick my production meter reader uses.</p>
        </div>
      </section>

      {/* Stress */}
      <section aria-label="Stress the meter" className="bg-surface border border-line p-5 md:p-6" style={{ borderBottomRightRadius: 14 }}>
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
          <div>
            <h2 className="font-display text-3xl uppercase tracking-wide">Break it</h2>
            <p className="font-mono text-[11px] text-muted mt-1 max-w-xl">Each slider sits on the model&apos;s measured exact-match curve for that stress alone. Combine them and watch the guesses get worse, then wrong.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={nearBreak} className="px-3 py-1.5 border border-accent text-accent bg-accent/10 hover:bg-accent/20 font-mono text-[11px] uppercase tracking-wider transition-colors">Near the edge</button>
            <button onClick={() => setSpec((s) => ({ ...s, stress: { ...NO_STRESS } }))} className="px-3 py-1.5 border border-line hover:border-muted font-mono text-[11px] uppercase tracking-wider transition-colors">Clean</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          {STRESS_KEYS.map((k) => (
            <StressSlider key={k} label={STRESS_COPY[k].label} hint={STRESS_COPY[k].hint} value={spec.stress[k]} curve={curves[k]} onChange={(v) => setStress(k, v)} />
          ))}
        </div>
      </section>

      {/* Run it yourself */}
      <section aria-label="Measure it yourself" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">Measure before you claim</div>
          <h2 className="font-display text-4xl md:text-5xl uppercase leading-[0.9] mb-4">Don&apos;t trust my curves</h2>
          <p className="text-sm text-text/80 leading-relaxed mb-5">
            The dashed curve is what I measured offline. Press run and your browser renders fresh meters it has never seen, reads them, and plots its own curve on top. If mine were tuned to look good, the two would disagree.
          </p>
          <div className="flex flex-wrap gap-2 mb-4" role="radiogroup" aria-label="Stress to sweep">
            {STRESS_KEYS.map((k) => (
              <button
                key={k}
                role="radio"
                aria-checked={sweepKey === k}
                onClick={() => setSweepKey(k)}
                className={`px-2.5 py-1 border font-mono text-[11px] uppercase tracking-wider transition-colors ${sweepKey === k ? 'border-text text-text' : 'border-line text-muted hover:border-muted'}`}
              >
                {STRESS_COPY[k].label}
              </button>
            ))}
          </div>
          {sweep?.running ? (
            <button onClick={cancelSweep} className="px-4 py-2 border border-line hover:border-muted font-mono text-xs uppercase tracking-wider">
              Stop · {sweep.points.length}/11 levels
            </button>
          ) : (
            <button onClick={() => runSweep(sweepKey)} disabled={!ready} className="px-4 py-2 border border-accent text-accent bg-accent/10 hover:bg-accent/20 font-mono text-xs uppercase tracking-wider disabled:opacity-40">
              Run 264 reads on this device →
            </button>
          )}
        </div>
        <div className="lg:col-span-8 bg-surface border border-line p-5 md:p-6" style={{ borderBottomRightRadius: 14 }}>
          <SweepChart offline={curves[sweepKey]} live={sweepPoints} label={STRESS_COPY[sweepKey].label} offlineN={card.sweepSamplesPerPoint} />
        </div>
      </section>
    </div>
  )
}
