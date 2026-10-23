import Image from 'next/image'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { posts } from '#velite'
import { TRUTH, METRICS, PREPRINT_PAGES, factor, fmt, show } from '@/content/truth'
import { NOW } from '@/content/now'
import { withBase } from '@/lib/path'
import { displayDate } from '@/lib/site'
import { Section } from '@/components/Section'
import { Receipt } from '@/components/ui/Receipt'
import { WritingList } from '@/components/WritingList'
import { Elsewhere } from '@/components/Elsewhere'
import { Experience } from '@/components/Experience'
import { ProjectVisual } from '@/components/ProjectVisual'
import { CardMotion, Reveal } from '@/components/MotionSystem'

export default function Home() {
  const { identity, studio } = TRUTH
  const m = METRICS.meterOcr
  const latest = [...posts]
    .filter((p) => !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
  const work = [
    {
      title: 'Meter OCR',
      context: 'Sujanix / Production vision',
      year: '2026',
      result: `${Math.round(factor(m.p50))}×`,
      unit: 'faster end-to-end p50',
      description:
        'From a field photograph to a reliable meter reading. Built for two state electricity utilities.',
      href: '/work/meter-ocr/',
      metric: m.p50,
      kind: 'meter' as const,
      span: 'project-featured',
    },
    {
      title: 'Achilles',
      context: 'Open source / First principles',
      year: '2025–26',
      result: String(METRICS.achilles.tests.value),
      unit: 'reference tests in CI',
      description:
        'The modern AI stack, rebuilt from autograd to FlashAttention. Learn it by making it work.',
      href: identity.links.achilles,
      metric: METRICS.achilles.tests,
      kind: 'achilles' as const,
      span: 'project-secondary',
    },
    {
      title: 'SVTRv2-ARD',
      context: 'Research / Text recognition',
      year: '2026',
      result: String(METRICS.svtrv2.tests.value),
      unit: 'tests passing',
      description:
        'Adaptive routing and distillation. A different training strategy, an unchanged served model.',
      href: '/work/svtrv2-ard/',
      metric: METRICS.svtrv2.tests,
      kind: 'svtr' as const,
      span: 'project-third',
    },
    {
      title: 'ECHOME',
      context: 'Local AI / Memory',
      year: '2026',
      result: show(METRICS.echome.memoryRecall),
      unit: 'multi-session memory recall',
      description: 'An offline agent that remembers across conversations and learns how you think.',
      href: '/work/echome/',
      metric: METRICS.echome.memoryRecall,
      kind: 'echome' as const,
      span: 'project-third',
    },
    {
      title: 'FinSentinelAI',
      context: 'Document AI / Private RAG',
      year: '2026',
      result: fmt(METRICS.finSentinel.corpus.value),
      unit: 'documents in the test corpus',
      description:
        'Ask questions of your financial documents. Retrieval and inference stay on your machine.',
      href: '/work/finsentinel/',
      metric: METRICS.finSentinel.corpus,
      kind: 'finance' as const,
      span: 'project-third',
    },
  ]
  return (
    <main id="content" tabIndex={-1}>
      <section className="hero" aria-labelledby="intro-title">
        <div className="hero-topline mono">
          <span>ML engineer / Bengaluru, IN</span>
          <span className="availability">
            <i />
            Open to collaborations
          </span>
        </div>
        <Reveal priority>
          <div className="hero-name-row">
            <h1 id="intro-title" className="name">
              Lourdhu Raju<span className="name-period">.</span>
            </h1>
            <span className="hero-direction" aria-hidden="true">
              ↗
            </span>
          </div>
        </Reveal>
        <div className="hero-bottom">
          <Reveal className="hero-manifesto" priority delay={0.06}>
            <p>
              I make vision models <br />
              fast, honest, and <br />
              <span className="muted">boring to run.</span>
            </p>
            <div className="intro-actions">
              <a className="button button-primary" href={`mailto:${identity.email}`}>
                Let&apos;s talk <span aria-hidden="true">↗</span>
              </a>
              <a
                className="button"
                href={withBase(identity.links.resume)}
                target="_blank"
                rel="noreferrer"
              >
                Résumé (PDF) <span aria-hidden="true">↗</span>
              </a>
            </div>
          </Reveal>
          <Reveal className="hero-context" delay={0.12}>
            <span className="mono eyebrow">Models are only half the work.</span>
            <p>
              I own production OCR for two state electricity utilities at Sujanix. From training
              data to GPU serving, I build the system around the model.
            </p>
            <p className="muted">
              I also run{' '}
              <a href={identity.links.studio} target="_blank" rel="noreferrer">
                spacedrift
              </a>
              , a small ML studio for document AI and reproducible research.
            </p>
            <a className="text-link mono" href={withBase('/about/')}>
              A little more about me <span aria-hidden="true">↗</span>
            </a>
          </Reveal>
          <Reveal className="hero-id" delay={0.18}>
            {existsSync(join(process.cwd(), 'public/me.jpg')) ? (
              <Image
                className="hero-portrait"
                src={withBase('/me.jpg')}
                alt="Lourdhu Raju"
                width={400}
                height={500}
                preload
              />
            ) : (
              <div className="identity-tile" aria-hidden="true">
                <div className="tile-cross top-left">+</div>
                <div className="tile-cross bottom-right">+</div>
                <span className="mono">
                  Engineering.
                  <br />
                  Independent thinking.
                </span>
                <span className="tile-monogram">LR</span>
                <div className="tile-lines">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            )}
          </Reveal>
        </div>
        <div className="hero-footnote mono muted">
          <span>
            Currently at <span className="ink">Sujanix</span> · Founder,{' '}
            <span className="ink">spacedrift</span>
          </span>
          <a href="#work">
            Explore the work <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <Section
        id="work"
        label="01 — Selected work"
        aside={
          <span>
            Production systems.
            <br />
            Research with a working implementation.
          </span>
        }
      >
        <div className="work-grid">
          {work.map((w, i) => (
            <Reveal key={w.title} className={w.span} delay={(i % 3) * 0.06}>
              <CardMotion className={`project-card ${w.kind === 'meter' ? 'featured-card' : ''}`}>
                <a
                  className="card-cover"
                  href={withBase(w.href)}
                  aria-label={`View ${w.title}`}
                  {...(w.href.startsWith('https') ? { target: '_blank', rel: 'noreferrer' } : {})}
                />
                <div className="project-heading">
                  <span className="mono muted">
                    {String(i + 1).padStart(2, '0')} / {w.context}
                  </span>
                  <span className="card-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <ProjectVisual kind={w.kind} />
                <div className="project-copy">
                  <div className="project-title-row">
                    <h3>{w.title}</h3>
                    <span className="mono muted">{w.year}</span>
                  </div>
                  <p>{w.description}</p>
                </div>
                <div className="project-receipt">
                  <div>
                    <span className="project-value">{w.result}</span>
                    <span className="mono muted project-unit">{w.unit}</span>
                  </div>
                  <Receipt metric={w.metric} compact />
                </div>
              </CardMotion>
            </Reveal>
          ))}
        </div>
        <div className="work-extras">
          <Reveal>
            <CardMotion className="paper-card">
              <a
                className="card-cover"
                href={identity.links.preprint}
                aria-label="Read No Final Save"
                target="_blank"
                rel="noreferrer"
              />
              <div>
                <span className="mono muted">06 / Independent research</span>
                <h3>
                  No Final Save<span aria-hidden="true">↗</span>
                </h3>
                <p>
                  What makes a persistent AI agent the same agent? A preprint on identity,
                  continuity, and self-preservation.
                </p>
                <div className="paper-source">
                  <span className="mono">PhilArchive · {PREPRINT_PAGES.value} pages</span>
                  <Receipt metric={PREPRINT_PAGES} compact />
                </div>
              </div>
              <ProjectVisual kind="paper" />
            </CardMotion>
          </Reveal>
        </div>
      </Section>

      <Section label="02 — Proof, not promises" aside="Measured in production. Sources included.">
        <div className="numbers">
          {[
            {
              value: fmt(m.busiestDay.value),
              label: 'Meter photos on the busiest day',
              metric: m.busiestDay,
            },
            {
              value: `${Math.round(factor(m.p50))}×`,
              label: `Faster p50 · ${show(m.p50, 'before')} → ${show(m.p50)}`,
              metric: m.p50,
            },
            {
              value: show(m.invalidDetection),
              label: 'Unreadable photos refused',
              metric: m.invalidDetection,
            },
          ].map((n, i) => (
            <Reveal key={n.label} delay={i * 0.08}>
              <div className="number-card">
                <span className="mono muted number-index">/ 0{i + 1}</span>
                <p className="number">{n.value}</p>
                <p className="number-label">{n.label}</p>
                <Receipt metric={n.metric} />
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section
        label="03 — Field notes"
        aside={
          <a className="text-link" href={withBase('/writing/')}>
            All writing <span aria-hidden="true">↗</span>
          </a>
        }
      >
        <WritingList posts={latest} />
      </Section>
      <Section
        id="elsewhere"
        label="04 — Around the internet"
        aside="Code, ideas, and the occasional detour."
      >
        <Elsewhere />
      </Section>
      <Section
        label="05 — In progress"
        aside={<a href={withBase('/now/')}>Updated {displayDate(NOW.updated)} ↗</a>}
      >
        <div className="now-grid">
          {NOW.items.slice(0, 3).map((item, i) => (
            <Reveal key={item.label} delay={i * 0.06}>
              <div className="now-card">
                <span className="mono muted">{item.label} /</span>
                <p>{item.text}</p>
                <span className="now-corner" aria-hidden="true">
                  +
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
      <section id="contact" className="contact-section">
        <Reveal>
          <div className="contact-top">
            <span className="mono">06 / Start a conversation</span>
            <span className="mono">Research · Open source · Studio work</span>
          </div>
          <h2>
            Good questions.
            <br />
            Better things, built.
          </h2>
          <div className="contact-bottom">
            <p>
              I&apos;m open to collaborations on OCR, inference and agents, studio projects through
              spacedrift, and talks or guest posts.
            </p>
            <div>
              <a className="email-link" href={`mailto:${identity.email}`}>
                {identity.email} <span aria-hidden="true">↗</span>
              </a>
              <button
                type="button"
                className="copy-button"
                data-copy-email={identity.email}
                aria-live="polite"
              >
                Copy email
              </button>
            </div>
          </div>
        </Reveal>
      </section>
      <Section label="07 — The path so far" aside={<a href={withBase('/about/')}>Full story ↗</a>}>
        <Experience />
        <div className="receipt">
          <a href={withBase(studio.source.url!)} target="_blank" rel="noreferrer">
            source · résumé ↗
          </a>
        </div>
      </Section>
    </main>
  )
}
