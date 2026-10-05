import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Post-mortems, inference notes and research by Lourdu Raju. Every number links back to where it was measured.',
  alternates: { canonical: '/writing' },
}
import { posts } from '#velite'

export default function WritingIndexPage() {
  // Sort posts by date descending
  const sortedPosts = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <main className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16 sm:py-32 text-text">
      <Link href="/" className="inline-block font-mono text-xs uppercase tracking-widest text-muted hover:text-accent transition-colors -mt-2 py-2 mb-8 sm:mb-14">
        ← Back to Home
      </Link>

      <header className="mb-10 sm:mb-20">
        <h1 className="font-display text-[clamp(3.25rem,16vw,3.75rem)] sm:text-6xl md:text-8xl leading-[0.85] mb-6 uppercase">
          Writing
        </h1>
        <p className="font-mono text-xs sm:text-base text-muted uppercase tracking-wider sm:tracking-widest max-w-xl">
          Post-mortems, inference notes and research. Every number links back to where it was measured.
        </p>
      </header>

      <section className="space-y-2">
        <div className="border-b border-line pb-4 mb-6 flex justify-between text-xs font-mono text-muted uppercase tracking-widest">
          <span>Article & Overview</span>
          <span>Date</span>
        </div>
        
        {sortedPosts.map((post) => (
          <Link key={post.slug} href={`/writing/${post.slug}`} className="group block w-full py-6 border-b border-line/40 hover:border-accent transition-colors">
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
              <div className="space-y-1">
                <h3 className="font-display text-2xl group-hover:text-accent transition-colors tracking-wide">
                  {post.title}
                </h3>
                <p className="font-mono text-xs text-muted leading-relaxed max-w-2xl">
                  {post.summary}
                </p>
              </div>
              <div className="font-mono text-xs text-muted whitespace-nowrap pt-1">
                {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
