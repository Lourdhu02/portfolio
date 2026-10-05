import { PipelineDiagram } from '@/components/motion/PipelineDiagram'
import { Receipt } from '@/components/ui/Receipt'
import { METRICS, show, factor, fmt, headroom } from '@/content/truth'
import Link from 'next/link'
import { ViewTransition } from 'react'
import type { Metadata } from 'next'

const ocr = METRICS.meterOcr

export const metadata: Metadata = {
  title: 'Meter OCR',
  description: `Production meter-reading OCR for two state utilities: ${ocr.engines.value} TensorRT engines behind Triton, ${Math.round(factor(ocr.p50))}× faster end to end than serverless, ${show(ocr.invalidDetection)} of unreadable photos refused.`,
  alternates: { canonical: '/work/meter-ocr' },
}

export default function MeterOCRCaseStudy() {
  const m = METRICS.meterOcr
  const results = [m.p50, m.p50AtLoad, m.throughput, m.classifierCompute]

  return (
    <main className="relative w-full max-w-4xl mx-auto px-6 py-32 text-text">

      <Link href="/#work" className="inline-block font-mono text-xs uppercase tracking-widest text-muted hover:text-text transition-colors mb-16">
        ← Back to Work
      </Link>

      {/* 1. Title Card */}
      <header className="mb-24">
        <ViewTransition name="work-title-meter-ocr" share="morph" default="none">
          <h1 className="font-display text-6xl md:text-8xl leading-[0.85] uppercase mb-6 w-fit">
            Meter OCR
          </h1>
        </ViewTransition>
        <p className="font-mono text-muted uppercase tracking-widest">One photo in, one reading out · two state electricity utilities</p>
      </header>

      {/* 2. TL;DR */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-line mb-24">
        <div>
          <div className="text-xs font-mono text-muted mb-2">ROLE</div>
          <div className="text-sm">Machine Learning Engineer, owner end to end</div>
        </div>
        <div>
          <div className="text-xs font-mono text-muted mb-2">TIMELINE</div>
          <div className="text-sm">2026 – Present</div>
        </div>
        <div>
          <div className="text-xs font-mono text-muted mb-2">STACK</div>
          <div className="text-sm">Triton, TensorRT FP16, SVTRv2, YOLO26-OBB, MobileViTv2, AWS</div>
        </div>
        <div>
          <div className="text-xs font-mono text-muted mb-2">IMPACT</div>
          <div className="text-sm text-success">{Math.round(factor(m.p50))}× faster p50, {show(m.invalidDetection)} bad photos refused</div>
        </div>
      </section>

      {/* 3. Context */}
      <section className="mb-24 prose prose-invert prose-p:text-text/80 max-w-none">
        <h2 className="font-display text-4xl mb-6">Context & Constraints</h2>
        <p>
          Meter readers photograph electricity meters on their phones, and the utility&apos;s billing backend needs the number. The service gets one photo and must return one reading with a confidence score, in the same response shape whatever happens, because the backend never branches on errors.
        </p>
        <p>
          The original path was a serverless function: {fmt(m.busiestDay.value)} requests on its busiest day, a production peak of {show(m.productionPeak)}, and zero 4xx or 5xx across {fmt(m.weeklyRequests.value)} requests in a measured week. It worked, but at {show(m.p50, 'before')} p50 from the client. The job was to make it fast without ever making a caller worse off.
        </p>
      </section>

      {/* 4. Architecture */}
      <section className="mb-24">
        <h2 className="font-display text-4xl mb-6">Architecture</h2>
        <PipelineDiagram />
        <p className="mt-6 text-sm text-text/80 leading-relaxed">
          A router function picks the GPU path or the serverless path per request by deterministic sha256 bucketing, falls back on any error or a 4-second timeout, and opens a circuit breaker after 5 straight failures. Behind it, nginx and a Flask gateway feed {m.engines.value} TensorRT FP16 engines in Triton: meter presence, dial detection, digital-vs-analog, and short, medium and long readers for each dial type.
        </p>
      </section>

      {/* 5. Decisions */}
      <section className="mb-24 prose prose-invert prose-p:text-text/80 max-w-none">
        <h2 className="font-display text-4xl mb-6">Trade-offs</h2>
        <p>
          Moving the last classifier from ONNX Runtime to TensorRT FP16 was the hardest cut. TensorRT refuses a Transpose on a UINT8 input, so the exported graph gets a patch that casts first, numerically identical, before conversion. Classifier compute went from <strong>{show(m.classifierCompute, 'before')}</strong> to <strong>{show(m.classifierCompute)}</strong>, and throughput stopped falling as load rose.
        </p>
        <p>
          On one NVIDIA L4 the box sustains <strong>{show(m.sustainedL4)}</strong>, {fmt(headroom, 1)}× the production peak, and the ceiling is the host CPU, not the GPU. Engines are built once per GPU architecture and fetched with a sha256 check, so a deploy takes about a minute instead of a rebuild.
        </p>
      </section>

      {/* 6. Battle Log Cards */}
      <section className="mb-24">
        <h2 className="font-display text-4xl mb-6">Battle Log</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="p-6 bg-surface border border-line" style={{ borderBottomRightRadius: '14px' }}>
            <h4 className="font-mono text-sm text-accent mb-2">01 / The Decoder Bug</h4>
            <p className="text-sm text-text/80">
              A CTC decoder that skipped blank frames when checking repeats turned 4777.1 into 47.1. The fix is one line; the lesson was a fixed test set every release must reproduce.
            </p>
          </div>

          <div className="p-6 bg-surface border border-line" style={{ borderBottomRightRadius: '14px' }}>
            <h4 className="font-mono text-sm text-accent mb-2">02 / The Cliff</h4>
            <p className="text-sm text-text/80">
              Throughput fell as load rose, because one classifier was still on ONNX Runtime. Moving it to TensorRT took it from {show(m.throughput, 'before')} to {show(m.throughput)}.
            </p>
          </div>

          <div className="p-6 bg-surface border border-line" style={{ borderBottomRightRadius: '14px' }}>
            <h4 className="font-mono text-sm text-accent mb-2">03 / The Missing {m.archiveDrops.value}</h4>
            <p className="text-sm text-text/80">
              Fire-and-forget archiving lost {m.archiveDrops.value} images to S3 in a burst test. Version 2 spools failures to disk and replays them.
            </p>
          </div>

          <div className="p-6 bg-surface border border-line" style={{ borderBottomRightRadius: '14px' }}>
            <h4 className="font-mono text-sm text-accent mb-2">04 / The Gap the Canary Caught</h4>
            <p className="text-sm text-text/80">
              The shadow-then-canary ladder ran {fmt(m.rolloutRequests.value)} requests with zero errors, and it also showed the GPU path reading {show(m.canaryGap)} against serverless&apos;s {show(m.canaryGap, 'before')}, mostly on analog dials. Rollout waited on that number, not on a feeling.
            </p>
          </div>

        </div>
      </section>

      {/* 7. Results */}
      <section className="mb-24">
        <h2 className="font-display text-4xl mb-6">Results</h2>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-muted uppercase">
                <th className="py-4 pr-4">Metric</th>
                <th className="py-4 px-4">Before</th>
                <th className="py-4 px-4">After</th>
                <th className="py-4 px-4">Delta</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.label} className="border-b border-line/50 align-top">
                  <td className="py-4 pr-4">
                    <div className="font-medium">{r.label}</div>
                    <Receipt metric={r} className="mt-1 max-w-sm" />
                  </td>
                  <td className="py-4 px-4 font-mono text-muted whitespace-nowrap">{show(r, 'before')}</td>
                  <td className="py-4 px-4 font-mono text-accent whitespace-nowrap">{show(r)}</td>
                  <td className="py-4 px-4 font-mono text-success whitespace-nowrap">{Math.round(factor(r))}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[m.readingAccuracy, m.invalidDetection, m.biharAccuracy].map((r) => (
            <div key={r.label} className="p-6 bg-surface border border-line">
              <div className="text-3xl font-display text-text mb-1">{show(r)}</div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted mb-3">{r.label}</div>
              <Receipt metric={r} />
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-text/70 leading-relaxed max-w-2xl">
          Analog dials are the open problem in both states. Both run the same analog readers, so the next gain is model and data work, not infrastructure.
        </p>
      </section>

    </main>
  )
}
