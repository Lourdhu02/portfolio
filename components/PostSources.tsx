import { METRICS, PREPRINT_PAGES, type Metric } from '@/content/truth'
import { Receipt } from './ui/Receipt'
const groups: Record<string, Metric[]> = {
  'achilles-first-principles': Object.values(METRICS.achilles),
  'ctc-blank-frame-bug': [METRICS.meterOcr.readingAccuracy, METRICS.meterOcr.regressionTests],
  'tensorrt-uint8-transpose': [
    METRICS.meterOcr.classifierCompute,
    METRICS.meterOcr.throughput,
    METRICS.meterOcr.p50AtLoad,
    METRICS.meterOcr.sustainedL4,
  ],
  echome: Object.values(METRICS.echome),
  'svtrv2-ard': Object.values(METRICS.svtrv2),
  finsentinel: Object.values(METRICS.finSentinel),
  'no-final-save': [PREPRINT_PAGES],
}
export function PostSources({ slug }: { slug: string }) {
  return (
    <aside className="sources">
      <h2>Measurements & sources</h2>
      {(groups[slug] || []).map((m) => (
        <div key={m.label}>
          <p>{m.label}</p>
          <Receipt metric={m} />
        </div>
      ))}
    </aside>
  )
}
