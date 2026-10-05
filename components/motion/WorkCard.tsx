"use client"
import { m, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import Link from 'next/link'
import { spring } from '@/lib/tokens'

interface WorkCardProps {
  id: string;
  title: string;
  kicker: string;
  href: string;
  index?: number;
  // Revealed on hover / keyboard focus; shown under the title on touch screens.
  summary?: string;
  stack?: string[];
  children?: React.ReactNode;
}

export function WorkCard({ id, title, kicker, href, index, summary, stack = [], children }: WorkCardProps) {
  const reduce = useReducedMotion()

  // Pointer position within the card, 0..1 on each axis
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, spring.ui)
  const sy = useSpring(py, spring.ui)

  const rotateX = useTransform(sy, [0, 1], [5, -5])
  const rotateY = useTransform(sx, [0, 1], [-6, 6])
  const glowX = useTransform(sx, (v) => `${v * 100}%`)
  const glowY = useTransform(sy, (v) => `${v * 100}%`)
  const maskImage = useMotionTemplate`radial-gradient(420px at ${glowX} ${glowY}, white, transparent 75%)`

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - left) / width)
    py.set((e.clientY - top) / height)
  }

  function onPointerLeave() {
    px.set(0.5)
    py.set(0.5)
  }

  const number = index !== undefined ? String(index).padStart(2, '0') : undefined

  return (
    <Link
      href={href}
      data-cursor="view"
      data-cursor-label="Open"
      className="group relative flex flex-col space-y-4 rounded-none outline-none [perspective:1200px]"
    >
      <m.div
        layoutId={`cover-${id}`}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", ...spring.ui }}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative aspect-video w-full overflow-hidden rounded-none bg-surface rounded-br-[var(--radius-cut)] group-focus-visible:ring-2 group-focus-visible:ring-accent group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-bg"
      >
        {/* Cover composition recedes as the reveal panel rises */}
        <div className="absolute inset-0 z-0 transition-[transform,filter,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover:scale-[1.04] group-hover:opacity-35 group-hover:blur-[2px] group-focus-visible:opacity-35 group-focus-visible:blur-[2px]">
          {children}
        </div>

        {/* Pointer-following spotlight */}
        <m.div
          className="pointer-events-none absolute inset-0 z-10 bg-white/[0.06] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ maskImage, WebkitMaskImage: maskImage }}
        />

        {/* Hover / focus reveal */}
        {(summary || stack.length > 0) && (
          <div className="absolute inset-0 z-20 hidden flex-col justify-end p-6 [@media(hover:hover)]:flex">
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
            <div className="relative translate-y-6 opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:translate-y-0 motion-reduce:transition-opacity group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              {summary && <p className="mb-4 max-w-md text-sm leading-relaxed text-text md:text-base">{summary}</p>}
              {stack.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label="Stack">
                  {stack.map((s, i) => (
                    <li
                      key={s}
                      style={{ transitionDelay: `${80 + i * 40}ms` }}
                      className="translate-y-2 rounded-full border border-line bg-bg/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted opacity-0 transition-[transform,opacity] duration-300 motion-reduce:translate-y-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Border with accent sweep on hover */}
        <div className="pointer-events-none absolute inset-0 z-30 rounded-none rounded-br-[var(--radius-cut)] border border-line transition-colors duration-300 group-hover:border-accent/50" />
        <div className="pointer-events-none absolute bottom-0 left-0 z-30 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover:scale-x-100 group-focus-visible:scale-x-100" />
      </m.div>

      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            {number && <span className="mr-3 text-accent">{number}</span>}
            {kicker}
          </span>
          <h3 className="font-display text-4xl transition-colors duration-300 group-hover:text-accent group-focus-visible:text-accent">{title}</h3>
          {summary && <p className="pt-1 text-sm text-muted [@media(hover:hover)]:hidden">{summary}</p>}
        </div>
        <span
          aria-hidden="true"
          className="mb-1 flex h-10 w-10 shrink-0 -translate-x-3 items-center justify-center rounded-full border border-line font-mono text-sm text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:border-accent group-hover:text-accent group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        >
          →
        </span>
      </div>
    </Link>
  )
}
