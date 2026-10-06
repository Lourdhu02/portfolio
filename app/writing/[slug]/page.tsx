import { notFound } from 'next/navigation'
import { posts } from '#velite'
import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find(p => p.slug === slug)
  if (!post) return {}
  const url = `/writing/${slug}`
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: url },
    openGraph: { type: 'article', title: post.title, description: post.summary, url, publishedTime: post.date },
  }
}

export default async function WritingSlugPage({ params }: PageProps) {
  const { slug } = await params
  
  const post = posts.find(p => p.slug === slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="relative w-full max-w-5xl px-5 sm:px-10 lg:ml-[14vw] lg:px-0 pt-24 pb-16 sm:py-32 text-text">
      <Link href="/writing" className="inline-block font-mono text-xs uppercase tracking-widest text-muted hover:text-accent transition-colors -mt-2 py-2 mb-8 sm:mb-14">
        ← Back to Writing
      </Link>
      
      <header className="mb-10 sm:mb-16">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted uppercase tracking-widest mb-4">
          <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>·</span>
          <span>Engineering Note</span>
        </div>
        <h1 className="font-display text-[2.75rem] sm:text-5xl md:text-7xl leading-[0.95] mb-6">
          {post.title}
        </h1>
        <p className="font-mono text-muted text-sm uppercase tracking-wider">{post.summary}</p>
      </header>
      
      <article className="prose prose-p:text-text/80 prose-headings:font-display prose-headings:font-normal prose-a:text-accent prose-code:font-mono prose-code:text-accent max-w-none">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      <footer className="mt-16 sm:mt-24 pt-8 border-t border-line flex flex-wrap gap-4 justify-between items-center font-mono text-xs text-muted">
        <Link href="/writing" className="hover:text-accent transition-colors uppercase tracking-widest">
          ← All Articles
        </Link>
        <Link href="/#work" className="hover:text-accent transition-colors uppercase tracking-widest">
          View Projects →
        </Link>
      </footer>
    </main>
  )
}

export function generateStaticParams() {
  return posts.map(post => ({
    slug: post.slug
  }))
}
