import Link from 'next/link'
import { TRUTH } from '@/content/truth'

// The typographic frame around the particle name: meta row, tagline, calls to action and a scroll cue.
// Server-rendered so the tagline and CTAs are in the first HTML paint, before the canvas boots.
export function HeroOverlay() {
  const { role, focus, company, location, headline, links } = TRUTH.identity

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-6 pb-8 pt-28 md:px-12 md:pb-10">
      {/* Viewfinder corners */}
      <div aria-hidden="true" className="absolute inset-x-4 bottom-4 top-20 md:inset-x-6 md:bottom-6">
        <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-text/25" />
        <span className="absolute right-0 top-0 h-4 w-4 border-r border-t border-text/25" />
        <span className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-text/25" />
        <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-text/25" />
      </div>

      {/* Meta row */}
      <div className="hero-in grid grid-cols-2 gap-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted lg:grid-cols-[1fr_auto_1fr]" style={{ '--d': '0.2s' } as React.CSSProperties}>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent hero-blink" />
          <span>{role}</span>
        </div>
        <div className="hidden whitespace-nowrap text-center lg:block">{focus}</div>
        <div className="text-right">{location}</div>
      </div>

      {/* Tagline + CTAs: pinned low and left, off the axis of the centred particle name */}
      <div className="absolute left-5 right-5 top-[62%] flex max-w-xl flex-col items-start text-left sm:left-10 lg:left-16 lg:top-[66%]">
        <p className="hero-in hero-lcp text-balance text-lg leading-snug text-text/85 md:text-2xl" style={{ '--d': '1.6s' } as React.CSSProperties}>
          {headline}
        </p>
        <div className="hero-in pointer-events-auto mt-8 flex flex-wrap items-center justify-start gap-3" style={{ '--d': '1.9s' } as React.CSSProperties}>
          <Link
            href="#work"
            className="group inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-widest text-bg transition-colors hover:bg-text"
          >
            View selected work
            <span aria-hidden="true" className="transition-transform group-hover:translate-y-0.5">↓</span>
          </Link>
          <a
            href={links.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="glass inline-flex items-center gap-3 rounded-full px-6 py-3 font-mono text-xs uppercase tracking-widest text-text transition-colors hover:border-text"
          >
            Résumé
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="hero-in grid grid-cols-2 items-end font-mono text-[11px] uppercase tracking-[0.2em] text-muted md:grid-cols-3" style={{ '--d': '2.2s' } as React.CSSProperties}>
        <div>
          Now at <span className="text-text">{company}</span>
        </div>
        <div aria-hidden="true" className="hidden flex-col items-center gap-3 md:flex">
          <span>Scroll</span>
          <span className="relative h-10 w-px overflow-hidden bg-line">
            <span className="absolute inset-x-0 top-0 h-1/2 bg-text hero-scroll" />
          </span>
        </div>
        <div className="pointer-events-auto flex justify-end gap-5">
          <a href={links.github} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-text">GitHub</a>
          <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-text">LinkedIn</a>
        </div>
      </div>
    </div>
  )
}
