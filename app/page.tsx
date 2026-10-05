import { Counter } from '@/components/motion/Counter'
import { WorkCard } from '@/components/motion/WorkCard'
import { LabCommand } from '@/components/ui/LabCommand'
import { Magnetic } from '@/components/motion/Magnetic'
import { SplitLines } from '@/components/motion/SplitLines'
import { TRUTH } from '@/content/truth'
import Link from 'next/link'
import { HeroStage } from '@/components/hero/HeroStage'
import { HeroOverlay } from '@/components/hero/HeroOverlay'
import { SectionHead } from '@/components/ui/SectionHead'
import { MeterOcrVisual, SvtrVisual, EchomeVisual, FinSentinelVisual } from '@/components/work/CardVisuals'

export default function Home() {
  const { readingsProcessed, accuracy, latencyP50 } = TRUTH.metrics.flagship
  const speedup = Math.round(latencyP50.before / latencyP50.after)

  return (
    <main className="relative w-full">
      
      {/* SC.01: Hero */}
      <HeroStage>
        <HeroOverlay />
      </HeroStage>

      {/* SC.02: Proof */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 pt-16 pb-24 border-t border-line">
          
          <div className="flex flex-col space-y-4">
            <h2 className="font-display text-6xl md:text-8xl leading-none">
              <Counter value={readingsProcessed / 1000000} suffix="M+" />
            </h2>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-wider uppercase text-muted">Readings Processed</span>
              <span className="text-muted/80 text-sm mt-1">Utility-scale five-model pipeline in live production.</span>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <h2 className="font-display text-6xl md:text-8xl leading-none text-success">
              <Counter value={accuracy.after} suffix="%" />
            </h2>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-wider uppercase text-muted">Live Production Accuracy</span>
              <span className="text-muted/80 text-sm mt-1">Lifted from {accuracy.before}% across field camera conditions.</span>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <h2 className="font-display text-6xl md:text-8xl leading-none text-accent">
              <Counter value={speedup} suffix="×" />
            </h2>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-wider uppercase text-muted">Faster p50 Latency</span>
              <span className="text-muted/80 text-sm mt-1">Dropped from {latencyP50.before}ms to {latencyP50.after}ms on Triton + L4.</span>
            </div>
          </div>

        </div>
      </section>

      {/* SC.03: Work Grid */}
      <section id="work" className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text scroll-mt-16">
        <SectionHead index="01" title="Selected Work" aside="Production systems & research" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
          <WorkCard
            id="meter-ocr"
            index="01"
            title="Meter OCR"
            kicker="State Utility · 40M+ Readings · Flagship"
            href="/work/meter-ocr"
            summary="Utility-scale five-model pipeline that reads electricity meters from field photos, running in live production."
            tags={['TensorRT', 'Triton', 'NVIDIA L4']}
            aspect="aspect-[4/3] md:aspect-[21/9]"
            className="md:col-span-3"
          >
            <MeterOcrVisual />
          </WorkCard>

          <WorkCard
            id="svtrv2-ard"
            index="02"
            title="SVTRv2-ARD"
            kicker="Research · Attention refactor"
            href="/work/svtrv2-ard"
            summary="Fused SDPA and compile for the SVTRv2 text recogniser, cutting the training memory footprint."
            tags={['PyTorch', 'SDPA', 'DGX']}
            aspect="aspect-[4/3]"
          >
            <SvtrVisual />
          </WorkCard>

          <WorkCard
            id="echome"
            index="03"
            title="ECHOME"
            kicker="Local-first agent · LangGraph"
            href="/work/echome"
            summary="An offline agent with three-tier memory and adaptive IRT psychometric testing."
            tags={['LangGraph', 'Qdrant', 'Offline']}
            aspect="aspect-[4/3]"
          >
            <EchomeVisual />
          </WorkCard>

          <WorkCard
            id="finsentinel"
            index="04"
            title="FinSentinelAI"
            kicker="Private financial RAG"
            href="/work/finsentinel"
            summary="Hybrid BM25 and dense retrieval fused by reciprocal rank, cross-encoder reranked, on air-gapped Ollama."
            tags={['BM25', 'RRF', 'Ollama']}
            aspect="aspect-[4/3]"
          >
            <FinSentinelVisual />
          </WorkCard>
        </div>
      </section>

      {/* SC.04: Lab (cmdk) */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text">
        <SectionHead
          index="02"
          title="Live ML Lab"
          aside={<Link href="/lab" className="text-detect hover:text-text transition-colors">Launch interactive benchmark →</Link>}
        />
        <LabCommand />
      </section>

      {/* SC.05: Principles */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text">
        <SectionHead index="03" title="Engineering Creed" />
        <h2 className="font-display text-5xl md:text-7xl mb-12 leading-[1.05]">
          <SplitLines>Measure before you claim.</SplitLines>
          <br />
          <SplitLines>Ship behind a canary.</SplitLines>
          <br />
          <SplitLines className="text-muted">Boring to run.</SplitLines>
        </h2>
      </section>

      {/* SC.06: Credentials, Open Source & Studio */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text border-t border-line">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="font-mono text-xs text-accent uppercase tracking-widest mb-2">04 / Credentials</div>
            <h2 className="font-display text-4xl mb-4">Lourdu Raju</h2>
            <p className="font-mono text-sm text-muted uppercase tracking-widest mb-6">
              Machine Learning Engineer at Sujanix<br/>
              Founder at spacedrift · Bengaluru, India
            </p>
            <p className="text-text/80 max-w-md leading-relaxed text-sm mb-6">
              {TRUTH.identity.mission} Author of Achilles (18 test-driven core-AI labs) and the PhilArchive preprint on persistent AI agents.
            </p>
            <div className="flex gap-4">
              <a 
                href="/LourduRaju_Resume.pdf" 
                target="_blank"
                className="px-4 py-2 bg-surface border border-line hover:border-accent text-accent font-mono text-xs uppercase tracking-wider transition-colors"
                style={{ borderRadius: '6px' }}
              >
                Resume PDF ↓
              </a>
              <Link 
                href="/about"
                className="px-4 py-2 border border-line hover:border-text text-text font-mono text-xs uppercase tracking-wider transition-colors"
                style={{ borderRadius: '6px' }}
              >
                Full Story →
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-surface border border-line">
              <div className="text-4xl font-display text-accent mb-2">{TRUTH.metrics.openSource.testsPassing}</div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted">CI Tests Passing (Achilles)</div>
            </div>
            <div className="p-6 bg-surface border border-line">
              <div className="text-4xl font-display text-text mb-2">₹12L</div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted">spacedrift Revenue (36 Clients)</div>
            </div>
            <div className="p-6 bg-surface border border-line">
              <div className="text-4xl font-display text-detect mb-2">18</div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted">Test-Driven AI Labs</div>
            </div>
            <div className="p-6 bg-surface border border-line">
              <div className="text-4xl font-display text-success mb-2">94×</div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted">TensorRT Speedup (3.3ms)</div>
            </div>
          </div>
        </div>
      </section>

      {/* SC.07: Footer */}
      <footer className="relative z-10 w-full bg-surface border-t border-line py-24 px-6 flex flex-col items-center justify-center overflow-hidden">
        <Magnetic strength={20}>
          <a 
            href={`mailto:${TRUTH.identity.email}`} 
            className="group flex flex-col items-center justify-center px-12 py-10 rounded-full border border-line bg-bg hover:border-accent transition-all shadow-2xl"
          >
            <span className="font-display text-4xl md:text-5xl group-hover:text-accent transition-colors uppercase">
              Let&apos;s Build Systems
            </span>
            <span className="font-mono text-xs text-muted mt-2 group-hover:text-text transition-colors">
              {TRUTH.identity.email}
            </span>
          </a>
        </Magnetic>

        <div className="mt-16 flex flex-wrap justify-center gap-6 font-mono text-xs uppercase tracking-widest text-muted">
          <a href={TRUTH.identity.links.github} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">GitHub</a>
          <span>·</span>
          <a href={TRUTH.identity.links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">LinkedIn</a>
          <span>·</span>
          <a href={TRUTH.identity.links.kaggle} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Kaggle</a>
          <span>·</span>
          <a href={TRUTH.identity.links.studio} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">spacedrift.in</a>
          <span>·</span>
          <a href={TRUTH.identity.links.preprint} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">PhilArchive</a>
        </div>

        <div className="mt-12 font-mono text-xs text-muted/60 uppercase tracking-widest text-center">
          © {new Date().getFullYear()} Lourdu Raju · Bengaluru, India · Built with Next.js, Three.js & Motion
        </div>
      </footer>
    </main>
  )
}
