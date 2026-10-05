import { ParticleName } from '@/components/three/ParticleName'
import { Counter } from '@/components/motion/Counter'
import { WorkCard } from '@/components/motion/WorkCard'
import { LabDock } from '@/components/interaction/LabDock'
import { CopyEmail } from '@/components/interaction/CopyEmail'
import { Magnetic } from '@/components/motion/Magnetic'
import { SplitLines } from '@/components/motion/SplitLines'
import { TRUTH, METRICS, show, factor } from '@/content/truth'
import { Receipt } from '@/components/ui/Receipt'
import Link from 'next/link'
import { HeroOverlay } from '@/components/hero/HeroOverlay'
import { SectionHead } from '@/components/ui/SectionHead'
import { MeterOcrVisual, SvtrVisual, EchomeVisual, FinSentinelVisual } from '@/components/work/CardVisuals'

export default function Home() {
  const { busiestDay, p50, invalidDetection, classifierCompute } = METRICS.meterOcr
  const { tests: achillesTests, labs: achillesLabs } = METRICS.achilles
  const studio = TRUTH.studio

  return (
    <main className="relative w-full">
      
      {/* SC.01: Hero */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        <ParticleName />
        <HeroOverlay />
      </section>

      {/* SC.02: Proof */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 pt-16 pb-24 border-t border-line">
          
          <div className="flex flex-col space-y-4">
            <h2 className="font-display text-6xl md:text-8xl leading-none">
              <Counter value={Math.round(busiestDay.value / 1000)} suffix="K" />
            </h2>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-wider uppercase text-muted">Meter photos read in one day</span>
              <span className="text-muted/80 text-sm mt-1">{busiestDay.value.toLocaleString('en-US')} requests on production&apos;s busiest day, for a state electricity utility.</span>
              <Receipt metric={busiestDay} className="mt-3" />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <h2 className="font-display text-6xl md:text-8xl leading-none text-accent">
              <Counter value={Math.round(factor(p50))} suffix="×" />
            </h2>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-wider uppercase text-muted">Faster, end to end</span>
              <span className="text-muted/80 text-sm mt-1">p50 from {show(p50, 'before')} on serverless to {show(p50)} on Triton and TensorRT.</span>
              <Receipt metric={p50} className="mt-3" />
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <h2 className="font-display text-6xl md:text-8xl leading-none text-success">
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
      <section id="work" className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text scroll-mt-16">
        <SectionHead index="01" title="Selected Work" aside="Production systems & research" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
          <WorkCard
            id="meter-ocr"
            index="01"
            title="Meter OCR"
            kicker={`Two state utilities · ${busiestDay.value.toLocaleString('en-US')} requests on the busiest day`}
            href="/work/meter-ocr"
            summary="Reads electricity meters from field photos on Triton and TensorRT, and answers NA instead of guessing when a photo can't be read."
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
            kicker="Research · SVTRv2 (ICCV 2025) + a new method"
            href="/work/svtrv2-ard"
            summary="Learned routing into SVTRv2's resize bins plus SGM-to-CTC distillation, leaving the served model byte-identical."
            tags={['PyTorch', 'CTC', 'OCR']}
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
            summary={`An offline agent with three-tier memory and a ${show(METRICS.echome.assessmentCut)} shorter adaptive assessment.`}
            tags={['LangGraph', 'Qdrant', 'Offline']}
            aspect="aspect-[4/3]"
          >
            <EchomeVisual />
          </WorkCard>

          <WorkCard
            id="finsentinel"
            index="04"
            title="FinSentinelAI"
            kicker="Private finance RAG · runs on your machine"
            href="/work/finsentinel"
            summary="Question answering over invoices and bank statements with local embeddings, a cross-encoder reranker and Ollama. Zero external API calls."
            tags={['ChromaDB', 'Cross-encoder', 'Ollama']}
            aspect="aspect-[4/3]"
          >
            <FinSentinelVisual />
          </WorkCard>
        </div>
      </section>

      {/* SC.04: Lab console (same command menu as ⌘K) */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-text">
        <SectionHead
          index="02"
          title="Lab"
          aside={<Link href="/lab" className="text-detect hover:text-text transition-colors">Walk through the pipeline →</Link>}
        />
        <LabDock />
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
            data-cursor="view"
            data-cursor-label="Say hi"
            className="group flex flex-col items-center justify-center px-12 py-10 rounded-full border border-line bg-bg hover:border-accent transition-all shadow-2xl"
          >
            <span className="font-display text-4xl md:text-5xl group-hover:text-accent transition-colors uppercase">
              Got a model to ship?
            </span>
          </a>
        </Magnetic>
        <CopyEmail
          email={TRUTH.identity.email}
          className="mt-6 rounded-full px-4 py-2 font-mono text-xs text-muted transition-colors hover:text-text"
        />

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
