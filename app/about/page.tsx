import type { Metadata } from 'next'
import { TRUTH, METRICS, factor, show } from '@/content/truth'
import { Section } from '@/components/Section'
import { Experience } from '@/components/Experience'
import { Receipt, SourceLink } from '@/components/ui/Receipt'
import { withBase } from '@/lib/path'
import { siteAddress } from '@/lib/site'
export const metadata: Metadata = {
  title: 'About',
  description:
    'Machine learning engineer at Sujanix, founder of spacedrift, and independent researcher in Bengaluru.',
  alternates: { canonical: siteAddress('/about/') },
}
export default function About() {
  const m = METRICS.meterOcr
  return (
    <main id="content" tabIndex={-1}>
      <header className="page-header">
        <a className="mono muted" href={withBase('/')}>
          ← Home
        </a>
        <h1>About {TRUTH.identity.name}</h1>
        <p>{TRUTH.identity.mission}</p>
      </header>
      <Section label="01 — The work">
        <div className="article">
          <p>
            I work where models meet production: computer vision, TensorRT, and GPU serving. At
            Sujanix I own the meter-reading OCR platform for two state electricity utilities, from
            training data to {m.engines.value} TensorRT FP16 engines behind Triton.
          </p>
          <Receipt metric={m.engines} />
          <p>
            The service handled {m.busiestDay.value.toLocaleString('en-US')} requests on its busiest
            day. The GPU path answers {Math.round(factor(m.p50))}× faster than the serverless path:{' '}
            {show(m.p50, 'before')} to {show(m.p50)} p50 on the same photos.
          </p>
          <Receipt metric={m.busiestDay} />
          <Receipt metric={m.p50} />
          <p>
            My rule is simple: measure before you claim, ship behind a canary, and make deployments
            boring to run. When the faster path read {show(m.canaryGap)} against serverless&apos;s{' '}
            {show(m.canaryGap, 'before')}, that gap set the rollout pace.
          </p>
          <Receipt metric={m.canaryGap} />
        </div>
      </Section>
      <Section label="02 — spacedrift">
        <div className="article">
          <p>
            I founded and run a {TRUTH.studio.team}-person ML studio alongside my full-time role. We
            work on document AI and reproducible research operations. We have worked with{' '}
            {TRUTH.studio.clients} clients, including {TRUTH.studio.repeatClients} repeat clients,
            and generated INR {TRUTH.studio.revenueLakh} lakh in revenue from fixed-scope work.
          </p>
          <div className="receipt">
            <SourceLink source={TRUTH.studio.source} />
          </div>
          <a href={TRUTH.identity.links.studio} target="_blank" rel="noreferrer">
            Visit spacedrift ↗
          </a>
        </div>
      </Section>
      <Section label="03 — Publications & open source">
        <div className="article">
          {TRUTH.publications.map((p) => (
            <div key={p.title}>
              <h3>
                <a href={p.url} target="_blank" rel="noreferrer">
                  {p.title} ↗
                </a>
              </h3>
              <p className="mono muted">
                {p.venue} · {p.year}
              </p>
              <p>{p.description}</p>
              <div className="receipt">
                <a href={p.url} target="_blank" rel="noreferrer">
                  source ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section label="04 — Experience & credentials">
        <Experience />
      </Section>
      <Section label="05 — Get in touch">
        <a href={`mailto:${TRUTH.identity.email}`}>{TRUTH.identity.email}</a>
        <div className="intro-actions">
          <a
            className="button"
            href={withBase(TRUTH.identity.links.resume)}
            target="_blank"
            rel="noreferrer"
          >
            Résumé (PDF) ↗
          </a>
        </div>
      </Section>
    </main>
  )
}
