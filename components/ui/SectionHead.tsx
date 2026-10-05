// One section header for every home scene: index, title, an optional aside on the right, and a hairline.
export function SectionHead({ index, title, aside }: { index: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-2 border-b border-line pb-4 sm:mb-12 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 md:mb-16">
      <h2 className="flex items-baseline gap-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">
        <span className="text-accent">{index}</span>
        <span className="text-text">{title}</span>
      </h2>
      {aside && <div className="sm:text-right font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{aside}</div>}
    </div>
  )
}
