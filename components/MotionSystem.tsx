'use client'

import {
  LazyMotion,
  domAnimation,
  MotionConfig,
  m,
  useReducedMotion,
  useAnimationControls,
  useScroll,
} from 'motion/react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { basePath } from '@/lib/path'

const ease = [0.22, 1, 0.36, 1] as const

/** A single animation system, including native links and browser back/forward. */
export function MotionSystem({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const reduced = useReducedMotion()
  const controls = useAnimationControls()
  const { scrollYProgress } = useScroll()
  const navigating = useRef(false)
  const previousPath = useRef(pathname)
  const recovery = useRef<ReturnType<typeof setTimeout> | null>(null)

  const enter = useCallback(() => {
    navigating.current = false
    if (recovery.current) clearTimeout(recovery.current)
    controls.set({ opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 })
    void controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : 0.5, ease },
    })
  }, [controls, reduced])

  useEffect(() => {
    if (previousPath.current === pathname) {
      controls.set({ opacity: 1, y: 0 })
      return
    }
    previousPath.current = pathname
    enter()
  }, [pathname, enter, controls])
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.target || anchor.hasAttribute('download')) return
      const url = new URL(anchor.href, location.href)
      if (url.origin !== location.origin || !url.pathname.startsWith(`${basePath}/`)) return
      if (url.pathname === location.pathname && url.search === location.search) return
      event.preventDefault()
      if (navigating.current) return
      navigating.current = true
      const destination = `${url.pathname.slice(basePath.length) || '/'}${url.search}${url.hash}`
      void controls
        .start({
          opacity: reduced ? 1 : 0,
          y: reduced ? 0 : -10,
          transition: { duration: reduced ? 0 : 0.18, ease },
        })
        .then(() => {
          router.push(destination)
          recovery.current = setTimeout(enter, 3500)
        })
    }
    function prefetch(event: PointerEvent) {
      const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.target) return
      const url = new URL(anchor.href, location.href)
      if (
        url.origin === location.origin &&
        url.pathname.startsWith(`${basePath}/`) &&
        url.pathname !== location.pathname
      )
        router.prefetch(url.pathname.slice(basePath.length) || '/')
    }
    document.addEventListener('click', onClick)
    document.addEventListener('pointerover', prefetch, { passive: true })
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('pointerover', prefetch)
      if (recovery.current) clearTimeout(recovery.current)
    }
  }, [router, controls, reduced, enter])

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <m.div className="scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
        <m.div data-page-stage initial={false} animate={controls}>
          {children}
        </m.div>
      </MotionConfig>
    </LazyMotion>
  )
}

export function Reveal({
  children,
  className = '',
  delay = 0,
  priority = false,
}: {
  children: ReactNode
  className?: string
  delay?: number
  priority?: boolean
}) {
  const reduced = useReducedMotion()
  return (
    <m.div
      data-motion
      className={className}
      initial={{ opacity: priority ? 1 : 0, y: priority ? 12 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: reduced ? 0 : 0.65,
        delay: reduced ? 0 : delay,
        ease,
      }}
    >
      {children}
    </m.div>
  )
}

export function CardMotion({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()
  return (
    <m.article
      className={className}
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
    >
      {children}
    </m.article>
  )
}
