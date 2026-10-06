// Site background: an isometric cube lattice (tumbling blocks) drawn as one inline SVG
// pattern, so it follows the theme tokens and scrolls with the page. It exists so the glass
// panels have real detail to blur and bend; on a flat colour glass looks like nothing.
// The lattice fades out behind the hero name so the particles stay readable.
//
// Also defines the refraction filter that .glass uses on Chromium (see globals.css).

const A = 22 // cube edge in px
const W = 38 // tile width: 2 · A · cos 30°, rounded so tiles meet on whole pixels
const H = 66 // tile height: 3 · A

function cube(cx: number, cy: number) {
  const h = W / 2
  const top = `M${cx} ${cy - A}L${cx + h} ${cy - A / 2}L${cx} ${cy}L${cx - h} ${cy - A / 2}Z`
  const left = `M${cx - h} ${cy - A / 2}L${cx} ${cy}L${cx} ${cy + A}L${cx - h} ${cy + A / 2}Z`
  const right = `M${cx} ${cy}L${cx + h} ${cy - A / 2}L${cx + h} ${cy + A / 2}L${cx} ${cy + A}Z`
  return { top, left, right }
}

const CENTRES: [number, number][] = [[0, 0], [W, 0], [W / 2, H / 2], [0, H], [W, H]]
const cubes = CENTRES.map(([x, y]) => cube(x, y))

export function SitePattern() {
  return (
    <div aria-hidden="true" className="site-pattern pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="tumbling-blocks" width={W} height={H} patternUnits="userSpaceOnUse">
            {cubes.map((c, i) => (
              <g key={i}>
                <path d={c.top} className="pat-top" />
                <path d={c.left} className="pat-left" />
                <path d={c.right} className="pat-right" />
              </g>
            ))}
          </pattern>
          <filter id="glass-lens" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="2" seed="11" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="3" result="soft" />
            <feDisplacementMap in="SourceGraphic" in2="soft" scale="42" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#tumbling-blocks)" />
      </svg>
    </div>
  )
}
