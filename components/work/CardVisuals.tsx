import { METRICS, show } from '@/content/truth'

// Static SVG compositions for the home work cards. Pure markup, no client JS; the only motion is
// CSS keyframes in app/globals.css (wc-*), all gated behind prefers-reduced-motion.

const ocr = METRICS.meterOcr

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
          <div className="flex justify-between"><span>End-to-end p50</span><span>serverless → GPU</span></div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 bg-muted/30" />
              <span className="w-16 text-right">{show(ocr.p50, 'before')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1"><div className="h-1.5 bg-accent wc-grow-r" style={{ width: `${(ocr.p50.value / (ocr.p50.before ?? ocr.p50.value)) * 100}%` }} /></div>
              <span className="w-16 text-right text-text">{show(ocr.p50)}</span>
            </div>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-4 border-t border-line pt-5">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-muted">Bad photos refused</dt>
            <dd className="font-display text-3xl text-success">{show(ocr.invalidDetection)}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-muted">Reading acc.</dt>
            <dd className="font-display text-3xl text-text">{show(ocr.readingAccuracy)}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-muted">One L4</dt>
            <dd className="font-display text-3xl text-text">{ocr.sustainedL4.value}<span className="text-lg text-muted">/s</span></dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* SVTRv2-ARD: word crops routed into resize bins by a learned policy  */
/* ------------------------------------------------------------------ */

export function SvtrVisual() {
  // Crops of different aspect ratios on the left, SVTRv2's multi-size resize bins on the right.
  // The learned router picks a bin per crop instead of a fixed aspect-ratio rule.
  const crops = [
    { w: 22, label: 'EXIT' },
    { w: 44, label: 'KWH' },
    { w: 62, label: 'METER' },
    { w: 84, label: 'READING' },
  ]
  const bins = [
    { w: 28, h: 28 },
    { w: 44, h: 22 },
    { w: 54, h: 19 },
    { w: 64, h: 16 },
  ]
  const route = [0, 1, 3, 2] // crop i goes to bin route[i]; one crosses over, which is the point of learning it
  const cy = (i: number) => 22 + i * 32
  return (
    <div className="absolute inset-0 flex flex-col p-5 lg:p-6">
      <div className="relative flex-1 min-h-0">
        <svg viewBox="0 0 220 140" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <text x="4" y="6" className="fill-muted font-mono" fontSize="6" letterSpacing="1">CROPS</text>
          <text x="216" y="6" textAnchor="end" className="fill-detect font-mono" fontSize="6" letterSpacing="1">RESIZE BINS</text>
          {crops.map((c, i) => {
            const j = route[i]
            const by = cy(j)
            const crossed = j !== i
            return (
              <g key={c.label}>
                <path d={`M${4 + c.w + 2},${cy(i)} C120,${cy(i)} 120,${by} ${216 - bins[j].w - 2},${by}`} fill="none"
                  className={crossed ? 'stroke-detect' : 'stroke-text/20'} strokeWidth={crossed ? 1.1 : 0.7} strokeDasharray={crossed ? undefined : '2 2'} />
                <rect x="4" y={cy(i) - 7} width={c.w} height="14" rx="1.5" className="fill-raised stroke-line" strokeWidth="0.6" />
                <text x={4 + c.w / 2} y={cy(i) + 2.2} textAnchor="middle" className="fill-text/80 font-mono" fontSize="6">{c.label}</text>
              </g>
            )
          })}
          {bins.map((b, j) => (
            <rect key={j} x={216 - b.w} y={cy(j) - b.h / 2} width={b.w} height={b.h} rx="1.5"
              className={route.indexOf(j) !== j ? 'fill-detect/15 stroke-detect' : 'fill-[#0a0b0e] stroke-text/25'} strokeWidth="0.8" />
          ))}
        </svg>
      </div>
      <div className="mt-5 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted">
        <span>Tests passing</span>
        <span className="text-text">{METRICS.svtrv2.tests.value} / {METRICS.svtrv2.tests.value} · served model unchanged</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* ECHOME: three memory tiers, twelve recall scenarios                 */
/* ------------------------------------------------------------------ */

export function EchomeVisual() {
  // memoryRecall's context records 11 of 12 scenarios; the dots draw that
  const facts = 12
  const recalled = Math.round((METRICS.echome.memoryRecall.value / 100) * facts)
  const missed = 4 // which scenario the illustration shows as missed
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
            // Spread scenarios over the three rings, offset so none sits on a ring label at 12 o'clock
            const a = ((i + 0.5) / facts) * Math.PI * 2 - Math.PI / 2
            const ring = tiers[i % 3].r
            const hit = recalled === facts || i !== missed
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
        <span>Multi-session recall</span>
        <span className="text-text">{recalled} / {facts} scenarios</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* FinSentinelAI: retrieved candidates rescored by a cross-encoder     */
/* ------------------------------------------------------------------ */

export function FinSentinelVisual() {
  // Illustrative document ids: vector-search order on the left, cross-encoder order on the right
  const retrieved = ['STMT-0218', 'INV-0412', 'GST-0091', 'PO-0733', 'INV-0388']
  const reranked = ['INV-0412', 'INV-0388', 'STMT-0218', 'GST-0091', 'PO-0733']
  const y = (i: number) => 26 + i * 20
  return (
    <div className="absolute inset-0 flex flex-col p-5 lg:p-6">
      <div className="relative flex-1 min-h-0">
        <svg viewBox="0 0 220 132" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <text x="4" y="10" className="fill-muted font-mono" fontSize="6" letterSpacing="1">CHROMADB · user_id</text>
          <text x="216" y="10" textAnchor="end" className="fill-accent font-mono" fontSize="6" letterSpacing="1">CROSS-ENCODER</text>
          {retrieved.map((id, i) => {
            const j = reranked.indexOf(id)
            return (
              <path key={`l${id}`} d={`M74,${y(i)} C110,${y(i)} 110,${y(j)} 146,${y(j)}`} fill="none"
                className={j === 0 ? 'stroke-accent' : 'stroke-text/15'} strokeWidth={j === 0 ? 1.1 : 0.7} />
            )
          })}
          {retrieved.map((id, i) => (
            <g key={`r${id}`}>
              <rect x="4" y={y(i) - 6} width="70" height="12" rx="1" className="fill-raised" />
              <text x="9" y={y(i) + 2} className="fill-text/70 font-mono" fontSize="6">{i + 1}  {id}</text>
            </g>
          ))}
          {reranked.map((id, j) => (
            <g key={`k${id}`}>
              <rect x="146" y={y(j) - 6} width="70" height="12" rx="1" className={j === 0 ? 'fill-accent' : 'fill-raised'} />
              <text x="151" y={y(j) + 2} className={j === 0 ? 'fill-bg font-mono' : 'fill-text font-mono'} fontSize="6" fontWeight={j === 0 ? 700 : 400}>{j + 1}  {id}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-5 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted">
        <span>Local Ollama</span>
        <span className="text-text">0 external API calls</span>
      </div>
    </div>
  )
}
