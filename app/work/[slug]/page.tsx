import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { posts } from '#velite'
import { TRUTH, METRICS, show } from '@/content/truth'
import { PostSources } from '@/components/PostSources'
import { withBase } from '@/lib/path'
import { siteAddress } from '@/lib/site'
const projects: Record<
  string,
  { role: string; period: string; stack: string; impact: string; github: string; next: string }
> = {
  'svtrv2-ard': {
    role: 'Sole author',
    period: '2026',
    stack: 'PyTorch, CTC, LMDB, Union14M-L, pytest',
    impact: `${METRICS.svtrv2.tests.value} tests passing; served model unchanged`,
    github: TRUTH.identity.links.svtrv2,
    next: 'Train the benchmark baseline before the ARD ablation grid. Tests establish implementation correctness; accuracy still needs to be measured.',
  },
  echome: {
    role: 'Sole author',
    period: '2026',
    stack: 'FastAPI, LangGraph, Qdrant, IRT, Whisper, XTTSv2, Ollama',
    impact: `${show(METRICS.echome.memoryRecall)} recall; ${show(METRICS.echome.assessmentCut)} shorter assessment`,
    github: TRUTH.identity.links.echome,
    next: 'Broaden the memory evaluation beyond the current scripted scenarios, especially ambiguous and conflicting facts.',
  },
  finsentinel: {
    role: 'Sole author',
    period: '2026',
    stack: 'React, FastAPI, ChromaDB, SentenceTransformers, cross-encoder, Ollama',
    impact: 'Local finance RAG with per-user isolation inside the vector store',
    github: TRUTH.identity.links.finSentinel,
    next: 'Measure retrieval and answer quality separately, and extend evaluation beyond the synthetic corpus before making claims about real documents.',
  },
}
type Props = { params: Promise<{ slug: string }> }
export const dynamicParams = false
export function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({ slug }))
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug && !p.draft)
  return post && projects[slug]
    ? {
        title: post.title,
        description: post.summary,
        alternates: { canonical: siteAddress(`/work/${slug}/`) },
      }
    : {}
}
export default async function Project({ params }: Props) {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug && !p.draft)
  const meta = projects[slug]
  if (!post || !meta) notFound()
  return (
    <main id="content" tabIndex={-1}>
      <header className="page-header">
        <a className="mono muted" href={withBase('/#work')}>
          ← Selected work
        </a>
        <h1>{post.title}</h1>
        <p className="muted">{post.summary}</p>
      </header>
      <article className="article">
        <dl className="meta-table">
          <dt>Role</dt>
          <dd>{meta.role}</dd>
          <dt>Period</dt>
          <dd>{meta.period}</dd>
          <dt>Stack</dt>
          <dd>{meta.stack}</dd>
          <dt>Links</dt>
          <dd>
            <a href={meta.github} target="_blank" rel="noreferrer">
              Source code ↗
            </a>
          </dd>
          <dt>Results</dt>
          <dd>{meta.impact}</dd>
        </dl>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
        <PostSources slug={slug} />
        <h2>What I&apos;d do differently</h2>
        <p>{meta.next}</p>
      </article>
    </main>
  )
}
