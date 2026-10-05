import { TRUTH } from '@/content/truth'

// Static SVG compositions for the home work cards. Pure markup, no client JS; the only motion is
// CSS keyframes in app/globals.css (wc-*), all gated behind prefers-reduced-motion.

const f = TRUTH.metrics.flagship

/* ------------------------------------------------------------------ */
/* Meter OCR: a meter LCD under a detection box, plus the model chain  */
/* ------------------------------------------------------------------ */

// Seven-segment layout: a top, b top-right, c bottom-right, d bottom, e bottom-left, f top-left, g middle
const SEGMENTS: Record<string, string> = {
  '0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg',
  '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg',
}

function Digit({ ch, x, y, w = 34, h = 60 }: { ch: string; x: number; y: number; w?: number; h?: number }) {
  const on = SEGMENTS[ch] ?? ''
  const t = 6 // segment thickness
  const half = h / 2
  const seg = (id: string, d: string) => (
    <path key={id} d={d} className={on.includes(id) ? 'fill-text' : 'fill-text/[0.06]'} />
  )
  // Horizontal and vertical bars with bevelled ends, slanted slightly like a real LCD
  const hBar = (yy: number) => `M${t / 2 + 1},${yy} l${t / 2},${-t / 2} h${w - 2 * t - 2} l${t / 2},${t / 2} l${-t / 2},${t / 2} h${-(w - 2 * t - 2)} z`
  const vBar = (xx: number, yy: number) => `M${xx},${yy + 1} l${t / 2},${t / 2} v${half - 2 * t + 1} l${-t / 2},${t / 2} l${-t / 2},${-t / 2} v${-(half - 2 * t + 1)} z`
  return (
    <g transform={`translate(${x} ${y}) skewX(-6)`}>
      {seg('a', hBar(t / 2))}
      {seg('g', hBar(half))}
      {seg('d', hBar(h - t / 2))}
      {seg('f', vBar(t / 2, t / 2))}
      {seg('b', vBar(w - t / 2, t / 2))}
      {seg('e', vBar(t / 2, half))}
      {seg('c', vBar(w - t / 2, half))}
    </g>
  )
}

const STAGES = [
  { label: 'Presence', model: 'MobileViTv2' },
  { label: 'Dial', model: 'YOLO26n-OBB' },
  { label: 'Type', model: 'MobileViTv2' },
  { label: 'Read', model: 'SVTRv2 + CTC' },
]

