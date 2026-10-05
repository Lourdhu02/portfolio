"use client"
import { Children, useEffect, useRef, useState } from 'react'

interface SnapRailProps {
  children: React.ReactNode;
  label: string;
  // Classes for the lg+ layout; below lg the children sit in a swipeable row
  desktopClassName?: string;
}

// A card row that swipes on phones (scroll-snap, next card peeking in) and becomes a plain grid from lg up.
export function SnapRail({ children, label, desktopClassName = 'lg:grid-cols-2 lg:gap-12' }: SnapRailProps) {
  const ref = useRef<HTMLDivElement>(null)
  const count = Children.count(children)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const first = el.firstElementChild as HTMLElement | null
        if (!first) return
        const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0')
        setIndex(Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / step))))
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [count])

  const goTo = (i: number) => {
    const el = ref.current
    const card = el?.children[i] as HTMLElement | undefined
    const first = el?.firstElementChild as HTMLElement | null | undefined
    if (el && card && first) el.scrollTo({ left: card.offsetLeft - first.offsetLeft, behavior: 'smooth' })
  }

  return (
    <div>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        className={`snap-rail -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 scroll-px-4 pb-1 sm:-mx-6 sm:px-6 sm:scroll-px-6 lg:mx-0 lg:grid lg:snap-none lg:overflow-visible lg:px-0 lg:pb-0 ${desktopClassName}`}
      >
        {Children.map(children, (child) => (
          <div className="w-[84%] shrink-0 snap-start sm:w-[60%] lg:contents">{child}</div>
        ))}
      </div>

      {/* Position indicator, phones and tablets only */}
      <div className="mt-6 flex items-center justify-between lg:hidden" aria-hidden="true">
        <div className="flex gap-1.5">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              tabIndex={-1}
              onClick={() => goTo(i)}
              className="flex h-6 items-center"
            >
              <span className={`block h-[3px] rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-accent' : 'w-3 bg-line'}`} />
            </button>
          ))}
        </div>
        <span className="font-mono text-[11px] tabular-nums uppercase tracking-widest text-muted">
          {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          <span className="ml-3 text-muted/60">Swipe →</span>
        </span>
      </div>
    </div>
  )
}
