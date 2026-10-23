import type { Metadata } from 'next'
import { METRICS, fmt, show, factor, headroom } from '@/content/truth'
import { Receipt } from '@/components/ui/Receipt'
import { withBase } from '@/lib/path'
import { siteAddress } from '@/lib/site'
export const metadata: Metadata = {
  title: 'Meter OCR',
  description:
    'Production meter-reading OCR for two state electricity utilities, served on Triton and TensorRT.',
  alternates: { canonical: siteAddress('/work/meter-ocr/') },
}
export default function MeterOcr() {
  const m = METRICS.meterOcr
  return (
    <main id="content" tabIndex={-1}>
      <header className="page-header">
        <a className="mono muted" href={withBase('/#work')}>
          ← Selected work
        </a>
        <h1>Meter OCR</h1>
        <p className="muted">One photo in, one reading out. Two state electricity utilities.</p>
      </header>
      <article className="case-study">
        <dl className="meta-table">
          <dt>Role</dt>
          <dd>Machine learning engineer, owner end to end</dd>
          <dt>Period</dt>
          <dd>2026 — Present</dd>
          <dt>Stack</dt>
          <dd>Triton, TensorRT FP16, SVTRv2, YOLO26-OBB, MobileViTv2, AWS</dd>
          <dt>Links</dt>
          <dd>
            <a href={withBase('/lab/')}>Try the public recognition demo ↗</a> · Production code is
            private
          </dd>
        </dl>
        <h2>Problem & constraints</h2>
        <p>
          Meter readers photograph electricity meters on their phones, and the utility&apos;s
          billing backend needs the number. The service gets one photo and must return one reading
          with a confidence score, in the same response shape whatever happens, because the backend
          never branches on errors.
        </p>
        <p>
          The original serverless path handled {fmt(m.busiestDay.value)} requests on its busiest
          day, a production peak of {show(m.productionPeak)}, and zero 4xx or 5xx across{' '}
          {fmt(m.weeklyRequests.value)} requests in a measured week. It worked, but at{' '}
          {show(m.p50, 'before')} p50 from the client. My job was to make it fast while preserving
          the caller&apos;s contract.
        </p>
        {[m.busiestDay, m.productionPeak, m.weeklyRequests].map((metric) => (
          <Receipt key={metric.label} metric={metric} />
        ))}
        <h2>Approach</h2>
        <p>
          A router function picks the GPU path or the serverless path per request by deterministic
          sha256 bucketing. It falls back on any error or timeout and opens a circuit breaker after
          consecutive failures. Behind it, nginx and a Flask gateway feed {m.engines.value} TensorRT
          FP16 engines in Triton: meter presence, dial detection, digital-vs-analog, and short,
          medium and long readers for each dial type.
        </p>
        <Receipt metric={m.engines} />
        <dl className="meta-table">
          <dt>Input</dt>
          <dd>Field photo → hash-bucketed router</dd>
          <dt>GPU path</dt>
          <dd>nginx → Flask → Triton → TensorRT engines</dd>
          <dt>Fallback</dt>
          <dd>Serverless path on timeout, error, or open circuit</dd>
          <dt>Output</dt>
          <dd>Reading and confidence, or NA</dd>
        </dl>
        <h2>Trade-offs</h2>
        <p>
          Moving the last classifier from ONNX Runtime to TensorRT FP16 was the hardest cut.
          TensorRT refuses a Transpose on a UINT8 input, so the exported graph gets a patch that
          casts first, numerically identical, before conversion. Classifier compute went from{' '}
          {show(m.classifierCompute, 'before')} to {show(m.classifierCompute)}, and throughput
          stopped falling as load rose.
        </p>
        <Receipt metric={m.classifierCompute} />
        <p>
          On one NVIDIA L4 the box sustains {show(m.sustainedL4)}, {fmt(headroom, 1)}× the
          production peak. The ceiling is the host CPU, not the GPU. Engines are built once per GPU
          architecture and fetched with a sha256 check.
        </p>
        <Receipt metric={m.sustainedL4} />
        <h2>Battle log</h2>
        <h3>The decoder bug</h3>
        <p>
          A CTC decoder that skipped blank frames when checking repeats turned 4777.1 into 47.1. The
          fix is one line; the lesson was a fixed test set every release must reproduce.
        </p>
        <h3>The throughput cliff</h3>
        <p>
          Throughput fell as load rose because a classifier was still on ONNX Runtime. Moving it to
          TensorRT took throughput from {show(m.throughput, 'before')} to {show(m.throughput)}.
        </p>
        <Receipt metric={m.throughput} />
        <h3>The missing archive</h3>
        <p>
          Fire-and-forget archiving lost {m.archiveDrops.value} images to S3 in a burst test.
          Version two spools failures to disk and replays them.
        </p>
        <Receipt metric={m.archiveDrops} />
        <h3>The gap the canary caught</h3>
        <p>
          The shadow-then-canary ladder ran {fmt(m.rolloutRequests.value)} requests with zero
          errors. It also showed the GPU path reading {show(m.canaryGap)} against serverless&apos;s{' '}
          {show(m.canaryGap, 'before')}, mostly on analog dials. Rollout waited on that measurement.
        </p>
        <Receipt metric={m.rolloutRequests} />
        <Receipt metric={m.canaryGap} />
        <h2>Results</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th scope="col">Metric</th>
                <th scope="col">Before</th>
                <th scope="col">After</th>
                <th scope="col">Factor</th>
              </tr>
            </thead>
            <tbody>
              {[m.p50, m.p50AtLoad, m.throughput, m.classifierCompute].map((r) => (
                <tr key={r.label}>
                  <th scope="row">
                    {r.label}
                    <Receipt metric={r} compact />
                  </th>
                  <td>{show(r, 'before')}</td>
                  <td>{show(r)}</td>
                  <td>{Math.round(factor(r))}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {[m.readingAccuracy, m.invalidDetection, m.biharAccuracy].map((r) => (
          <div key={r.label}>
            <h3>
              {show(r)} · {r.label}
            </h3>
            <Receipt metric={r} />
          </div>
        ))}
        <h2>What I&apos;d do differently</h2>
        <p>
          I would put the repeated-digit decoder cases and a durable archive queue in place before
          the first rollout. Analog dials remain the open problem in both states. Both use the same
          analog readers, so the next gain is model and data work, not infrastructure.
        </p>
      </article>
    </main>
  )
}