export function MeterOcrVisual() {
  const reading = '04127'
  return (
    <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-[1.25fr_1fr]">
      {/* Left: the "camera frame" */}
      <div className="relative overflow-hidden border-b md:border-b-0 md:border-r border-line bg-[radial-gradient(80%_70%_at_45%_45%,#15151c_0%,#08080b_100%)]">
        <div className="absolute inset-0 wc-grid opacity-60" />
        <svg viewBox="0 0 400 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          {/* meter body */}
          <rect x="70" y="40" width="260" height="160" rx="22" className="fill-[#101016] stroke-line" strokeWidth="2" />
          <circle cx="92" cy="62" r="4" className="fill-line" />
          <circle cx="308" cy="62" r="4" className="fill-line" />
          <circle cx="92" cy="178" r="4" className="fill-line" />
          <circle cx="308" cy="178" r="4" className="fill-line" />
          <text x="302" y="76" textAnchor="end" className="fill-muted font-mono" fontSize="8" letterSpacing="2">kWh · 1-PHASE</text>
          {/* LCD */}
          <rect x="104" y="88" width="192" height="80" rx="6" className="fill-[#0b0d0c]" />
          {reading.split('').map((ch, i) => (
            <Digit key={i} ch={ch} x={116 + i * 34} y={98} w={26} h={52} />
          ))}
          <rect x="282" y="148" width="5" height="5" className="fill-text" />
          {/* detection box with corner brackets */}
          <g className="stroke-detect" strokeWidth="2" fill="none">
            <rect x="98" y="82" width="204" height="92" className="stroke-detect/40" strokeDasharray="3 4" strokeWidth="1" />
            <path d="M98,96 V82 H112 M288,82 H302 V96 M302,160 V174 H288 M112,174 H98 V160" />
          </g>
          <rect x="98" y="66" width="74" height="14" className="fill-detect" />
          <text x="103" y="76" className="fill-bg font-mono" fontSize="8" fontWeight="700">DIAL · 0.98</text>
          {/* scanline */}
          <rect x="98" y="82" width="204" height="2" className="fill-detect/70 wc-scan" />
        </svg>
        <div className="absolute bottom-3 left-4 right-4 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted">
          <span>Field photo · synthetic</span>
          <span className="text-detect">Read → {reading}</span>
        </div>
      </div>

      {/* Right: the model chain and live numbers */}
      <div className="relative hidden md:flex flex-col justify-between p-6 lg:p-8">
        <ol className="space-y-0">
          {STAGES.map((s, i) => (
            <li key={s.label} className="relative flex items-center gap-4 py-2.5">
              <span className="relative z-10 grid h-6 w-6 place-items-center rounded-full border border-line bg-bg font-mono text-[10px] text-muted wc-node" style={{ animationDelay: `${i * 0.5}s` }}>
                {i + 1}
              </span>
              {i < STAGES.length - 1 && <span className="absolute left-3 top-[calc(50%+12px)] h-[calc(100%-24px)] w-px bg-line" />}
              <span className="font-mono text-xs uppercase tracking-widest text-text">{s.label}</span>
              <span className="ml-auto font-mono text-[10px] text-muted">{s.model}</span>
            </li>
          ))}
        </ol>
        <div className="space-y-3 font-mono text-[10px] uppercase tracking-widest text-muted">
          <div className="flex justify-between"><span>p50 latency</span><span>before → after</span></div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 bg-muted/30" />
              <span className="w-14 text-right">{f.latencyP50.before}ms</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1"><div className="h-1.5 bg-accent wc-grow-r" style={{ width: `${(f.latencyP50.after / f.latencyP50.before) * 100}%` }} /></div>
              <span className="w-14 text-right text-text">{f.latencyP50.after}ms</span>
            </div>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-4 border-t border-line pt-5">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-muted">Accuracy</dt>
            <dd className="font-display text-3xl text-success">{f.accuracy.after}%</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-muted">p50</dt>
            <dd className="font-display text-3xl text-text">{f.latencyP50.after}<span className="text-lg text-muted">ms</span></dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-muted">1× L4</dt>
            <dd className="font-display text-3xl text-text">{f.capacity1L4}<span className="text-lg text-muted">/s</span></dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* SVTRv2-ARD: an attention map and the memory it no longer needs      */
/* ------------------------------------------------------------------ */

export function SvtrVisual() {
  const n = 14
  const cells = []
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      // A local-attention band around the diagonal plus a couple of long-range hits, fixed so it renders the same everywhere
      const d = Math.abs(r - c)
      const band = Math.max(0, 1 - d / 3)
      const longRange = (r * 7 + c * 3) % 23 === 0 ? 0.55 : 0
      const v = Math.min(1, band + longRange)
      if (v > 0.04) cells.push({ r, c, v })
    }
  }
  const mem = f.svtrv2PeakMemoryGB
  const after = (mem.after / mem.before) * 100
  return (
    <div className="absolute inset-0 flex flex-col p-5 lg:p-6">
      <div className="relative flex-1 min-h-0">
        <svg viewBox={`0 0 ${n} ${n}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <rect width={n} height={n} className="fill-[#0a0b0e]" />
          {cells.map(({ r, c, v }) => (
            <rect key={`${r}-${c}`} x={c + 0.06} y={r + 0.06} width={0.88} height={0.88} className="fill-detect" opacity={0.12 + v * 0.88} />
          ))}
        </svg>
      </div>
      <div className="mt-5 space-y-2 font-mono text-[10px] uppercase tracking-widest text-muted">
        <div className="flex justify-between"><span>Peak VRAM</span><span className="text-text">{mem.before} → <span className="text-detect">{mem.after} GB</span></span></div>
        <div className="relative h-1.5 w-full bg-line">
          <div className="absolute inset-y-0 left-0 bg-muted/30" style={{ width: '100%' }} />
          <div className="absolute inset-y-0 left-0 bg-detect wc-grow" style={{ width: `${after}%` }} />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* ECHOME: three memory tiers, twelve planted facts                    */
/* ------------------------------------------------------------------ */

export function EchomeVisual() {
  const facts = 12
  const recalled = 11
  const missed = 4 // which planted fact the illustration shows as missed
  const tiers = [
    { r: 30, label: 'WORKING' },
    { r: 52, label: 'EPISODIC' },
    { r: 74, label: 'SEMANTIC' },
  ]
  return (
    <div className="absolute inset-0 flex flex-col p-5 lg:p-6">
      <div className="relative flex-1 min-h-0">
        <svg viewBox="-100 -90 200 180" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          {tiers.map((t, i) => (
            <g key={t.label}>
              <circle r={t.r} fill="none" className="stroke-text/15" strokeWidth="0.8" strokeDasharray={i === 2 ? '2 3' : undefined} />
              <text x={0} y={-t.r - 3} textAnchor="middle" className="fill-muted font-mono" fontSize="6" letterSpacing="1">{t.label}</text>
            </g>
          ))}
          {Array.from({ length: facts }).map((_, i) => {
            // Spread facts over the three rings, offset so none sits on a ring label at 12 o'clock
            const a = ((i + 0.5) / facts) * Math.PI * 2 - Math.PI / 2
            const ring = tiers[i % 3].r
            const hit = i !== missed
            const x = Math.cos(a) * ring
            const y = Math.sin(a) * ring
            return (
              <g key={i}>
                {hit && <line x1={0} y1={0} x2={x} y2={y} className="stroke-text/10" strokeWidth="0.6" />}
                <circle cx={x} cy={y} r={hit ? 2.8 : 2.6} className={hit ? 'fill-text' : 'fill-bg stroke-accent'} strokeWidth="1" />
                {!hit && <text x={x + 5} y={y + 2} className="fill-accent font-mono" fontSize="6">MISS</text>}
              </g>
            )
          })}
          <circle r="9" className="fill-accent" />
          <circle r="9" fill="none" className="stroke-accent/50 wc-ping" />
        </svg>
      </div>
      <div className="mt-5 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted">
        <span>Planted-fact recall</span>
        <span className="text-text">{recalled} / {facts}</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* FinSentinelAI: two rankings fused into one                          */
/* ------------------------------------------------------------------ */

export function FinSentinelVisual() {
  // Document ids as they appear in each ranking; the fused list is what reciprocal-rank fusion produces from them
  const bm25 = ['D-17', 'D-04', 'D-31', 'D-09', 'D-22']
  const dense = ['D-04', 'D-12', 'D-17', 'D-31', 'D-40']
  const fused = rrf([bm25, dense]).slice(0, 5)
  const row = 12
  const srcY = (li: number, i: number) => (li === 0 ? 16 : 88) + i * row
  const outY = (j: number) => 46 + j * 16
  return (
    <div className="absolute inset-0 flex flex-col p-5 lg:p-6">
      <div className="relative flex-1 min-h-0">
        <svg viewBox="0 0 220 152" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <text x="4" y="10" className="fill-muted font-mono" fontSize="6" letterSpacing="1">BM25</text>
          <text x="4" y="82" className="fill-muted font-mono" fontSize="6" letterSpacing="1">DENSE</text>
          <text x="216" y="36" textAnchor="end" className="fill-accent font-mono" fontSize="6" letterSpacing="1">FUSED · RRF</text>
          {[bm25, dense].map((list, li) =>
            list.map((id, i) => {
              const j = fused.indexOf(id)
              if (j < 0) return null
              const y1 = srcY(li, i) + 4.5
              const y2 = outY(j) + 5
              return (
                <path key={`${li}-${id}`} d={`M70,${y1} C110,${y1} 110,${y2} 146,${y2}`} fill="none"
                  className={j === 0 ? 'stroke-accent' : 'stroke-text/15'} strokeWidth={j === 0 ? 1.1 : 0.7} />
              )
            })
          )}
          {[bm25, dense].map((list, li) =>
            list.map((id, i) => (
              <g key={`${li}${id}`}>
                <rect x="4" y={srcY(li, i)} width="66" height="9" rx="1" className={fused.indexOf(id) === 0 ? 'fill-accent/20' : 'fill-raised'} />
                <text x="8" y={srcY(li, i) + 6.5} className="fill-text/70 font-mono" fontSize="5.5">{i + 1}  {id}</text>
              </g>
            ))
          )}
          {fused.map((id, j) => (
            <g key={`f${id}`}>
              <rect x="146" y={outY(j)} width="70" height="10" rx="1" className={j === 0 ? 'fill-accent' : 'fill-raised'} />
              <text x="151" y={outY(j) + 7} className={j === 0 ? 'fill-bg font-mono' : 'fill-text font-mono'} fontSize="6" fontWeight={j === 0 ? 700 : 400}>{j + 1}  {id}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-5 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted">
        <span>Hybrid retrieval</span>
        <span className="text-text">BM25 + dense → RRF</span>
      </div>
    </div>
  )
}

// Reciprocal-rank fusion with the usual k = 60
function rrf(lists: string[][], k = 60) {
  const score = new Map<string, number>()
  for (const list of lists) list.forEach((id, i) => score.set(id, (score.get(id) ?? 0) + 1 / (k + i + 1)))
  return [...score.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id)
}
