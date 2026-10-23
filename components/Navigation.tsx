'use client'

import { useEffect, useRef, useState } from 'react'
import { LazyMotion, domAnimation, m, useAnimationControls, useReducedMotion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { withBase } from '@/lib/path'

const links = [
  { label: 'Selected work', href: '/#work', note: 'Systems in the real world' },
  { label: 'Writing', href: '/writing/', note: 'Notes from the work' },
  { label: 'About', href: '/about/', note: 'The person behind it' },
  { label: 'Elsewhere', href: '/#elsewhere', note: 'A few other corners' },
  { label: 'Get in touch', href: '/#contact', note: 'Start a conversation' },
]
const ease = [0.22, 1, 0.36, 1] as const

/** Native modal semantics provide focus containment and an inert background. */
export function Navigation() {
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const closing = useRef(false)
  const previousOverflow = useRef('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const controls = useAnimationControls()
  const reduced = useReducedMotion()
  const pathname = usePathname()

  useEffect(() => {
    const modal = dialog.current
    return () => {
      if (modal?.open) document.body.style.overflow = previousOverflow.current
    }
  }, [])

  function show() {
    if (!dialog.current || dialog.current.open) return
    previousOverflow.current = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current.showModal()
    controls.set('hidden')
    setOpen(true)
    void controls.start('visible')
  }

  async function close() {
    if (closing.current || !dialog.current?.open) return
    closing.current = true
    setOpen(false)
    await controls.start('exit')
    dialog.current?.close()
    document.body.style.overflow = previousOverflow.current
    trigger.current?.focus({ preventScroll: true })
    closing.current = false
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <button
        ref={trigger}
        type="button"
        className="menu-trigger"
        onClick={show}
        aria-label="Open navigation"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-haspopup="dialog"
      >
        <span className="mono">Menu</span>
        <span className="menu-glyph" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>
      <dialog
        ref={dialog}
        id="site-menu"
        className="menu-dialog"
        aria-labelledby="menu-title"
        onCancel={(event) => {
          event.preventDefault()
          void close()
        }}
      >
        <m.div
          className="menu-sheet"
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: reduced ? 0 : -24 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: reduced ? 0 : 0.45, ease },
            },
            exit: {
              opacity: 0,
              y: reduced ? 0 : -16,
              transition: { duration: reduced ? 0 : 0.22 },
            },
          }}
        >
          <div className="menu-topbar">
            <span className="mono" id="menu-title">
              Lourdhu Raju / Index
            </span>
            <button
              type="button"
              className="menu-close"
              onClick={() => void close()}
              aria-label="Close navigation"
            >
              <span className="mono">Close</span>
              <span className="menu-glyph" data-open={open} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </button>
          </div>
          <div className="menu-body">
            <div className="menu-art" aria-hidden="true">
              <div className="menu-art-caption mono">
                <span>Independent thinking.</span>
                <span>IN / 12.97° N</span>
              </div>
              <div className="menu-shutters">
                {Array.from({ length: 7 }, (_, i) => (
                  <m.i
                    key={i}
                    variants={{
                      hidden: { scaleY: reduced ? 1 : 0 },
                      visible: {
                        scaleY: 1,
                        transition: {
                          duration: reduced ? 0 : 0.7,
                          delay: reduced ? 0 : i * 0.035,
                          ease,
                        },
                      },
                      exit: {
                        scaleY: reduced ? 1 : 0,
                        transition: { duration: reduced ? 0 : 0.18 },
                      },
                    }}
                    style={{ height: `${38 + ((i + active) % 7) * 9}%` }}
                  />
                ))}
              </div>
              <div className="menu-art-bottom">
                <span className="menu-coordinate">0{active + 1}</span>
                <span className="mono">
                  {links[active].note}
                  <br />
                  Engineering with intent. ↗
                </span>
              </div>
            </div>
            <nav className="menu-links" aria-label="Main navigation">
              {links.map((link, index) => (
                <m.div
                  key={link.href}
                  className="menu-link-wrap"
                  variants={{
                    hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 28 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: reduced ? 0 : 0.55,
                        delay: reduced ? 0 : 0.1 + index * 0.045,
                        ease,
                      },
                    },
                    exit: {
                      opacity: 0,
                      transition: { duration: reduced ? 0 : 0.12 },
                    },
                  }}
                >
                  <a
                    href={withBase(link.href)}
                    onPointerEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onClick={() => void close()}
                    aria-current={
                      !link.href.includes('#') && pathname === link.href ? 'page' : undefined
                    }
                  >
                    <span className="menu-index mono">0{index + 1}</span>
                    <span className="menu-link-label">{link.label}</span>
                    <span className="menu-link-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </m.div>
              ))}
              <div className="menu-note mono">
                <span>Models. Systems. Independent thought.</span>
                <span>Bengaluru, India</span>
              </div>
            </nav>
          </div>
        </m.div>
      </dialog>
      <noscript>
        <nav className="fallback-nav" aria-label="Main navigation">
          {links.map((link) => (
            <a key={link.href} href={withBase(link.href)}>
              {link.label}
            </a>
          ))}
        </nav>
        <style>{'.menu-trigger,.theme-toggle{display:none}'}</style>
      </noscript>
    </LazyMotion>
  )
}
