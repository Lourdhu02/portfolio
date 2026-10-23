import type { Metadata } from 'next'
import { MeterLab } from '@/components/lab/MeterLab'
import { LAB_MODEL as card, LAB_SOURCE } from '@/content/truth'
import { SourceLink } from '@/components/ui/Receipt'
import { withBase } from '@/lib/path'
import { siteAddress } from '@/lib/site'
export const metadata: Metadata = {
  title: 'Lab — Read the meter',
  description:
    'A small CTC meter reader running in your browser. Stress it, watch it decode, and measure it on your device.',
  alternates: { canonical: siteAddress('/lab/') },
}
export default function Lab() {
  return (
    <main id="content" tabIndex={-1}>
      <header className="page-header">
        <p className="mono muted">Lab · Browser inference</p>
        <h1>Read the meter yourself.</h1>
        <p>
          A {Math.round(card.params / 1000)}k-parameter CTC reader I trained on synthetic meters.
          Add blur, glare and grime, watch every frame vote, and time it on your device.
        </p>
        <div className="receipt">
          <SourceLink source={LAB_SOURCE} />
        </div>
      </header>
      <div className="lab">
        <MeterLab />
      </div>
      <section className="section article">
        <h2 className="section-label">Model card</h2>
        <dl className="meta-table">
          <dt>Parameters</dt>
          <dd>{card.params.toLocaleString('en-US')}</dd>
          <dt>Weights</dt>
          <dd>{Math.round(card.bytes / 1024)} KB, int8 per-channel, batch normalization folded</dd>
          <dt>Training</dt>
          <dd>
            {card.trainSamples.toLocaleString('en-US')} synthetic meters · {card.epochs} epochs ·
            CPU
          </dd>
          <dt>Validation</dt>
          <dd>{card.valSamples.toLocaleString('en-US')} unseen seeds</dd>
          <dt>Exact match</dt>
          <dd>
            {(card.valExact.int8 * 100).toFixed(1)}% int8 · {(card.valExact.fp32 * 100).toFixed(1)}%
            fp32
          </dd>
          <dt>Int8 CER</dt>
          <dd>{(card.valCer.int8 * 100).toFixed(1)}%</dd>
          <dt>Trained</dt>
          <dd>{card.trainedOn}</dd>
        </dl>
        <div className="receipt">
          <SourceLink source={LAB_SOURCE} />
        </div>
        <p>
          The training set uses the same renderer as this page. Stress curves use fresh meters at
          each level, with one stress applied at a time.
        </p>
        <p>
          It has only seen synthetic seven-segment displays. A real meter photograph is out of
          distribution. This is recognition alone: no detector, rectifier, or quality gate. My
          production system is a different, larger, private pipeline.
        </p>
        <p>
          <a href="https://github.com/Lourdhu02/portfolio/tree/main/scripts/lab">Training code ↗</a>{' '}
          · <a href={withBase('/work/meter-ocr/')}>The production system ↗</a>
        </p>
      </section>
    </main>
  )
}
