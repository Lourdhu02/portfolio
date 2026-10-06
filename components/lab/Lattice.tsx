"use client"
import type { ReadResult } from '@/lib/lab/worker'

const CELL = 18
const LABEL_W = 22

// The CTC output as a T x K grid: each column is one frame (a 16 px slice of the
// meter), each row a class. Brightness is probability; the line is the greedy path.
export function Lattice({
  result,
  alphabet,
  hover,
  onHover,
}: {
  result: ReadResult
  alphabet: string
  hover: number | null
  onHover: (t: number | null) => void
}) {
  const { probs, T, K, path } = result
  const rows = ['ε', ...alphabet.split('')]
  const w = LABEL_W + T * CELL
  const h = K * CELL
  const pts = path.map((k, t) => `${LABEL_W + t * CELL + CELL / 2},${k * CELL + CELL / 2}`).join(' ')

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-auto select-none"
      role="img"
      aria-label={`CTC probability grid, ${T} frames by ${K} classes. Greedy path reads ${result.text || 'nothing'}.`}
      onMouseLeave={() => onHover(null)}
    >
      {rows.map((r, k) => (
        <text
          key={r}
          x={LABEL_W - 7}
          y={k * CELL + CELL / 2}
          textAnchor="end"
          dominantBaseline="central"
          className="fill-muted font-mono"
          fontSize={10}
        >
          {r}
        </text>
      ))}
      {Array.from({ length: T }, (_, t) => (
        <g key={t} onMouseEnter={() => onHover(t)} onFocus={() => onHover(t)}>
          <rect x={LABEL_W + t * CELL} y={0} width={CELL} height={h} className={hover === t ? 'fill-detect/10' : 'fill-transparent'} />
          {rows.map((_, k) => {
            const p = probs[t * K + k]
            if (p < 0.02) return null
            const blank = k === 0
            return (
              <rect
                key={k}
                x={LABEL_W + t * CELL + 2}
                y={k * CELL + 2}
                width={CELL - 4}
                height={CELL - 4}
                rx={2}
                className={blank ? 'fill-muted' : 'fill-detect'}
                opacity={blank ? p * 0.35 : 0.15 + p * 0.85}
              />
            )
          })}
        </g>
      ))}
      <polyline points={pts} fill="none" className="stroke-accent" strokeWidth={1.25} strokeLinejoin="round" opacity={0.85} pointerEvents="none" />
      {path.map((k, t) =>
        k === 0 ? null : (
          <circle key={t} cx={LABEL_W + t * CELL + CELL / 2} cy={k * CELL + CELL / 2} r={2.6} className="fill-accent" pointerEvents="none" />
        ),
      )}
    </svg>
  )
}

// Frame-by-frame argmax, then the two CTC rules: merge repeats, drop blanks
export function CollapseStrip({ result, alphabet, hover }: { result: ReadResult; alphabet: string; hover: number | null }) {
  const sym = (k: number) => (k === 0 ? '·' : alphabet[k - 1])
  return (
    <div className="font-mono text-[11px] leading-none">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${result.T}, minmax(0, 1fr))` }}>
        {result.path.map((k, t) => {
          const repeat = t > 0 && k !== 0 && result.path[t - 1] === k
          return (
            <span
              key={t}
              className={`text-center py-1.5 border-r border-line/60 last:border-r-0 ${
                hover === t ? 'bg-detect/15' : ''
              } ${k === 0 ? 'text-muted/50' : repeat ? 'text-muted line-through decoration-accent/70' : 'text-detect'}`}
            >
              {sym(k)}
            </span>
          )
        })}
      </div>
    </div>
  )
}
