"use client"
import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cancelFrame, frame } from 'motion/react'
import Lenis from 'lenis'

const LenisContext = createContext<Lenis | null>(null)

export const useLenis = () => useContext(LenisContext)

// Inertial scroll for the whole document. Lenis is ticked from Motion's frame loop so
// scroll position and every useScroll-driven transform update in the same frame.
// Lenis drops smoothing on its own under prefers-reduced-motion, and touch keeps native scroll.
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const instance = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      anchors: { offset: -24 },
      stopInertiaOnNavigate: true,
    })
    const tick = ({ timestamp }: { timestamp: number }) => instance.raf(timestamp)
    frame.update(tick, true)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Lenis needs the DOM, so it can only exist after mount
    setLenis(instance)
    return () => {
      cancelFrame(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  // New route: drop any leftover inertia and start at the top, unless the URL targets an anchor
  useEffect(() => {
    if (!lenis || window.location.hash) return
    lenis.scrollTo(0, { immediate: true, force: true })
  }, [lenis, pathname])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
