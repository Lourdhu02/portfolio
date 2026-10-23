import { displayDate, readingTime } from '@/lib/site'
import { withBase } from '@/lib/path'
export function WritingList({
  posts,
}: {
  posts: { slug: string; title: string; date: string; content: string }[]
}) {
  return (
    <ul className="index-list">
      {posts.map((post) => (
        <li className="index-item" key={post.slug}>
          <a className="writing-row" href={withBase(`/writing/${post.slug}/`)}>
            <time dateTime={post.date} className="mono muted">
              {displayDate(post.date)}
            </time>
            <h3 className="index-title">{post.title}</h3>
            <span className="mono muted reading-time">{readingTime(post.content)} min</span>
            <span className="index-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
