import Link from 'next/link'
import { TRUTH } from '@/content/truth'

export default function AboutPage() {
  return (
    <main className="relative w-full max-w-4xl mx-auto px-6 py-32 text-text">
      <Link href="/" className="inline-block font-mono text-xs uppercase tracking-widest text-muted hover:text-accent transition-colors mb-16">
        ← Back to Home
      </Link>

      <header className="mb-20">
        <div className="font-mono text-xs text-accent uppercase tracking-widest mb-3">
          Principal ML Engineer & Studio Founder
        </div>
        <h1 className="font-display text-6xl md:text-8xl leading-[0.85] mb-6 uppercase">
          Lourdu Raju
        </h1>
        <p className="font-mono text-muted uppercase tracking-widest max-w-xl leading-relaxed">
          {TRUTH.identity.mission}
        </p>
      </header>

      {/* Quick Identity Matrix */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-line mb-20 text-xs font-mono">
        <div>
          <div className="text-muted uppercase mb-1">Current Role</div>
          <div className="text-text font-medium">ML Engineer @ Sujanix</div>
        </div>
        <div>
          <div className="text-muted uppercase mb-1">Venture</div>
          <div className="text-text font-medium">Founder @ spacedrift</div>
        </div>
        <div>
          <div className="text-muted uppercase mb-1">Base</div>
          <div className="text-text font-medium">{TRUTH.identity.location}</div>
        </div>
        <div>
          <div className="text-muted uppercase mb-1">Resume</div>
          <a href="/LourduRaju_Resume.pdf" target="_blank" className="text-accent hover:underline flex items-center gap-1">
            <span>Download PDF</span>
            <span>↓</span>
          </a>
        </div>
      </section>

      {/* Story & Technical Creed */}
      <section className="mb-20 space-y-6 text-text/80 leading-relaxed text-base">
        <h2 className="font-display text-4xl text-text uppercase tracking-wide">
          The Engineering Creed
        </h2>
        <p>
          I specialize in <strong>production computer vision, edge optimization, and low-latency GPU serving</strong>. Over the last two years, I have owned a utility-scale five-model OCR pipeline from training runs to TensorRT/Triton serving, scaling from early prototypes to processing over <strong>40,000,000 live meter readings</strong> while lifting live accuracy from <strong>79% to 91%</strong>.
        </p>
        <p>
          My baseline rule is simple: <em>measure before you claim, ship behind a canary, and make deployments boring to run</em>. I don&apos;t celebrate synthetic benchmark numbers on multi-A100 clusters if the real system cannot sustain 180+ images/sec on a cost-effective NVIDIA L4 under heavy production bursts.
        </p>
      </section>

      {/* Studio / spacedrift */}
      <section className="mb-20 p-8 bg-surface border border-line" style={{ borderBottomRightRadius: '14px' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <span className="font-mono text-xs text-accent uppercase tracking-widest">Autonomous Venture</span>
            <h3 className="font-display text-3xl text-text uppercase mt-1">spacedrift</h3>
          </div>
          <a 
            href={TRUTH.identity.links.studio} 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-muted hover:text-accent transition-colors"
          >
            spacedrift.in ↗
          </a>
        </div>
        <p className="text-sm text-text/80 leading-relaxed mb-6">
          Founded and lead a 5-person ML & AI engineering studio (machine learning, Android engineering, and product strategy). We have delivered across 36 client engagements (with 6 repeat enterprise contracts), generating INR 12 lakh in revenue alongside full-time production engineering.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-line/60 pt-6 font-mono text-xs">
          <div>
            <div className="text-2xl font-display text-text">36</div>
            <div className="text-muted uppercase">Client Engagements</div>
          </div>
          <div>
            <div className="text-2xl font-display text-text">5</div>
            <div className="text-muted uppercase">Engineers</div>
          </div>
          <div>
            <div className="text-2xl font-display text-accent">₹12L</div>
            <div className="text-muted uppercase">Revenue Generated</div>
          </div>
        </div>
      </section>

      {/* Publications & Open Source */}
      <section className="mb-20">
        <h2 className="font-display text-4xl uppercase mb-8">Publications & Open Source</h2>
        <div className="space-y-6">
          
          <div className="p-6 bg-surface border border-line" style={{ borderBottomRightRadius: '12px' }}>
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="font-display text-2xl text-text">No Final Save</h3>
              <span className="font-mono text-xs text-muted">PhilArchive · 2026</span>
            </div>
            <p className="text-xs font-mono text-muted uppercase tracking-wider mb-3">
              Identity, Consciousness, and the Machine That Never Shuts Down
            </p>
            <p className="text-sm text-text/80 leading-relaxed mb-4">
              A 23-page formal research framework for persistent AI agents: causal-continuity criterion for identity, an indistinguishability proof for terminal vs instrumental self-preservation, and a developmental safety model.
            </p>
            <a 
              href={TRUTH.identity.links.preprint} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 font-mono text-xs text-accent hover:underline uppercase tracking-wider"
            >
              <span>Read Preprint on PhilArchive</span>
              <span>↗</span>
            </a>
          </div>

          <div className="p-6 bg-surface border border-line" style={{ borderBottomRightRadius: '12px' }}>
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="font-display text-2xl text-text">Achilles</h3>
              <span className="font-mono text-xs text-accent">229 CI Tests Passing</span>
            </div>
            <p className="text-xs font-mono text-muted uppercase tracking-wider mb-3">
              Core AI from First Principles · Open Source
            </p>
            <p className="text-sm text-text/80 leading-relaxed mb-4">
              An 18-lab test-driven curriculum implementing autograd engines, Llama transformers, Triton FlashAttention forward/backward kernels, KV caching, LoRA, DPO, GRPO, quantization, and MoE from scratch.
            </p>
            <a 
              href={TRUTH.identity.links.achilles} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 font-mono text-xs text-accent hover:underline uppercase tracking-wider"
            >
              <span>Inspect Code on GitHub</span>
              <span>↗</span>
            </a>
          </div>

        </div>
      </section>

      {/* Experience & Certifications */}
      <section className="mb-20">
        <h2 className="font-display text-4xl uppercase mb-8">Career & Qualifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          <div className="space-y-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted">Experience</h3>
            {TRUTH.career.map((job, idx) => (
              <div key={idx} className="border-l-2 border-line pl-4 space-y-1">
                <div className="text-sm font-medium text-text">{job.role}</div>
                <div className="text-xs font-mono text-accent">{job.company} · {job.period}</div>
                <p className="text-xs text-muted leading-relaxed mt-1">{job.description}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted">Credentials & Education</h3>
            
            {TRUTH.certifications.map((cert, idx) => (
              <div key={idx} className="border border-line bg-surface p-4" style={{ borderBottomRightRadius: '8px' }}>
                <div className="text-sm font-medium text-text">{cert.title}</div>
                <div className="text-xs font-mono text-muted mt-1">{cert.issuer} · {cert.date}</div>
              </div>
            ))}

            <div className="border border-line bg-surface p-4" style={{ borderBottomRightRadius: '8px' }}>
              <div className="text-sm font-medium text-text">{TRUTH.education.degree}</div>
              <div className="text-xs font-mono text-accent mt-1">{TRUTH.education.institution}</div>
              <div className="text-[11px] font-mono text-muted mt-1">{TRUTH.education.location} · Class of {TRUTH.education.graduation}</div>
            </div>
          </div>

        </div>
      </section>

      {/* Connect */}
      <footer className="border-t border-line pt-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="font-display text-2xl uppercase">Ready to talk systems?</div>
          <div className="font-mono text-xs text-muted mt-1">{TRUTH.identity.email} · {TRUTH.identity.phone}</div>
        </div>
        <div className="flex gap-4 font-mono text-xs uppercase tracking-wider">
          <a href={TRUTH.identity.links.github} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-text">GitHub ↗</a>
          <a href={TRUTH.identity.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-text">LinkedIn ↗</a>
          <a href={TRUTH.identity.links.kaggle} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-text">Kaggle ↗</a>
        </div>
      </footer>

    </main>
  )
}
