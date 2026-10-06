"use client"
import Link from 'next/link'
import { m, AnimatePresence, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Magnetic } from '@/components/motion/Magnetic'
import { openPalette } from '@/lib/interaction'
import { useModKey } from '@/lib/useMediaQuery'
import { duration, ease } from '@/lib/tokens'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const links = [
  { label: 'Work', href: '/#work' },
  { label: 'Lab', href: '/lab' },
  { label: 'Writing', href: '/writing' },
  { label: 'About', href: '/about' },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const mod = useModKey()
  const menuButton = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState(false)
  const { scrollY } = useScroll()

  // Tuck the bar away while reading down the page; bring it back on any upward scroll
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > 160 && y > prev)
  })

  // Modal menu: lock scroll, focus the first link, trap Tab, Esc closes, focus returns.
  useEffect(() => {
    if (!isOpen) return
    const trigger = menuButton.current
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>('a')?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      const items = [...panel.current.querySelectorAll<HTMLElement>('a, button')]
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      trigger?.focus()
    }
  }, [isOpen])

  return (
    <>
      <m.nav
        className="site-nav fixed top-0 left-0 w-full z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5 pointer-events-none"
        animate={{ y: hidden && !isOpen ? '-110%' : '0%' }}
        transition={{ duration: duration.reveal * 0.6, ease: ease.out }}
      >
        {/* Floating glass bar over the page's cube lattice */}
        <div className="glass pointer-events-auto mx-auto flex h-14 w-full max-w-7xl items-center justify-between rounded-full pl-5 pr-4 sm:pl-6 sm:pr-5">
        <Link href="/" aria-label="Lourdu Raju, home" className="font-display text-2xl text-text hover:text-accent transition-colors min-h-11 min-w-11 flex items-center">
          LR
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Magnetic strength={8}>
            <button
              type="button"
              onClick={openPalette}
              aria-label="Open command menu"
              aria-keyshortcuts="Meta+K Control+K"
              className="hidden sm:flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-text hover:text-accent transition-colors"
            >
              <span className="rounded-[4px] border border-text/30 px-1.5 py-0.5 text-[10px]">{mod} K</span>
              <span>Search</span>
            </button>
          </Magnetic>
          <Magnetic strength={8}>
            <ThemeToggle className="-mx-2 hover:text-accent transition-colors" />
          </Magnetic>
          <Magnetic strength={8}>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setIsOpen(true)}
              aria-expanded={isOpen}
              aria-controls="site-menu"
              className="font-mono text-xs uppercase tracking-widest text-text hover:text-accent transition-colors min-h-11 px-2 -mr-2"
            >
              [ Menu ]
            </button>
          </Magnetic>
        </div>
        </div>
      </m.nav>

      <AnimatePresence>
        {isOpen && (
          <m.div
            ref={panel}
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-bg/90 backdrop-blur-md flex flex-col items-center justify-center pb-[env(safe-area-inset-bottom)]"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-2 sm:top-6 sm:right-4 min-h-11 px-2 font-mono text-xs uppercase tracking-widest text-text hover:text-accent transition-colors"
            >
              [ Close ]
            </button>
            {/* Hovering one link dims the rest */}
            <ul className="group/menu flex flex-col space-y-8 items-center">
              {links.map((link, idx) => (
                <m.li
                  key={link.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="group/link flex items-baseline gap-4 font-display text-6xl md:text-8xl transition-[color,opacity] duration-300 group-hover/menu:opacity-30 hover:!opacity-100 hover:text-accent focus-visible:text-accent"
                  >
                    <span className="font-mono text-xs text-muted transition-colors group-hover/link:text-accent">0{idx + 1}</span>
                    {link.label}
                  </Link>
                </m.li>
              ))}
            </ul>
            <p className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] hidden sm:block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Tip: press {mod} K anywhere
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
