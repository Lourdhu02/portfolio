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
      stopInertiaOnNavigate: true,
      // Dialogs (menu, command palette) scroll natively inside themselves
      prevent: (node) => node.matches('[role="dialog"], [cmdk-list]'),
    })

    // Anything that locks the page (the menu sets body overflow, Radix dialogs set
    // data-scroll-locked) must also stop Lenis, which scrolls the root and ignores body overflow.
    const body = document.body
    const syncLock = () => {
      const locked = body.hasAttribute('data-scroll-locked') || body.style.overflow === 'hidden'
      if (locked) instance.stop()
      else instance.start()
    }
    const lockObserver = new MutationObserver(syncLock)
    lockObserver.observe(body, { attributes: true, attributeFilter: ['style', 'data-scroll-locked'] })

    // Same-page anchor links glide instead of jumping. Handled here rather than with Lenis's
    // `anchors` option so focus still moves to the target (the skip link relies on that).
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null
      if (!link || link.target === '_blank') return
      const url = new URL(link.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)))
      if (!target) return
      e.preventDefault()
      history.pushState(null, '', url.hash)
      // Next frame: a menu that closes on this click has released the scroll lock by then
      requestAnimationFrame(() => instance.scrollTo(target, { offset: -24 }))
      if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }
    // Capture phase, so this runs before next/link turns the click into a router navigation
    document.addEventListener('click', onClick, true)
    const tick = ({ timestamp }: { timestamp: number }) => instance.raf(timestamp)
    frame.update(tick, true)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Lenis needs the DOM, so it can only exist after mount
    setLenis(instance)
    return () => {
      cancelFrame(tick)
      document.removeEventListener('click', onClick, true)
      lockObserver.disconnect()
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
