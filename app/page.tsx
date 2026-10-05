import { ParticleName } from '@/components/three/ParticleName'
import { Counter } from '@/components/motion/Counter'
import { WorkCard } from '@/components/motion/WorkCard'
import { LabCommand } from '@/components/ui/LabCommand'
import { Magnetic } from '@/components/motion/Magnetic'
import { SplitLines } from '@/components/motion/SplitLines'
import { TRUTH, METRICS, show, factor } from '@/content/truth'
import { Receipt } from '@/components/ui/Receipt'
import Link from 'next/link'

export default function Home() {
  const { busiestDay, p50, invalidDetection, sustainedL4, readingAccuracy, engines, classifierCompute } = METRICS.meterOcr
  const { tests: achillesTests, labs: achillesLabs } = METRICS.achilles
  const studio = TRUTH.studio

  return (
    <main className="relative w-full">
      
      {/* SC.01: Hero */}
      <section className="relative h-[100vh] w-full">
        <ParticleName />
      </section>

      {/* SC.02: Proof */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 pt-16 pb-24 border-t border-line">
          
          <div className="flex flex-col space-y-4">
            <h2 className="font-display text-5xl md:text-7xl">
              <Counter value={Math.round(busiestDay.value / 1000)} suffix="K" />
            </h2>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-wider uppercase text-muted">Meter photos read in one day</span>
              <span className="text-muted/80 text-sm mt-1">{busiestDay.value.toLocaleString('en-US')} requests on production&apos;s busiest day, for a state electricity utility.</span>
              <Receipt metric={busiestDay} className="mt-3" />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <h2 className="font-display text-5xl md:text-7xl text-accent">
              <Counter value={Math.round(factor(p50))} suffix="×" />
            </h2>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-wider uppercase text-muted">Faster, end to end</span>
              <span className="text-muted/80 text-sm mt-1">p50 from {show(p50, 'before')} on serverless to {show(p50)} on Triton and TensorRT.</span>
              <Receipt metric={p50} className="mt-3" />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <h2 className="font-display text-5xl md:text-7xl text-success">
              <Counter value={invalidDetection.value} decimals={invalidDetection.decimals} suffix="%" />
            </h2>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-wider uppercase text-muted">Bad photos refused</span>
              <span className="text-muted/80 text-sm mt-1">Blurred, blank and non-meter photos get &ldquo;NA&rdquo;, never a confident wrong number.</span>
              <Receipt metric={invalidDetection} className="mt-3" />
            </div>
          </div>

        </div>
      </section>

      {/* SC.03: Work Grid */}
      <section id="work" className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text">
        <div className="flex justify-between items-baseline mb-12 border-b border-line pb-4">
          <h2 className="font-mono text-sm tracking-widest uppercase text-muted">01 / Selected Work</h2>
          <span className="font-mono text-xs text-muted uppercase">Production Systems & Research</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Flagship: Meter OCR */}
          <WorkCard 
            id="meter-ocr"
            title="Meter OCR"
            kicker={`Two state utilities · ${busiestDay.value.toLocaleString('en-US')} requests on the busiest day`}
            href="/work/meter-ocr"
          >
            <div className="w-full h-full bg-[#0E0E12] p-6 flex flex-col justify-between border-t border-accent/40">
              <div className="flex justify-between items-center font-mono text-[11px] text-muted uppercase">
                <span className="text-accent">FLAGSHIP PIPELINE</span>
                <span>{engines.value} TENSORRT ENGINES</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span className="font-mono text-xs text-text">{show(sustainedL4)} sustained on one NVIDIA L4</span>
                </div>
                <div className="w-full bg-line h-1 rounded-full overflow-hidden">
                  <div className="bg-accent h-full" style={{ width: `${readingAccuracy.value}%` }} />
                </div>
                <div className="flex justify-between font-mono text-[10px] text-muted">
                  <span>READING ACCURACY: {show(readingAccuracy)}</span>
                  <span>P50: {show(p50)}</span>
                </div>
              </div>
            </div>
          </WorkCard>

          {/* SVTRv2-ARD */}
          <WorkCard 
            id="svtrv2-ard"
            title="SVTRv2-ARD"
            kicker="Research · SVTRv2 (ICCV 2025) + a new method"
            href="/work/svtrv2-ard"
          >
            <div className="w-full h-full bg-[#0E0E12] p-6 flex flex-col justify-between border-t border-detect/40">
              <div className="flex justify-between items-center font-mono text-[11px] text-muted uppercase">
                <span className="text-detect">ADAPTIVE ROUTING</span>
                <span>CTC DISTILLATION</span>
              </div>
              <div className="space-y-2">
                <div className="font-mono text-xs text-text">Verified line by line against official OpenOCR</div>
                <div className="font-mono text-xs text-detect">{METRICS.svtrv2.tests.value}/{METRICS.svtrv2.tests.value} tests · served model unchanged</div>
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
                <span>&lt;1 MS RETRIEVAL</span>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-xs text-text">Recalls the right fact in 11 of 12 sessions</div>
                <div className="font-mono text-xs text-muted">{show(METRICS.echome.assessmentCut)} shorter adaptive assessment · fully offline</div>
              </div>
            </div>
          </WorkCard>
          
          {/* FinSentinelAI */}
          <WorkCard 
            id="finsentinel"
            title="FinSentinelAI"
            kicker="Private finance RAG · runs on your machine"
            href="/work/finsentinel"
          >
            <div className="w-full h-full bg-[#0E0E12] p-6 flex flex-col justify-between border-t border-line">
              <div className="flex justify-between items-center font-mono text-[11px] text-muted uppercase">
                <span>CROSS-ENCODER RERANK</span>
                <span>LOCAL OLLAMA</span>
              </div>
              <div className="space-y-1">
                <div className="font-mono text-xs text-text">Zero external API calls</div>
                <div className="font-mono text-xs text-muted">{METRICS.finSentinel.corpus.value.toLocaleString('en-US')}-document test corpus · 10 layouts</div>
              </div>
            </div>
          </WorkCard>

        </div>
      </section>

      {/* SC.04: Lab (cmdk) */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text">
        <div className="flex justify-between items-baseline mb-12 border-b border-line pb-4">
          <h2 className="font-mono text-sm tracking-widest uppercase text-muted">02 / Lab</h2>
          <Link href="/lab" className="font-mono text-xs text-detect hover:underline uppercase tracking-wider">
            Walk through the pipeline →
          </Link>
        </div>
        <LabCommand />
      </section>

      {/* SC.05: Principles */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text">
        <div className="font-mono text-xs text-muted uppercase tracking-widest mb-8">03 / Engineering Creed</div>
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
              {TRUTH.identity.mission} Author of Achilles, {achillesLabs.value} test-driven labs that rebuild the modern LLM stack, and a PhilArchive preprint on identity in persistent AI agents.
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
              <div className="text-4xl font-display text-accent mb-2">{achillesTests.value}</div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted">CI tests passing (Achilles)</div>
            </div>
            <div className="p-6 bg-surface border border-line">
              <div className="text-4xl font-display text-text mb-2">₹{studio.revenueLakh}L</div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted">spacedrift revenue ({studio.clients} clients)</div>
            </div>
            <div className="p-6 bg-surface border border-line">
              <div className="text-4xl font-display text-detect mb-2">{achillesLabs.value}</div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted">Test-driven AI labs</div>
            </div>
            <div className="p-6 bg-surface border border-line">
              <div className="text-4xl font-display text-success mb-2">{Math.round(factor(classifierCompute))}×</div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted">TensorRT speedup ({show(classifierCompute, 'before')} → {show(classifierCompute)})</div>
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
              Got a model to ship?
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
