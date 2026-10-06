"use client"
import type { SweepPoint } from './useMeterWorker'

const PAD = { l: 34, r: 10, t: 10, b: 24 }
const VW = 520
const VH = 220

// Offline curve (from training, many samples per level) vs the curve this
// browser just measured. If they disagree, the page is wrong, and it shows.
export function SweepChart({ offline, live, label, offlineN }: { offline: number[]; live: SweepPoint[]; label: string; offlineN: number }) {
  const x = (l: number) => PAD.l + l * (VW - PAD.l - PAD.r)
  const y = (a: number) => PAD.t + (1 - a) * (VH - PAD.t - PAD.b)
  const off = offline.map((a, i) => `${x(i / (offline.length - 1))},${y(a)}`).join(' ')
  const liv = live.map((p) => `${x(p.level)},${y(p.exact)}`).join(' ')

  return (
    <figure>
      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-auto" role="img" aria-label={`Exact-match accuracy as ${label} increases. Offline curve versus ${live.length} points measured in this browser.`}>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1={PAD.l} x2={VW - PAD.r} y1={y(g)} y2={y(g)} className="stroke-line" />
            <text x={PAD.l - 6} y={y(g)} textAnchor="end" dominantBaseline="central" fontSize={10} className="fill-muted font-mono">
              {g * 100}%
            </text>
          </g>
        ))}
        {[0, 0.5, 1].map((g) => (
          <text key={g} x={x(g)} y={VH - 6} textAnchor="middle" fontSize={10} className="fill-muted font-mono">
            {label} {g * 100}%
          </text>
        ))}
        <polyline points={off} fill="none" className="stroke-muted" strokeWidth={1.5} strokeDasharray="4 4" />
        {offline.map((a, i) => (
          <circle key={i} cx={x(i / (offline.length - 1))} cy={y(a)} r={2} className="fill-muted" />
        ))}
        {live.length > 1 && <polyline points={liv} fill="none" className="stroke-accent" strokeWidth={2} />}
        {live.map((p) => (
          <circle key={p.level} cx={x(p.level)} cy={y(p.exact)} r={3.5} className="fill-accent" />
        ))}
      </svg>
      <figcaption className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-widest text-muted">
        <span><span className="inline-block w-4 border-t border-dashed border-muted align-middle mr-2" />Offline · {offlineN} samples per level</span>
        <span><span className="inline-block w-4 border-t-2 border-accent align-middle mr-2" />Your device · {live[0]?.n ?? 24} samples per level</span>
      </figcaption>
    </figure>
  )
}
