import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { posts } from '#velite'
import { withBase } from '@/lib/path'
import { siteAddress, displayDate, readingTime } from '@/lib/site'
import { PostSources } from '@/components/PostSources'
type Props = { params: Promise<{ slug: string }> }
export const dynamicParams = false
export function generateStaticParams() {
  return posts.filter((p) => !p.draft).map(({ slug }) => ({ slug }))
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug && !p.draft)
  return post
    ? {
        title: post.title,
        description: post.summary,
        alternates: { canonical: siteAddress(`/writing/${slug}/`) },
        openGraph: {
          type: 'article',
          title: post.title,
          description: post.summary,
          url: siteAddress(`/writing/${slug}/`),
          publishedTime: post.date,
        },
      }
    : {}
}
export default async function Article({ params }: Props) {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug && !p.draft)
  if (!post) notFound()
  return (
    <main id="content" tabIndex={-1}>
      <header className="page-header">
        <a className="mono muted" href={withBase('/writing/')}>
          ← All writing
        </a>
        <p className="mono muted">
          <time dateTime={post.date}>{displayDate(post.date)}</time> · {readingTime(post.content)}{' '}
          min read
        </p>
        <h1>{post.title}</h1>
        <p className="muted">{post.summary}</p>
      </header>
      <article className="article">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
        <PostSources slug={slug} />
      </article>
    </main>
  )
}
