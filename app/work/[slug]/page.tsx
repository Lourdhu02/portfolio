import { notFound } from 'next/navigation'
import { posts } from '#velite'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Work projects metadata for deep case-study context
const PROJECTS_META: Record<string, { role: string; timeline: string; stack: string; impact: string; github?: string }> = {
  'svtrv2-ard': {
    role: 'ML Engineer',
    timeline: '2025 – 2026',
    stack: 'PyTorch, Triton, SDPA, SVTRv2',
    impact: '87.7% → 90.1% Exact Match, 3.8× Faster Training',
    github: 'https://github.com/Lourdhu02'
  },
  'echome': {
    role: 'Lead ML Engineer',
    timeline: '2025',
    stack: 'LangGraph, Qdrant, IRT, Whisper, XTTSv2',
    impact: '11/12 Fact Recall @ 1ms, 50% Shorter Personality Tests',
    github: 'https://github.com/Lourdhu02/echome'
  },
  'finsentinel': {
    role: 'AI Architect',
    timeline: '2024 – 2025',
    stack: 'FastAPI, Ollama, ChromaDB, BM25, Cross-Encoder',
    impact: '15% → 100% ID Lookup Retrieval, Zero Leakage Private RAG',
    github: 'https://github.com/Lourdhu02/fin-sentinal.ai'
  }
}

export default async function WorkSlugPage({ params }: PageProps) {
  const { slug } = await params
  
  const post = posts.find(p => p.slug === slug)

  if (!post) {
    notFound()
  }

  const meta = PROJECTS_META[slug] || {
    role: 'Machine Learning Engineer',
    timeline: '2025 – 2026',
    stack: 'Deep Learning, GPU Inference',
    impact: 'Production Performance'
  }

  return (
    <main className="relative w-full max-w-4xl mx-auto px-6 py-32 text-text">
      <Link href="/#work" className="inline-block font-mono text-xs uppercase tracking-widest text-muted hover:text-accent transition-colors mb-16">
        ← Back to Work
      </Link>
      
      <header className="mb-16">
        <h1 className="font-display text-6xl md:text-8xl leading-[0.85] mb-6 uppercase">
          {post.title}
        </h1>
        <p className="font-mono text-muted uppercase tracking-widest">{post.summary}</p>
      </header>

      {/* TL;DR Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-line mb-16">
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
