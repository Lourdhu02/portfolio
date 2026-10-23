import type { Metric, Source } from '@/content/truth'
import { withBase } from '@/lib/path'
export function SourceLink({ source }: { source: Source }) {
  return source.url ? (
    <a
      href={withBase(source.url)}
      title={`${source.name}: ${source.path}`}
      target="_blank"
      rel="noreferrer"
    >
      source ↗
    </a>
  ) : (
    <details>
      <summary>source · private</summary>
      <p>
        {source.name}/{source.path}. Recorded in a private repository.
      </p>
    </details>
  )
}
export function Receipt({
  metric,
  className = '',
  compact = false,
}: {
  metric: Metric
  className?: string
  compact?: boolean
}) {
  return (
    <div className={`receipt ${className}`}>
      {!compact && <p>{metric.context}</p>}
      <SourceLink source={metric.source} />
    </div>
  )
}
