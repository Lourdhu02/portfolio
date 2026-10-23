import type { Metadata } from 'next'
import { NOW } from '@/content/now'
import { displayDate, siteAddress } from '@/lib/site'
export const metadata: Metadata = {
  title: 'Now',
  description: 'What I am building, learning, writing and looking for.',
  alternates: { canonical: siteAddress('/now/') },
}
export default function Now() {
  return (
    <main id="content" tabIndex={-1}>
      <header className="page-header">
        <p className="mono muted">Updated {displayDate(NOW.updated)}</p>
        <h1>Now</h1>
        <p>What has my attention in Bengaluru.</p>
      </header>
      <section className="section article" aria-label="Current work">
        <ul className="now-list">
          {NOW.items.map((item) => (
            <li key={item.label}>
              <span className="mono muted">{item.label}</span>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
