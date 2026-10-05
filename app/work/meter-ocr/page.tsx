import { PipelineDiagram } from '@/components/motion/PipelineDiagram'
import { Counter } from '@/components/motion/Counter'
import { TRUTH } from '@/content/truth'
import Link from 'next/link'

export default function MeterOCRCaseStudy() {
  const { metrics } = TRUTH

  return (
    <main className="relative w-full max-w-4xl mx-auto px-6 py-32 text-text">
      
      <Link href="/" className="inline-block font-mono text-xs uppercase tracking-widest text-muted hover:text-text transition-colors mb-16">
        ← Back to Lab
      </Link>

      {/* 1. Title Card */}
      <header className="mb-24">
        <h1 className="font-display text-6xl md:text-8xl leading-[0.85] uppercase mb-6">
          Meter OCR
        </h1>
        <p className="font-mono text-muted uppercase tracking-widest">State Electricity Utility</p>
      </header>

      {/* 2. TL;DR */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-line mb-24">
        <div>
          <div className="text-xs font-mono text-muted mb-2">ROLE</div>
          <div className="text-sm">Machine Learning Engineer</div>
        </div>
        <div>
          <div className="text-xs font-mono text-muted mb-2">TIMELINE</div>
          <div className="text-sm">2026 – Present</div>
        </div>
        <div>
          <div className="text-xs font-mono text-muted mb-2">STACK</div>
          <div className="text-sm">PyTorch, TensorRT, Triton</div>
        </div>
        <div>
          <div className="text-xs font-mono text-muted mb-2">IMPACT</div>
          <div className="text-sm text-success">+12% Accuracy, 9x Faster</div>
        </div>
      </section>

      {/* 3. Context */}
      <section className="mb-24 prose prose-invert prose-p:text-text/80 max-w-none">
        <h2 className="font-display text-4xl mb-6">Context & Constraints</h2>
        <p>
          The mandate was simple in theory: one photo in, one reading out. The state utility was processing tens of millions of readings manually, facing massive backlog and verification costs. We needed a system capable of extreme burst loads, infallible accuracy, and it had to run cheaply.
        </p>
      </section>

      {/* 4. Architecture */}
      <section className="mb-24">
        <h2 className="font-display text-4xl mb-6">Architecture</h2>
        <PipelineDiagram />
      </section>

      {/* 5. Decisions */}
      <section className="mb-24 prose prose-invert prose-p:text-text/80 max-w-none">
        <h2 className="font-display text-4xl mb-6">Trade-offs</h2>
        <p>
          Moving from ONNX Runtime to TensorRT FP16 was the hardest technical cut, dropping classifier compute from <strong>309.5ms</strong> to <strong>3.3ms</strong>. We maintain a canary router that sends a slice of traffic to the GPU path via Triton, falling back to a containerized Lambda for 3-second timeouts.
        </p>
      </section>

      {/* 6. Battle Log Cards */}
      <section className="mb-24">
        <h2 className="font-display text-4xl mb-6">Battle Log</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-6 bg-surface border border-line" style={{ borderBottomRightRadius: '14px' }}>
            <h4 className="font-mono text-sm text-accent mb-2">01 / The Decoder Bug</h4>
            <p className="text-sm text-text/80">
              A CTC repeat bug turned 4777.1 into 47.1, dropping a release to 64.2%. A single-line fix restored it to 84.0%.
            </p>
          </div>

          <div className="p-6 bg-surface border border-line" style={{ borderBottomRightRadius: '14px' }}>
            <h4 className="font-mono text-sm text-accent mb-2">02 / The Cliff</h4>
            <p className="text-sm text-text/80">
              Under load, throughput dropped because a single classifier was left on ONNX. Moving it to TensorRT brought time down ~100x.
            </p>
          </div>

          <div className="p-6 bg-surface border border-line" style={{ borderBottomRightRadius: '14px' }}>
            <h4 className="font-mono text-sm text-accent mb-2">03 / The Missing 475</h4>
            <p className="text-sm text-text/80">
              Fire-and-forget archiving lost 475 objects under burst load. Replaced with an on-disk retrying spool.
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
              <tr className="border-b border-line/50">
                <td className="py-4 pr-4 font-medium">Live Accuracy</td>
                <td className="py-4 px-4 font-mono text-muted">{metrics.flagship.accuracy.before}%</td>
                <td className="py-4 px-4 font-mono text-success">{metrics.flagship.accuracy.after}%</td>
                <td className="py-4 px-4 font-mono text-success">+12 pp</td>
              </tr>
              <tr className="border-b border-line/50">
                <td className="py-4 pr-4 font-medium">End-to-End p50</td>
                <td className="py-4 px-4 font-mono text-muted">{metrics.flagship.latencyP50.before}ms</td>
                <td className="py-4 px-4 font-mono text-accent">{metrics.flagship.latencyP50.after}ms</td>
                <td className="py-4 px-4 font-mono text-accent">9x Faster</td>
              </tr>
              <tr className="border-b border-line/50">
                <td className="py-4 pr-4 font-medium">Container Size</td>
                <td className="py-4 px-4 font-mono text-muted">{metrics.flagship.containerSizeGB.before} GB</td>
                <td className="py-4 px-4 font-mono text-success">{metrics.flagship.containerSizeGB.after} GB</td>
                <td className="py-4 px-4 font-mono text-success">-50%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-8 text-xs font-mono text-muted space-y-2">
          <p>* Accuracy measured on live production traffic over 40M readings.</p>
          <p>* Throughput tested on a stepped load of 67,719 requests.</p>
        </div>
      </section>

    </main>
  )
}
