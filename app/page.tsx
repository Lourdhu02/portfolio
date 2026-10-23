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
      context: 'Sujanix, production',
      year: '2026',
      result: `${Math.round(factor(m.p50))}× faster p50`,
      href: '/work/meter-ocr/',
      metric: m.p50,
    },
    {
      title: 'Achilles',
      context: 'Open-source curriculum',
      year: '2025–26',
      result: `${METRICS.achilles.tests.value} CI tests`,
      href: identity.links.achilles,
      metric: METRICS.achilles.tests,
    },
    {
      title: 'SVTRv2-ARD',
      context: 'OCR research',
      year: '2026',
      result: `${METRICS.svtrv2.tests.value} tests`,
      href: '/work/svtrv2-ard/',
      metric: METRICS.svtrv2.tests,
    },
    {
      title: 'ECHOME',
      context: 'Offline agent',
      year: '2026',
      result: `${show(METRICS.echome.memoryRecall)} memory recall`,
      href: '/work/echome/',
      metric: METRICS.echome.memoryRecall,
    },
    {
      title: 'FinSentinelAI',
      context: 'Local RAG',
      year: '2026',
      result: `${fmt(METRICS.finSentinel.corpus.value)} test documents`,
      href: '/work/finsentinel/',
      metric: METRICS.finSentinel.corpus,
    },
    {
      title: 'No Final Save',
      context: 'Preprint, PhilArchive',
      year: '2026',
      result: `${PREPRINT_PAGES.value} pages`,
      href: identity.links.preprint,
      metric: PREPRINT_PAGES,
    },
  ]
  return (
    <main id="content" tabIndex={-1}>
      <section className="intro" aria-labelledby="intro-title">
        <div className="intro-copy">
          <p className="eyebrow mono muted">Machine learning engineer at Sujanix</p>
          <h1 id="intro-title" className="name">
            {identity.name}
          </h1>
          <p className="intro-lead">
            Machine learning engineer. I make vision models fast, honest and boring to run.
          </p>
          <p className="intro-detail">
            I own the meter-reading OCR platform for two state electricity utilities at{' '}
            <a href="https://sujanix.com" target="_blank" rel="noreferrer">
              Sujanix
            </a>
            , from training data to GPU serving. I also run{' '}
            <a href={identity.links.studio} target="_blank" rel="noreferrer">
              spacedrift
            </a>
            , a small ML studio working on document AI and reproducible research.
          </p>
          <p className="eyebrow mono">
            <span className="status-dot" aria-hidden="true" />
            Open to collaborations — research, open source, studio work.
          </p>
          <div className="intro-actions">
            <a className="button button-primary" href={`mailto:${identity.email}`}>
              Email me ↗
            </a>
            <a
              className="button"
              href={withBase(identity.links.resume)}
              target="_blank"
              rel="noreferrer"
            >
              Résumé (PDF) ↗
            </a>
          </div>
        </div>
        <figure className="portrait">
          {existsSync(join(process.cwd(), 'public/me.jpg')) ? (
            <Image src={withBase('/me.jpg')} alt="Lourdhu Raju" width={400} height={500} preload />
          ) : (
            <div className="portrait-initials" aria-label="Lourdhu Raju monogram">
              <span className="mono muted">Bengaluru, India</span>
              <span className="initials" aria-hidden="true">
                LR.
              </span>
              <span className="mono muted">
                Machine learning
                <br />& independent research
              </span>
            </div>
          )}
        </figure>
      </section>
      <Section id="work" label="01 — Selected work" aside="Production, research & open source">
        <ol className="index-list">
          {work.map((w, i) => (
            <li key={w.title} className="index-item">
              <a
                className="index-row"
                href={withBase(w.href)}
                {...(w.href.startsWith('https') ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                <span className="mono muted">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="index-title">{w.title}</h3>
                <span className="index-meta">{w.context}</span>
                <span className="mono muted index-year">{w.year}</span>
                <span className="index-stat mono">{w.result}</span>
                <span className="index-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
              <Receipt metric={w.metric} compact className="index-source" />
            </li>
          ))}
        </ol>
      </Section>
      <Section label="02 — In production" aside="Measured, with context">
        <div className="numbers">
          {[
            {
              value: fmt(m.busiestDay.value),
              label: 'Meter photos read on the busiest day',
              metric: m.busiestDay,
            },
            {
              value: `${Math.round(factor(m.p50))}×`,
              label: `Faster end to end · ${show(m.p50, 'before')} → ${show(m.p50)}`,
              metric: m.p50,
            },
            {
              value: show(m.invalidDetection),
              label: 'Unreadable photos refused',
              metric: m.invalidDetection,
            },
          ].map((n) => (
            <div key={n.label}>
              <p className="number">{n.value}</p>
              <p>{n.label}</p>
              <Receipt metric={n.metric} />
            </div>
          ))}
        </div>
      </Section>
      <Section label="03 — Writing" aside={<a href={withBase('/writing/')}>All writing ↗</a>}>
        <WritingList posts={latest} />
      </Section>
      <Section id="elsewhere" label="04 — Elsewhere" aside="Find me online">
        <Elsewhere />
      </Section>
      <Section
        label="05 — Now"
        aside={<a href={withBase('/now/')}>Updated {displayDate(NOW.updated)} ↗</a>}
      >
        <div className="two-col">
          <p className="muted">What has my attention.</p>
          <ul className="now-list">
            {NOW.items.slice(0, 3).map((item) => (
              <li key={item.label}>
                <span className="mono muted">{item.label}</span>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>
      <Section id="contact" label="06 — Collaborate">
        <div className="two-col">
          <p className="muted">Good work starts with a conversation.</p>
          <div>
            <p className="collaborate-copy">
              I&apos;m open to research collaborations on OCR, inference and agents, open-source
              work, studio projects through spacedrift, and talks or guest posts.
            </p>
            <a className="email-link" href={`mailto:${identity.email}`}>
              {identity.email}
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
      </Section>
      <Section label="07 — Experience" aside={<a href={withBase('/about/')}>More about me ↗</a>}>
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
