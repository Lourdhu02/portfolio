"use client"
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useLenis } from '@/components/motion/SmoothScroll'
import { usePerformanceTier, usePrefersReducedMotion } from '@/components/three/tiers'
import type { StageState } from './Robots'
import type { Bot } from './types'

const RobotScene = dynamic(() => import('./RobotScene'), { ssr: false })

// Selected Work as one pinned, scroll-driven scene. The section is several screens tall and
// its stage sticks to the viewport while you scroll through it: first a wide shot of the crew,
// then the camera flies to each robot in turn while its project slides in on the left.
// Desktops with a capable GPU get the real three.js scene; phones and low-end devices get a
// 2.5D version made from pre-rendered robots, so the page never ships three.js to a phone.
// Reduced motion skips the pin entirely and shows the four robots as a plain list.

// Scroll progress → camera stop. Each robot holds still for the first part of its stretch of
// scroll, so you can read its card, and the flight to the next robot takes the rest.
function stopFor(p: number, n: number) {
  const u = Math.min(n, Math.max(0, p * n))
  const i = Math.floor(u)
  const frac = u - i
  return i + Math.min(1, Math.max(0, (frac - 0.3) / 0.55))
}
const desktopQuery = '(hover: hover) and (pointer: fine) and (min-width: 1024px)'
const noop = () => () => {}
const isDesktop = () => window.matchMedia(desktopQuery).matches

const progressFor = (stop: number, n: number) => (stop === 0 ? 0 : (stop - 1 + 0.9) / n)

export function RobotStage({ bots }: { bots: Bot[] }) {
  const tier = usePerformanceTier()
  const reduced = usePrefersReducedMotion()
  const lenis = useLenis()
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const state = useRef<StageState>({ s: 0, px: 0, py: 0 })
  const [current, setCurrent] = useState(-1)
  const [near, setNear] = useState(false)
  const desktop = useSyncExternalStore(noop, isDesktop, () => false)
  const n = bots.length
  const real3d = desktop && (tier === 'high' || tier === 'medium')

  useEffect(() => {
    const el = wrap.current
    if (!el || reduced) return
    // Load and run the scene only while the section is on or near the screen
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '50% 0px' })
    io.observe(el)

    let frame = 0
    const update = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)))
      const s = stopFor(p, n)
      state.current.s = s
      setCurrent(Math.round(s) - 1)
      // 2.5D: slide the strip of robots so the one in focus sits on the right
      if (track.current) track.current.style.setProperty('--s', s.toFixed(4))
    }
    const request = () => { if (!frame) frame = requestAnimationFrame(update) }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      state.current.px = (e.clientX / window.innerWidth) * 2 - 1
      state.current.py = (e.clientY / window.innerHeight) * 2 - 1
    }
    update()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
      window.removeEventListener('pointermove', onMove)
    }
  }, [n, reduced])

  function goTo(stop: number) {
    const el = wrap.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const y = top + progressFor(stop, n) * (el.offsetHeight - window.innerHeight)
    if (lenis) lenis.scrollTo(y, { duration: 1.4 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }

  if (reduced) {
    return (
      <ul className="grid gap-px px-5 sm:grid-cols-2 sm:px-10 lg:grid-cols-4 lg:px-16">
        {bots.map((bot) => (
          <li key={bot.name}>
            <BotCard bot={bot} index={bots.indexOf(bot)} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div ref={wrap} className="relative" style={{ height: `${(n + 1) * 100}svh` }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* The scene */}
        {real3d ? (
          <div className="absolute inset-0" aria-hidden="true">
            {near && <RobotScene bots={bots} state={state} active={near} />}
          </div>
        ) : (
          <div ref={track} aria-hidden="true" className="robot-track absolute inset-0" style={{ '--s': 0 } as React.CSSProperties}>
            {bots.map((bot, i) => (
              <div key={bot.name} className="robot-sprite" style={{ '--i': i + 1, '--glow': bot.glow } as React.CSSProperties}>
                <span className="robot-sprite__halo keep-round" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/robots/${bot.kind}.webp`} alt="" width={560} height={560} loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        )}

        {/* Intro line over the wide shot */}
        <div
          className="pointer-events-none absolute left-5 top-[calc(4.5rem+env(safe-area-inset-top))] max-w-md transition-[opacity,transform] duration-500 sm:left-10 lg:left-16 lg:top-auto lg:bottom-[16vh]"
          style={{ opacity: current < 0 ? 1 : 0, transform: `translateY(${current < 0 ? 0 : -16}px)` }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">The crew</p>
          <p className="mt-3 font-display text-4xl uppercase leading-[0.9] sm:text-6xl">Four robots.<br />Four projects.</p>
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted">Scroll to meet them ↓</p>
        </div>

        {/* The robot in focus: its card slides in on the left */}
        {bots.map((bot, i) => (
          <div
            key={bot.name}
            inert={current !== i}
            className="absolute bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-5 right-5 transition-[opacity,transform] duration-500 ease-out sm:left-10 sm:right-auto sm:w-[26rem] lg:bottom-auto lg:left-16 lg:top-1/2 lg:w-[30rem] lg:-translate-y-1/2"
            style={{ opacity: current === i ? 1 : 0, translate: `${current === i ? 0 : current > i ? -40 : 40}px 0` }}
          >
            <BotCard bot={bot} index={i} />
          </div>
        ))}

        {/* Crew rail: jump straight to a robot */}
        <nav aria-label="Robots" className="absolute right-5 top-[calc(4.5rem+env(safe-area-inset-top))] flex gap-1 sm:right-10 lg:right-16 lg:top-1/2 lg:-translate-y-1/2 lg:flex-col">
          {bots.map((bot, i) => (
            <button
              key={bot.name}
              type="button"
              onClick={() => goTo(i + 1)}
              aria-label={`Go to ${bot.name}`}
              aria-current={current === i ? 'true' : undefined}
              className="group flex items-center gap-2 p-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-text aria-[current]:text-text lg:justify-end"
            >
              <span className="hidden lg:inline">{bot.name}</span>
              <span className="block h-2 w-2 border border-current transition-colors group-aria-[current]:bg-[var(--glow)]" style={{ '--glow': bot.glow } as React.CSSProperties} />
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

function BotCard({ bot, index }: { bot: Bot; index: number }) {
  return (
    <Link
      href={bot.project.href}
      data-cursor="view"
      data-cursor-label={`Visit ${bot.name}`}
      className="glass shape-a group block p-5 outline-none transition-[border-color] duration-300 hover:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent sm:p-7"
      style={{ '--glow': bot.glow } as React.CSSProperties}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        0{index + 1} · <span className="text-[var(--glow)]">{bot.model}</span>
      </span>
      <div className="mt-1 flex items-end justify-between gap-4">
        <h3 className="font-display text-6xl uppercase leading-[0.85] tracking-tight sm:text-7xl">{bot.name}</h3>
        <span aria-hidden="true" className="mb-1 grid h-10 w-10 shrink-0 place-items-center border border-line transition-all duration-300 group-hover:-rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-bg">→</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-text/80">{bot.job}</p>
      <div className="mt-4 border-t border-line pt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Runs</span>
        <span className="mt-1 block font-display text-2xl uppercase leading-none">{bot.project.title}</span>
        <p className="mt-2 hidden text-[13px] leading-relaxed text-text/65 sm:block">{bot.project.summary}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {bot.project.tags.map((t) => (
            <li key={t} className="border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">{t}</li>
          ))}
        </ul>
      </div>
    </Link>
  )
}
