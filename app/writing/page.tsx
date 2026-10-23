import type { Metadata } from 'next'
import { posts } from '#velite'
import { WritingList } from '@/components/WritingList'
import { siteAddress } from '@/lib/site'
export const metadata: Metadata = {
  title: 'Writing',
  description: 'Post-mortems, inference notes and research by Lourdhu Raju.',
  alternates: { canonical: siteAddress('/writing/') },
}
export default function Writing() {
  const published = [...posts].filter((p) => !p.draft).sort((a, b) => b.date.localeCompare(a.date))
  return (
    <main id="content" tabIndex={-1}>
      <header className="page-header">
        <p className="mono muted">Notes from the work</p>
        <h1>Writing</h1>
        <p>
          Post-mortems, inference notes and research. What worked, what broke, and how I measured
          it.
        </p>
      </header>
      <section className="section" aria-label="Articles">
        <WritingList posts={published} />
      </section>
    </main>
  )
}
