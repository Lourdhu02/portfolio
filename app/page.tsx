import { ParticleName } from '@/components/three/ParticleName'
import { Counter } from '@/components/motion/Counter'
import { WorkCard } from '@/components/motion/WorkCard'
import { LabCommand } from '@/components/ui/LabCommand'
import { Magnetic } from '@/components/motion/Magnetic'
import { HeroScroll } from '@/components/motion/HeroScroll'
import { ParallaxGrid } from '@/components/motion/Parallax'
import { Reveal, RevealItem } from '@/components/motion/Reveal'
import { ScrollWords } from '@/components/motion/ScrollWords'
import { TRUTH } from '@/content/truth'
import Link from 'next/link'

export default function Home() {
  const { readingsProcessed, accuracy, latencyP50 } = TRUTH.metrics.flagship
  const speedup = Math.round(latencyP50.before / latencyP50.after)

  return (
    <main className="relative w-full">
      
      {/* SC.01: Hero */}
      <HeroScroll>
        <ParticleName />
      </HeroScroll>

      {/* SC.02: Proof */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text">
        <Reveal stagger={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 pt-16 pb-24 border-t border-line">
          
          <RevealItem className="flex flex-col space-y-4">
            <h2 className="font-display text-5xl md:text-7xl">
              <Counter value={readingsProcessed / 1000000} suffix="M+" />
            </h2>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-wider uppercase text-muted">Readings Processed</span>
              <span className="text-muted/80 text-sm mt-1">Utility-scale five-model pipeline in live production.</span>
            </div>
          </RevealItem>

          <RevealItem className="flex flex-col space-y-4">
            <h2 className="font-display text-5xl md:text-7xl text-success">
              <Counter value={accuracy.after} suffix="%" />
            </h2>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-wider uppercase text-muted">Live Production Accuracy</span>
              <span className="text-muted/80 text-sm mt-1">Lifted from {accuracy.before}% across field camera conditions.</span>
            </div>
          </RevealItem>

          <RevealItem className="flex flex-col space-y-4">
            <h2 className="font-display text-5xl md:text-7xl text-accent">
              <Counter value={speedup} suffix="×" />
            </h2>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-wider uppercase text-muted">Faster p50 Latency</span>
              <span className="text-muted/80 text-sm mt-1">Dropped from {latencyP50.before}ms to {latencyP50.after}ms on Triton + L4.</span>
            </div>
          </RevealItem>

        </Reveal>
      </section>

      {/* SC.03: Work Grid */}
      <section id="work" className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text">
        <Reveal className="flex justify-between items-baseline mb-12 border-b border-line pb-4">
          <h2 className="font-mono text-sm tracking-widest uppercase text-muted">01 / Selected Work</h2>
          <span className="font-mono text-xs text-muted uppercase">Production Systems & Research</span>
        </Reveal>
        
        <ParallaxGrid className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Flagship: Meter OCR */}
          <WorkCard 
            id="meter-ocr"
            title="Meter OCR"
            kicker="State Utility · 40M+ Readings"
            href="/work/meter-ocr"
          >
            <div className="w-full h-full bg-[#0E0E12] p-6 flex flex-col justify-between border-t border-accent/40">
              <div className="flex justify-between items-center font-mono text-[11px] text-muted uppercase">
                <span className="text-accent">FLAGSHIP PIPELINE</span>
                <span>9 TENSORRT ENGINES</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span className="font-mono text-xs text-text">181 img/s sustained on 1× NVIDIA L4</span>
                </div>
                <div className="w-full bg-line h-1 rounded-full overflow-hidden">
                  <div className="bg-accent h-full w-[91%]" />
                </div>
                <div className="flex justify-between font-mono text-[10px] text-muted">
                  <span>ACCURACY: 91%</span>
                  <span>P50: 156ms</span>
                </div>
              </div>
            </div>
          </WorkCard>

          {/* SVTRv2-ARD */}
          <WorkCard 
            id="svtrv2-ard"
            title="SVTRv2-ARD"
            kicker="Research · DGX 3.8× Accelerated"
            href="/work/svtrv2-ard"
          >
            <div className="w-full h-full bg-[#0E0E12] p-6 flex flex-col justify-between border-t border-detect/40">
              <div className="flex justify-between items-center font-mono text-[11px] text-muted uppercase">
                <span className="text-detect">ATTENTION REFACTOR</span>
                <span>FUSED SDPA + COMPILE</span>
              </div>
              <div className="space-y-2">
                <div className="font-mono text-xs text-text">VRAM footprint: 50.5GB → 14.7GB</div>
                <div className="font-mono text-xs text-detect">+8.7 pp on low-quality photo crops</div>
              </div>
            </div>
          </WorkCard>

          {/* ECHOME */}
          <WorkCard 
            id="echome"
            title="ECHOME"
            kicker="Local-First Agent · LangGraph"
            href="/work/echome"
          >
            <div className="w-full h-full bg-[#0E0E12] p-6 flex flex-col justify-between border-t border-line">
              <div className="flex justify-between items-center font-mono text-[11px] text-muted uppercase">
                <span>3-TIER MEMORY</span>
                <span>1MS QDRANT RETRIEVAL</span>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-xs text-text">11 of 12 planted facts recalled</div>
                <div className="font-mono text-xs text-muted">Adaptive IRT psychometric testing · Offline</div>
              </div>
            </div>
          </WorkCard>
          
          {/* FinSentinelAI */}
          <WorkCard 
            id="finsentinel"
            title="FinSentinelAI"
            kicker="Private Financial RAG · Hybrid BM25"
            href="/work/finsentinel"
          >
            <div className="w-full h-full bg-[#0E0E12] p-6 flex flex-col justify-between border-t border-line">
              <div className="flex justify-between items-center font-mono text-[11px] text-muted uppercase">
                <span>RECIPROCAL-RANK FUSION</span>
                <span>AIR-GAPPED OLLAMA</span>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-xs text-text">15% → 100% Exact-ID Lookup Recovery</div>
                <div className="font-mono text-xs text-muted">Cross-encoder reranking over 1,000 PDFs</div>
              </div>
            </div>
          </WorkCard>

        </ParallaxGrid>
      </section>

      {/* SC.04: Lab (cmdk) */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text">
        <Reveal className="flex justify-between items-baseline mb-12 border-b border-line pb-4">
          <h2 className="font-mono text-sm tracking-widest uppercase text-muted">02 / Live ML Lab</h2>
          <Link href="/lab" className="font-mono text-xs text-detect hover:underline uppercase tracking-wider">
            Launch Interactive Benchmark →
          </Link>
        </Reveal>
        <Reveal>
          <LabCommand />
        </Reveal>
      </section>

      {/* SC.05: Principles */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 text-text">
        <h2 className="sr-only">Engineering Creed</h2>
        <ScrollWords
          label={<div className="font-mono text-xs text-muted uppercase tracking-widest mb-8">03 / Engineering Creed</div>}
          lines={[
            { text: 'Measure before you claim.' },
            { text: 'Ship behind a canary.' },
            { text: 'Boring to run.', muted: true },
          ]}
        />
      </section>

      {/* SC.06: Credentials, Open Source & Studio */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text border-t border-line">
        <Reveal stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <RevealItem>
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
          </RevealItem>
          
          <RevealItem className="grid grid-cols-2 gap-6">
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
          </RevealItem>
        </Reveal>
      </section>

      {/* SC.07: Footer */}
      <footer className="relative z-10 w-full bg-surface border-t border-line py-24 px-6 flex flex-col items-center justify-center overflow-hidden">
        <Reveal>
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
        </Reveal>

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
