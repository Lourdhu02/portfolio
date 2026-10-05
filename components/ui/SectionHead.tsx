// One section header for every home scene: index, title, an optional aside on the right, and a hairline.
export function SectionHead({ index, title, aside }: { index: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-12 flex items-baseline justify-between gap-6 border-b border-line pb-4 md:mb-16">
      <h2 className="flex items-baseline gap-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">
        <span className="text-accent">{index}</span>
        <span className="text-text">{title}</span>
      </h2>
      {aside && <div className="text-right font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{aside}</div>}
    </div>
  )
}
