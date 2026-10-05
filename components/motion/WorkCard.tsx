"use client"
import { m, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import Link from 'next/link'
import { ViewTransition } from 'react'
import { spring } from '@/lib/tokens'

interface WorkCardProps {
  id: string;
  title: string;
  kicker: string;
  href: string;
  index: string;
  summary?: string;
  tags?: string[];
  aspect?: string;
  className?: string;
  children?: React.ReactNode;
}

export function WorkCard({ id, title, kicker, href, index, summary, tags = [], aspect = 'aspect-video', className = '', children }: WorkCardProps) {
  const reduce = useReducedMotion()

  // Pointer position within the cover, 0..1 on each axis (mouse only)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, spring.ui)
  const sy = useSpring(py, spring.ui)

  const rotateX = useTransform(sy, [0, 1], [4, -4])
  const rotateY = useTransform(sx, [0, 1], [-5, 5])
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

  return (
    <Link
      href={href}
      data-cursor="view"
      data-cursor-label="Open"
      className={`group relative flex flex-col gap-5 outline-none [perspective:1400px] ${className}`}
    >
      <m.div
        layoutId={`cover-${id}`}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", ...spring.ui }}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={`relative overflow-hidden bg-surface ${aspect} w-full rounded-none rounded-br-[var(--radius-cut)] group-focus-visible:ring-2 group-focus-visible:ring-accent group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-bg`}
      >
        {/* Media / Code composition: eases in on hover and focus */}
        <div className="absolute inset-0 z-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none group-hover:scale-[1.03] group-focus-visible:scale-[1.03]">
          {children}
        </div>

        {/* Pointer-following spotlight */}
        <m.div
          className="pointer-events-none absolute inset-0 z-10 bg-white/[0.06] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ maskImage, WebkitMaskImage: maskImage }}
        />

        {/* Hover / focus reveal: case-study prompt rises from the bottom edge */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end bg-gradient-to-t from-bg/90 via-bg/50 to-transparent px-5 pb-4 pt-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="translate-y-3 font-mono text-[11px] uppercase tracking-[0.2em] text-text transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:translate-y-0 group-hover:translate-y-0 group-focus-visible:translate-y-0">
            Read the case study <span className="text-accent">→</span>
          </span>
        </div>

        {/* Border */}
        <div className="pointer-events-none absolute inset-0 z-30 rounded-none rounded-br-[var(--radius-cut)] border border-line transition-colors duration-300 group-hover:border-muted/40" />
        {/* Accent rule that draws in on hover */}
        <div className="pointer-events-none absolute left-0 top-0 z-30 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
      </m.div>

      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-x-4 gap-y-1">
        <span className="font-mono text-xs text-accent pt-1.5">{index}</span>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">{kicker}</span>
          {/* Morphs into the case study's h1 on navigation (globals.css, "Shared title") */}
          <ViewTransition name={`work-title-${id}`} share="morph" default="none">
            <h3 className="font-display text-4xl md:text-5xl uppercase leading-[0.9] tracking-tight w-fit">{title}</h3>
          </ViewTransition>
          {summary && <p className="mt-2 max-w-md text-sm leading-relaxed text-text/70">{summary}</p>}
          {tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <li key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">{t}</li>
              ))}
            </ul>
          )}
        </div>
        <span aria-hidden="true" className="mt-1 grid h-10 w-10 place-items-center rounded-full border border-line text-text transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-bg group-hover:-rotate-45 group-focus-visible:border-accent group-focus-visible:bg-accent group-focus-visible:text-bg group-focus-visible:-rotate-45">
          →
        </span>
      </div>
    </Link>
  )
}
