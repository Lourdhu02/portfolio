"use client"

export function interp(curve: number[], v: number) {
  const x = Math.max(0, Math.min(1, v)) * (curve.length - 1)
  const i = Math.min(curve.length - 2, Math.floor(x))
  return curve[i] + (curve[i + 1] - curve[i]) * (x - i)
}

// A range input drawn over the model's measured accuracy curve for that stress,
// so the visitor can see where it is about to break before it does.
export function StressSlider({
  label,
  hint,
  value,
  curve,
  onChange,
}: {
  label: string
  hint: string
  value: number
  curve: number[]
  onChange: (v: number) => void
}) {
  const acc = interp(curve, value)
  const pts = curve.map((c, i) => `${(i / (curve.length - 1)) * 100},${(1 - c) * 28 + 2}`)
  const area = `0,30 ${pts.join(' ')} 100,30`
  const tone = acc > 0.9 ? 'text-success' : acc > 0.6 ? 'text-detect' : 'text-accent'

  return (
    <label className="block group">
      <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-widest mb-1.5">
        <span className="text-text">{label}</span>
        <span className="text-muted normal-case tracking-normal">
          {Math.round(value * 100)}% · <span className={tone}>{Math.round(acc * 100)}% exact</span>
        </span>
      </div>
      <div className="relative h-8">
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <polygon points={area} fill="rgba(45,226,230,0.08)" />
          <polyline points={pts.join(' ')} fill="none" stroke="rgba(45,226,230,0.55)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <line x1={value * 100} x2={value * 100} y1={0} y2={30} stroke="#FF4655" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-valuetext={`${Math.round(value * 100)} percent, model exact-match about ${Math.round(acc * 100)} percent`}
          className="lab-range absolute inset-0 w-full h-full"
        />
      </div>
      <div className="font-mono text-[10px] text-muted/70 mt-1">{hint}</div>
    </label>
  )
}
