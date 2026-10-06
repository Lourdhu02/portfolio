"use client"
import Link from 'next/link'
import { ViewTransition, useEffect, useRef } from 'react'
import { SnapRail } from '@/components/ui/SnapRail'
import { PetArt, type PetKind } from './PetArt'

export interface Pet {
  name: string
  kind: PetKind
  species: string
  // One line on what the pet does for its project, in the pet's voice
  job: string
  project: { id: string; title: string; href: string; summary: string; tags: string[] }
}

// The home page's four pets, one per project. Every card is a glass panel over the cube
// lattice, and each pet's eyes follow the mouse; touch devices get an idle glance instead.
export function PetPen({ pets }: { pets: Pet[] }) {
  const cards = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    let x = 0
    let y = 0

    function update() {
      frame = 0
      for (const card of cards.current) {
        if (!card) continue
        const r = card.getBoundingClientRect()
        if (r.bottom < 0 || r.top > window.innerHeight) continue
        // Aim from roughly where the pet's eyes are: upper middle of the art square
        const dx = x - (r.left + r.width / 2)
        const dy = y - (r.top + r.width * 0.42)
        const d = Math.hypot(dx, dy) || 1
        const reach = Math.min(1, d / 160)
        card.style.setProperty('--look-x', ((dx / d) * reach).toFixed(3))
        card.style.setProperty('--look-y', ((dy / d) * reach).toFixed(3))
      }
    }
    function onMove(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return
      x = e.clientX
      y = e.clientY
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <SnapRail label="Pets and their projects" desktopClassName="lg:grid-cols-4 lg:gap-5">
      {pets.map((pet, i) => (
        <Link
          key={pet.name}
          ref={(el) => { cards.current[i] = el }}
          href={pet.project.href}
          data-cursor="view"
          data-cursor-label={`Visit ${pet.name}`}
          className="pet-card glass group flex h-full flex-col rounded-[22px] rounded-br-[var(--radius-cut)] p-5 outline-none transition-[border-color] duration-300 hover:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-bg"
          style={{ '--i': i } as React.CSSProperties}
        >
          <div className="relative -mx-1 aspect-square">
            <PetArt kind={pet.kind} className="absolute inset-[6%] h-[88%] w-[88%]" />
          </div>

          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                0{i + 1} · {pet.species}
              </span>
              <h3 className="font-display text-5xl uppercase leading-[0.9] tracking-tight">{pet.name}</h3>
            </div>
            <span aria-hidden="true" className="mb-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-text transition-all duration-300 group-hover:-rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-bg group-focus-visible:-rotate-45 group-focus-visible:bg-accent group-focus-visible:text-bg">
              →
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-text/75 lg:min-h-[4.5rem]">{pet.job}</p>

          <div className="mt-auto pt-5">
            <div className="border-t border-line pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Looks after</span>
              {/* Morphs into the case study's h1 on navigation (globals.css, "Shared title") */}
              <ViewTransition name={`work-title-${pet.project.id}`} share="morph" default="none">
                <span className="mt-1 block w-fit font-display text-2xl uppercase leading-none">{pet.project.title}</span>
              </ViewTransition>
              <p className="mt-2 text-[13px] leading-relaxed text-text/60">{pet.project.summary}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {pet.project.tags.map((t) => (
                  <li key={t} className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </Link>
      ))}
    </SnapRail>
  )
}
