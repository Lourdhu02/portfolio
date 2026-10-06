import { Counter } from '@/components/motion/Counter'
import { LabDock } from '@/components/interaction/LabDock'
import { CopyEmail } from '@/components/interaction/CopyEmail'
import { Magnetic } from '@/components/motion/Magnetic'
import { Reveal, RevealItem } from '@/components/motion/Reveal'
import { ScrollWords } from '@/components/motion/ScrollWords'
import { TRUTH, METRICS, show, factor } from '@/content/truth'
import { Receipt } from '@/components/ui/Receipt'
import Link from 'next/link'
import { HeroStage } from '@/components/hero/HeroStage'
import { HeroOverlay } from '@/components/hero/HeroOverlay'
import { SectionHead } from '@/components/ui/SectionHead'
import { PetPen } from '@/components/pets/PetPen'

export default function Home() {
  const { busiestDay, p50, invalidDetection, classifierCompute } = METRICS.meterOcr
  const { tests: achillesTests, labs: achillesLabs } = METRICS.achilles
  const studio = TRUTH.studio

  return (
    <main className="relative w-full">
      
      {/* SC.01: Hero */}
      <HeroStage>
        <HeroOverlay />
      </HeroStage>

      {/* SC.02: Proof */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 text-text">
        <Reveal stagger={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 pt-12 sm:pt-16 pb-8 sm:pb-24 border-t border-line">
          
          <RevealItem className="flex flex-col space-y-4">
            <h2 className="font-display text-6xl md:text-8xl leading-none">
              <Counter value={Math.round(busiestDay.value / 1000)} suffix="K" />
            </h2>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-wider uppercase text-muted">Meter photos read in one day</span>
              <span className="text-muted/80 text-sm mt-1">{busiestDay.value.toLocaleString('en-US')} requests on production&apos;s busiest day, for a state electricity utility.</span>
              <Receipt metric={busiestDay} className="mt-3" />
            </div>
          </RevealItem>

          <RevealItem className="flex flex-col space-y-4">
            <h2 className="font-display text-6xl md:text-8xl leading-none text-accent">
              <Counter value={Math.round(factor(p50))} suffix="×" />
            </h2>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-wider uppercase text-muted">Faster, end to end</span>
              <span className="text-muted/80 text-sm mt-1">p50 from {show(p50, 'before')} on serverless to {show(p50)} on Triton and TensorRT.</span>
              <Receipt metric={p50} className="mt-3" />
            </div>
          </RevealItem>

          <RevealItem className="flex flex-col space-y-4">
            <h2 className="font-display text-6xl md:text-8xl leading-none text-success">
              <Counter value={invalidDetection.value} decimals={invalidDetection.decimals} suffix="%" />
            </h2>
            <div className="flex flex-col">
              <span className="font-mono text-sm tracking-wider uppercase text-muted">Bad photos refused</span>
              <span className="text-muted/80 text-sm mt-1">Blurred, blank and non-meter photos get &ldquo;NA&rdquo;, never a confident wrong number.</span>
              <Receipt metric={invalidDetection} className="mt-3" />
            </div>
          </RevealItem>

        </Reveal>
      </section>

      {/* SC.03: Work Grid */}
      <section id="work" className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 text-text scroll-mt-16">
        <Reveal>
          <SectionHead index="01" title="Selected Work" aside="Four pets, four projects" />
        </Reveal>

        <PetPen
          pets={[
            {
              name: 'Jinx',
              kind: 'cat',
              species: 'Cat',
              job: 'Reads electricity meters by night, and would rather say nothing than guess.',
              project: {
                id: 'meter-ocr',
                title: 'Meter OCR',
                href: '/work/meter-ocr',
                summary: "Reads meters from field photos on Triton and TensorRT, and answers NA when a photo can't be read.",
                tags: ['TensorRT', 'Triton', 'NVIDIA L4'],
              },
            },
            {
              name: 'Tobi',
              kind: 'dog',
              species: 'Retriever',
              job: 'Fetches the exact invoice line you asked for, and never leaves the house to do it.',
              project: {
                id: 'finsentinel',
                title: 'FinSentinelAI',
                href: '/work/finsentinel',
                summary: 'Question answering over invoices and bank statements with local embeddings, a reranker and Ollama. Zero external API calls.',
                tags: ['ChromaDB', 'Cross-encoder', 'Ollama'],
              },
            },
            {
              name: 'Mikey',
              kind: 'hamster',
              species: 'Hamster',
              job: 'Sorts every word image into the right bin before he takes a bite.',
              project: {
                id: 'svtrv2-ard',
                title: 'SVTRv2-ARD',
                href: '/work/svtrv2-ard',
                summary: "Learned routing into SVTRv2's resize bins plus SGM-to-CTC distillation, leaving the served model byte-identical.",
                tags: ['PyTorch', 'CTC', 'OCR'],
              },
            },
            {
              name: 'Luffy',
              kind: 'parrot',
              species: 'Parrot',
              job: 'Remembers what you said last week and says it back in your voice.',
              project: {
                id: 'echome',
                title: 'ECHOME',
                href: '/work/echome',
                summary: `An offline agent with three-tier memory and a ${show(METRICS.echome.assessmentCut)} shorter adaptive assessment.`,
                tags: ['LangGraph', 'Qdrant', 'Offline'],
              },
            },
          ]}
        />
      </section>

      {/* SC.04: Lab console (same command menu as ⌘K) */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 text-text">
        <Reveal>
          <SectionHead
            index="02"
            title="Lab"
            aside={<Link href="/lab" className="text-detect hover:text-text transition-colors">Read the meter yourself →</Link>}
          />
        </Reveal>
        <Reveal>
          <LabDock />
        </Reveal>
      </section>

      {/* SC.05: Principles */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 text-text">
        <ScrollWords
          label={<SectionHead index="03" title="Engineering Creed" />}
          lines={[
            { text: 'Measure before you claim.' },
            { text: 'Ship behind a canary.' },
            { text: 'Boring to run.', muted: true },
          ]}
        />
      </section>

      {/* SC.06: Credentials, Open Source & Studio */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 text-text border-t border-line">
        <Reveal stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <RevealItem>
            <div className="font-mono text-xs text-accent uppercase tracking-widest mb-2">04 / Credentials</div>
            <h2 className="font-display text-4xl mb-4">Lourdu Raju</h2>
            <p className="font-mono text-sm text-muted uppercase tracking-widest mb-6">
              Machine Learning Engineer at Sujanix<br/>
              Founder at spacedrift · Bengaluru, India
            </p>
            <p className="text-text/80 max-w-md leading-relaxed text-sm mb-6">
              {TRUTH.identity.mission} Author of Achilles, {achillesLabs.value} test-driven labs that rebuild the modern LLM stack, and a PhilArchive preprint on identity in persistent AI agents.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <a 
                href="/LourduRaju_Resume.pdf" 
                target="_blank"
                className="inline-flex min-h-11 items-center px-4 py-2 bg-surface border border-line hover:border-accent text-accent font-mono text-xs uppercase tracking-wider transition-colors"
                style={{ borderRadius: '6px' }}
              >
                Resume PDF ↓
              </a>
              <Link 
                href="/about"
                className="inline-flex min-h-11 items-center px-4 py-2 border border-line hover:border-text text-text font-mono text-xs uppercase tracking-wider transition-colors"
                style={{ borderRadius: '6px' }}
              >
                Full Story →
              </Link>
            </div>
          </RevealItem>
          
          <RevealItem className="grid grid-cols-2 gap-3 sm:gap-6">
            <div className="glass rounded-[var(--radius-control)] rounded-br-[var(--radius-cut)] p-4 sm:p-6">
              <div className="text-4xl font-display text-accent mb-2">{achillesTests.value}</div>
              <div className="text-[11px] sm:text-xs font-mono uppercase tracking-wider sm:tracking-widest text-muted">CI tests passing (Achilles)</div>
            </div>
            <div className="glass rounded-[var(--radius-control)] rounded-br-[var(--radius-cut)] p-4 sm:p-6">
              <div className="text-4xl font-display text-text mb-2">₹{studio.revenueLakh}L</div>
              <div className="text-[11px] sm:text-xs font-mono uppercase tracking-wider sm:tracking-widest text-muted">spacedrift revenue ({studio.clients} clients)</div>
            </div>
            <div className="glass rounded-[var(--radius-control)] rounded-br-[var(--radius-cut)] p-4 sm:p-6">
              <div className="text-4xl font-display text-detect mb-2">{achillesLabs.value}</div>
              <div className="text-[11px] sm:text-xs font-mono uppercase tracking-wider sm:tracking-widest text-muted">Test-driven AI labs</div>
            </div>
            <div className="glass rounded-[var(--radius-control)] rounded-br-[var(--radius-cut)] p-4 sm:p-6">
              <div className="text-4xl font-display text-success mb-2">{Math.round(factor(classifierCompute))}×</div>
              <div className="text-[11px] sm:text-xs font-mono uppercase tracking-wider sm:tracking-widest text-muted">TensorRT speedup ({show(classifierCompute, 'before')} → {show(classifierCompute)})</div>
            </div>
          </RevealItem>
        </Reveal>
      </section>

      {/* SC.07: Footer */}
      <footer className="relative z-10 w-full border-t border-line pt-20 sm:pt-24 pb-[max(4rem,calc(env(safe-area-inset-bottom)+3rem))] sm:pb-24 px-4 sm:px-6 flex flex-col items-center justify-center overflow-hidden">
        <Reveal className="flex flex-col items-center">
        <Magnetic strength={20}>
          <a 
            href={`mailto:${TRUTH.identity.email}`} 
            data-cursor="view"
            data-cursor-label="Say hi"
            className="glass group flex flex-col items-center justify-center text-center px-8 py-9 sm:px-12 sm:py-10 rounded-[2.5rem] sm:rounded-full hover:border-accent transition-colors"
          >
            <span className="font-display text-[2.5rem] leading-[0.95] sm:text-4xl md:text-5xl group-hover:text-accent group-active:text-accent transition-colors uppercase">
              Got a model to ship?
            </span>
          </a>
        </Magnetic>
        <CopyEmail
          email={TRUTH.identity.email}
          className="mt-4 sm:mt-6 min-h-11 rounded-full px-4 py-2 font-mono text-xs text-muted transition-colors hover:text-text"
        />
        </Reveal>

        <div className="mt-10 sm:mt-16 flex flex-wrap justify-center gap-x-6 gap-y-1 sm:gap-6 font-mono text-xs uppercase tracking-widest text-muted">
          <a href={TRUTH.identity.links.github} target="_blank" rel="noopener noreferrer" className="py-3 sm:py-0 hover:text-accent transition-colors">GitHub</a>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <a href={TRUTH.identity.links.linkedin} target="_blank" rel="noopener noreferrer" className="py-3 sm:py-0 hover:text-accent transition-colors">LinkedIn</a>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <a href={TRUTH.identity.links.kaggle} target="_blank" rel="noopener noreferrer" className="py-3 sm:py-0 hover:text-accent transition-colors">Kaggle</a>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <a href={TRUTH.identity.links.studio} target="_blank" rel="noopener noreferrer" className="py-3 sm:py-0 hover:text-accent transition-colors">spacedrift.in</a>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <a href={TRUTH.identity.links.preprint} target="_blank" rel="noopener noreferrer" className="py-3 sm:py-0 hover:text-accent transition-colors">PhilArchive</a>
        </div>

        <div className="mt-10 sm:mt-12 font-mono text-[11px] sm:text-xs leading-relaxed text-muted/60 uppercase tracking-widest text-center text-balance">
          © {new Date().getFullYear()} Lourdu Raju · Bengaluru, India · Built with Next.js, Three.js & Motion
        </div>
      </footer>
    </main>
  )
}
