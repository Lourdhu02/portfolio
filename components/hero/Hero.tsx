"use client"
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { m } from 'motion/react'
import { Magnetic } from '@/components/motion/Magnetic'
import { TRUTH } from '@/content/truth'
import { duration, ease } from '@/lib/tokens'

const ParticleName = dynamic(() => import('@/components/three/ParticleName'), { ssr: false })

const NAME_LINES = ['LOURDU', 'RAJU']
const ROLE_AT = 1.6 // s, the role line types in
const CTA_AT = 2.2 // s, CTAs fade in

// SC.01: the real <h1> paints first (LCP, SEO, no-WebGL fallback); the particle canvas loads
// after idle and the h1 fades out once the particles are on screen.
export function Hero() {
  const [loadCanvas, setLoadCanvas] = useState(false)
  const [particlesReady, setParticlesReady] = useState(false)
  const [portrait, setPortrait] = useState(false)

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
  const role = `${TRUTH.identity.role} · ${TRUTH.identity.mission.replace(/\.$/, '')}`

  return (
    <section className="relative h-[100svh] w-full overflow-hidden" aria-labelledby="hero-name">
      {loadCanvas && (
        <ParticleName
          key={portrait ? 'stacked' : 'single'}
          lines={portrait ? NAME_LINES : [NAME_LINES.join(' ')]}
          className="fixed inset-0"
          scrollDissolve
          onReady={onReady}
        />
      )}

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pointer-events-none">
        <h1
          id="hero-name"
          className="font-display font-black uppercase text-text text-center leading-[0.92] tracking-[0.01em] text-[clamp(64px,13vw,200px)] transition-opacity duration-700"
          style={{ opacity: particlesReady ? 0 : 1 }}
        >
          <span className="block landscape:inline">Lourdu</span>{' '}
          <span className="block landscape:inline">Raju</span>
        </h1>
      </div>

      <div className="absolute inset-x-0 bottom-[10svh] z-10 flex flex-col items-center gap-8 px-4 text-center">
        <p className="font-mono text-xs sm:text-sm tracking-[0.12em] uppercase text-muted max-w-[60ch]">
          {/* CSS-driven so the full line is in the HTML and reduced motion shows it at once */}
          <span className="sr-only">{role}</span>
          {role.split('').map((ch, i) => (
            <span key={i} aria-hidden="true" className="type-char" style={{ animationDelay: `${ROLE_AT + i * 0.018}s` }}>
              {ch}
            </span>
          ))}
        </p>

        <m.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.reveal, ease: ease.out, delay: CTA_AT }}
        >
          <Magnetic>
            <Link
              href="/#work"
              className="cut-corner inline-block bg-accent px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#ff5f6c] active:scale-[0.98]"
            >
              See the work
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              href="/lab"
              className="cut-corner inline-block border border-line px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-text transition-colors hover:border-text active:scale-[0.98]"
            >
              Run the lab
            </Link>
          </Magnetic>
        </m.div>
      </div>
    </section>
  )
}
