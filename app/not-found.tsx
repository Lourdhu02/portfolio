import { withBase } from '@/lib/path'
export default function NotFound() {
  return (
    <main id="content" tabIndex={-1} className="page-header">
      <h1>Page not found.</h1>
      <p>
        <a href={withBase('/')}>Back home ↗</a>
      </p>
    </main>
  )
}
