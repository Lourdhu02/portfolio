import { displayDate, readingTime } from '@/lib/site'
import { withBase } from '@/lib/path'
import { Reveal } from './MotionSystem'
export function WritingList({
  posts,
}: {
  posts: { slug: string; title: string; date: string; content: string }[]
}) {
  return (
    <ul className="index-list writing-grid">
      {posts.map((post, i) => (
        <li key={post.slug}>
          <Reveal delay={(i % 3) * 0.06}>
            <a className="writing-card" href={withBase(`/writing/${post.slug}/`)}>
              <div className="writing-card-top mono">
                <span>Field note / {String(i + 1).padStart(2, '0')}</span>
                <time dateTime={post.date} className="mono muted">
                  {displayDate(post.date)}
                </time>
              </div>
              <h3 className="index-title">{post.title}</h3>
              <div className="writing-card-footer mono">
                <span>{readingTime(post.content)} min read</span>
                <span aria-hidden="true">↗</span>
              </div>
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  )
}
