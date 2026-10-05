"use client"
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { HeroScroll } from '@/components/motion/HeroScroll'

const ParticleName = dynamic(() => import('@/components/three/ParticleName'), { ssr: false })

const NAME_LINES = ['LOURDU', 'RAJU']

// SC.01 stage: the real <h1> paints first (LCP, SEO, and the hero for anyone without WebGL2),
// then the particle canvas loads on idle and the heading crossfades out behind it.
// HeroOverlay (the frame, tagline, CTAs and meta rows) is passed in as children. HeroScroll owns the
// scroll-out; the particle dissolve reads the same section's progress, both ticked by Lenis via Motion.
export function HeroStage({ children }: { children: React.ReactNode }) {
  const [loadCanvas, setLoadCanvas] = useState(false)
  const [particlesReady, setParticlesReady] = useState(false)
  const [portrait, setPortrait] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-aspect-ratio: 1/1)')
    const update = () => setPortrait(mq.matches)
    update()
    mq.addEventListener('change', update)

    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
    let idle: number | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    if (w.requestIdleCallback) idle = w.requestIdleCallback(() => setLoadCanvas(true), { timeout: 1200 })
    else timer = setTimeout(() => setLoadCanvas(true), 300)

    return () => {
      mq.removeEventListener('change', update)
      if (idle !== undefined) (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(idle)
      if (timer) clearTimeout(timer)
    }
  }, [])

  const onReady = useCallback(() => setParticlesReady(true), [])

  return (
    <HeroScroll sectionRef={sectionRef}>
      {loadCanvas && (
        <ParticleName
          key={portrait ? 'stacked' : 'single'}
          lines={portrait ? NAME_LINES : [NAME_LINES.join(' ')]}
          scrollTarget={sectionRef}
          {...(portrait ? { fitHeight: 0.3, offsetY: 0.1 } : {})}
          scrollDissolve
          onReady={onReady}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center px-4 portrait:items-start portrait:pt-[26svh]"
      >
        <h1
          className="font-display font-black uppercase text-text text-center leading-[0.92] tracking-[0.01em] text-[clamp(52px,13vw,200px)] transition-opacity duration-700"
          style={{ opacity: particlesReady ? 0 : 1 }}
        >
          <span className="block landscape:inline">Lourdu</span>{' '}
          <span className="block landscape:inline">Raju</span>
        </h1>
      </div>

      {children}
    </HeroScroll>
  )
}
