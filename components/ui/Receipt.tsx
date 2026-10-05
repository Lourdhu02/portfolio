import type { Metric } from '@/content/truth'

/** The "how measured, where recorded" line printed under a number. */
export function Receipt({ metric, className = '' }: { metric: Metric; className?: string }) {
  const { context, source } = metric
  const file = source.path.split('/').pop()
  const label = `${source.name} · ${file}`
  return (
    <p className={`font-mono text-[11px] leading-relaxed text-muted/70 ${className}`}>
      {context}{' '}
      <span className="text-muted">
        Source:{' '}
        {source.url ? (
          <a href={source.url} title={source.path} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-2 hover:text-accent">
            {label}
          </a>
        ) : (
          <span title={source.path}>{label} (private repo)</span>
        )}
      </span>
    </p>
  )
}
