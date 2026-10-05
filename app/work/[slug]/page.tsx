import { notFound } from 'next/navigation'
import { posts } from '#velite'
import Link from 'next/link'
import type { Metadata } from 'next'
import { TRUTH, METRICS, show } from '@/content/truth'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find(p => p.slug === slug)
  if (!post) return {}
  const url = `/work/${slug}`
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: url },
    openGraph: { type: 'article', title: post.title, description: post.summary, url, publishedTime: post.date },
  }
}

// Case-study header for each project. Figures come from content/truth.ts.
const PROJECTS_META: Record<string, { role: string; timeline: string; stack: string; impact: string; github?: string }> = {
  'svtrv2-ard': {
    role: 'Sole author',
    timeline: '2026',
    stack: 'PyTorch, CTC, LMDB, Union14M-L, pytest',
    impact: `ARD method shipped with ${METRICS.svtrv2.tests.value}/${METRICS.svtrv2.tests.value} tests passing; served model unchanged`,
    github: TRUTH.identity.links.svtrv2
  },
  'echome': {
    role: 'Sole author',
    timeline: '2026',
    stack: 'FastAPI, LangGraph, Qdrant, IRT, Whisper, XTTSv2, Ollama',
    impact: `${show(METRICS.echome.memoryRecall)} memory recall vs 0% without; ${show(METRICS.echome.assessmentCut)} shorter assessment`,
    github: TRUTH.identity.links.echome
  },
  'finsentinel': {
    role: 'Sole author',
    timeline: '2026',
    stack: 'React, FastAPI, ChromaDB, SentenceTransformers, cross-encoder, Ollama',
    impact: 'Fully local finance RAG with per-user isolation inside the vector store',
    github: TRUTH.identity.links.finSentinel
  }
}

export default async function WorkSlugPage({ params }: PageProps) {
  const { slug } = await params
  
  const post = posts.find(p => p.slug === slug)

  if (!post) {
    notFound()
  }

  const meta = PROJECTS_META[slug] || {
    role: 'Sole author',
    timeline: '2026',
    stack: post.tags.join(', '),
    impact: post.summary
  }

  return (
    <main className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16 sm:py-32 text-text">
      <Link href="/#work" className="inline-block font-mono text-xs uppercase tracking-widest text-muted hover:text-accent transition-colors -mt-2 py-2 mb-8 sm:mb-14">
        ← Back to Work
      </Link>
      
      <header className="mb-10 sm:mb-16">
        <h1 className="font-display text-[clamp(3.25rem,16vw,3.75rem)] sm:text-6xl md:text-8xl leading-[0.85] mb-6 uppercase">
          {post.title}
        </h1>
        <p className="font-mono text-xs sm:text-base text-muted uppercase tracking-wider sm:tracking-widest">{post.summary}</p>
      </header>

      {/* TL;DR Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 sm:gap-8 py-8 border-y border-line mb-12 sm:mb-16">
        <div>
          <div className="text-xs font-mono text-muted mb-2">ROLE</div>
          <div className="text-sm font-medium">{meta.role}</div>
        </div>
        <div>
          <div className="text-xs font-mono text-muted mb-2">TIMELINE</div>
          <div className="text-sm font-medium">{meta.timeline}</div>
        </div>
        <div>
          <div className="text-xs font-mono text-muted mb-2">STACK</div>
          <div className="text-sm font-medium">{meta.stack}</div>
        </div>
        <div>
          <div className="text-xs font-mono text-muted mb-2">IMPACT</div>
          <div className="text-sm font-medium text-success">{meta.impact}</div>
        </div>
      </section>
      
      <article className="prose prose-invert prose-p:text-text/80 prose-headings:font-display prose-headings:font-normal prose-a:text-accent prose-code:font-mono prose-code:text-accent max-w-none mb-16">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      {meta.github && (
        <div className="pt-8 border-t border-line flex justify-between items-center">
          <a 
            href={meta.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent hover:underline"
          >
            <span>View Source on GitHub</span>
            <span>↗</span>
          </a>
          <Link href="/#work" className="font-mono text-xs uppercase tracking-widest text-muted hover:text-text transition-colors">
            All Projects →
          </Link>
        </div>
      )}
    </main>
  )
}

export function generateStaticParams() {
  return [
    { slug: 'svtrv2-ard' },
    { slug: 'echome' },
    { slug: 'finsentinel' }
  ]
}
