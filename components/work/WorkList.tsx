import Link from 'next/link'

export interface Project {
  title: string
  href: string
  role: string
  summary: string
  tags: string[]
}

// Selected Work: one glass panel per project, each set on a different stretch of a 12-column
// grid, so the list steps across the page instead of stacking.
const PLACEMENT = [
  'lg:col-start-1 lg:col-end-9',
  'lg:col-start-5 lg:col-end-13',
  'lg:col-start-2 lg:col-end-10',
  'lg:col-start-4 lg:col-end-12',
]

export function WorkList({ projects }: { projects: Project[] }) {
  return (
    <ol className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-y-8">
      {projects.map((p, i) => (
        <li key={p.href} className={`glass-float ${PLACEMENT[i % PLACEMENT.length]}`}>
          <Link
            href={p.href}
            data-cursor="view"
            data-cursor-label={`Open ${p.title}`}
            className="glass group grid h-full gap-4 p-6 outline-none focus-visible:ring-2 focus-visible:ring-accent sm:grid-cols-[auto_1fr_auto] sm:items-end sm:gap-8 sm:p-9"
          >
            <span className="font-mono text-xs text-muted">0{i + 1}</span>
            <div className="min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{p.role}</span>
              <h3 className="mt-1 font-display text-5xl uppercase leading-[0.9] tracking-tight transition-colors group-hover:text-accent sm:text-7xl">{p.title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-text/70">{p.summary}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <li key={t} className="border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">{t}</li>
                ))}
              </ul>
            </div>
            <span aria-hidden="true" className="grid h-11 w-11 place-items-center border border-line transition-all duration-300 group-hover:-rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-white">→</span>
          </Link>
        </li>
      ))}
    </ol>
  )
}
