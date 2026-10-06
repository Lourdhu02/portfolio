"use client"
import { useRef } from 'react'
import { HeroScroll } from '@/components/motion/HeroScroll'

// SC.01 stage: the name, set large and anchored left. HeroOverlay (the frame, tagline, CTAs and
// meta rows) is passed in as children; HeroScroll owns the scroll-out.
export function HeroStage({ children }: { children: React.ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <HeroScroll sectionRef={sectionRef}>
      <div className="pointer-events-none absolute inset-0 z-[5] flex items-start px-5 pt-[24svh] sm:px-10 lg:px-16 lg:pt-[20svh]">
        <h1 className="font-display font-black uppercase text-text text-left leading-[0.86] tracking-[0.01em] text-[clamp(64px,16vw,240px)]">
          <span className="block">Lourdu</span>
          <span className="block lg:pl-[12vw]">Raju</span>
        </h1>
      </div>

      {children}
    </HeroScroll>
  )
}
